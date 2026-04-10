import { Resend } from 'resend';
import type { IEmailService } from '@jonji/domain';

export class ResendEmailService implements IEmailService {
  private readonly client: Resend;

  constructor(apiKey: string, private readonly from: string) {
    this.client = new Resend(apiKey);
  }

  async sendOTP(to: string, code: string): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to,
      subject: `Your Jonji code: ${code}`,
      text: `Your Jonji verification code is: ${code}\n\nExpires in 10 minutes.\nIf you did not request this, ignore this email.`,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
  }
}
