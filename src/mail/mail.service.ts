import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { VerifyMailDto } from './dto/verify-email.dto';
import { WelcomeMailDto } from './dto/welcome-mail.dto';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mailer') private mailerQueue: Queue) {}

  async sendWelcomeEmail(dto: WelcomeMailDto) {
    return this.mailerQueue.add(
      'welcome-email',
      {
        ...dto,
        action_url: dto.url,
        year: new Date().getFullYear(),
      },
      {
        removeOnComplete: {
          age: 300, //delete after 5 min
          count: 100, //force delete on store 100
        },
        removeOnFail: {
          age: 300, //delete after 5 min
        },
      },
    );
  }
  async verifyEmail(dto: VerifyMailDto) {
    return this.mailerQueue.add(
      'verify-email',
      {
        ...dto,
        year: new Date().getFullYear(),
      },
      {
        removeOnComplete: {
          age: 300,
          count: 100,
        },
        removeOnFail: {
          age: 300,
        },
      },
    );
  }
}
