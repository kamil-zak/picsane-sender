import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

interface ISendMailArgs {
  href: string;
  thumbnail: string;
  email: string;
}

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  HTML = readFileSync(join(__dirname, '..', '..', 'template.html')).toString();

  transporter = nodemailer.createTransport({
    host: 'mail.your-server.de',
    port: 587,
    secure: false,
    auth: {
      user: this.configService.get('FROM_EMAIL'),
      pass: this.configService.get('EMAIL_PASSWORD'),
    },
  });

  async sendMail({ href, thumbnail, email }: ISendMailArgs) {
    await this.transporter.sendMail({
      from: `"${this.configService.get('FROM_NAME')}" <${this.configService.get(
        'FROM_EMAIL',
      )}>`,
      to: email,
      subject: this.configService.get('EMAIL_SUBJECT'),
      text: `See your video here: ${href}`,
      html: this.getHTML({ href, thumbnail }),
    });
  }

  private getHTML({ href, thumbnail }) {
    const html = this.HTML.replace('{{LINK}}', href).replace(
      '{{THUMBNAIL}}',
      thumbnail,
    );
    return html;
  }
}
