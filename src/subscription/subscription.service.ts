import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

interface IItem {
  name: string;
  thumbnail: string;
  href: string;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  isWorking = false;

  async subscribe({
    item,
    email,
    agree,
  }: {
    item: string;
    email: string;
    agree: boolean;
  }) {
    const subscription = this.subscriptionRepository.create({
      item,
      email,
      agree,
    });
    await this.subscriptionRepository.save(subscription);
  }

  private async getWaiting() {
    const subscriptions = await this.subscriptionRepository.find({
      where: { isSended: false },
    });
    return subscriptions;
  }

  async getAgree() {
    const subscriptions = await this.subscriptionRepository.find({
      where: { agree: true },
    });
    return subscriptions.map((sub) => sub.email);
  }

  async getAll() {
    const subscriptions = await this.subscriptionRepository.find();
    return subscriptions;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async handleCron() {
    if (this.isWorking) return;
    this.isWorking = true;
    try {
      await this.check();
    } catch (e) {}
    this.isWorking = false;
  }

  private async check() {
    const galleryName = this.configService.get('GALLERY_NAME');
    const { data } = await axios.get(
      `https://picsane.pl/${galleryName}?file_list_all`,
    );
    const items = data.data as IItem[];
    const waiting = await this.getWaiting();

    for (const waitingItem of waiting) {
      const item = items.find((item) => item.name === waitingItem.item);
      if (item) {
        try {
          const { href, thumbnail } = item;
          const { email } = waitingItem;
          await this.mailService.sendMail({ href, thumbnail, email });
        } catch (e) {
          waitingItem.errorMessage = e.message;
        } finally {
          waitingItem.isSended = true;
          await this.subscriptionRepository.save(waitingItem);
        }
      }
    }
  }
}
