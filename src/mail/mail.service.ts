import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ISendMailArgs {
  href: string;
  thumbnail: string;
  email: string;
}

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {}

  HTML = readFileSync(join(__dirname, 'template.html')).toString();

  async sendMail({ href, thumbnail, email }: ISendMailArgs) {
    const resp = await sgMail.send({
      to: email,
      from: this.configService.get('EMAIL_FROM'),
      subject: 'Your video from Dell Security Challenge',
      text: `See your video here: ${href}`,
      html: this.getHTML({ href, thumbnail }),
      mailSettings: {
        sandboxMode: {
          enable: !!this.configService.get('SENDGRID_SANDBOX'),
        },
      },
    });
  }

  private getHTML({ href, thumbnail }) {
    const html = this.HTML.replace('{{LINK}}', href).replace(
      '{{THUMBNAIL}}',
      thumbnail,
    );
    return html;
  }

  onModuleInit() {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }
}
