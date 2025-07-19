import { MailerService } from '@nestjs-modules/mailer';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

export class MailProcessor extends WorkerHost {
  constructor(private mailerService: MailerService) {
    super();
  }
  async process(
    job: Job<{
      to: string;
      name: string;
      url: string;
      year: number;
    }>,
  ): Promise<any> {
    const { to, name, url, year } = job.data;

    if (job.name === 'welcome-email') {
      return await this.mailerService.sendMail({
        to,
        subject: 'Welcome To Chatty',
        template: 'welcome',
        context: { name, action_url: url, year },
      });
    }
    if (job.name === 'verify-email') {
      return await this.mailerService.sendMail({
        to,
        subject: 'Verify Email - Chatty',
        template: 'verify-email',
        context: { name, verifyUrl: url, year },
      });
    }
  }
}
