import type { IEmailService } from '@jonji/domain'

export class ResendEmailService implements IEmailService {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendOTP(to: string, code: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to,
        subject: `Your Jonji code: ${code}`,
        text: `Your Jonji verification code is: ${code}\n\nExpires in 10 minutes.\nIf you did not request this, ignore this email.`,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      let message = `Resend error ${response.status}`
      try {
        const json = JSON.parse(text)
        message = json.message || json.error?.message || message
      } catch {}
      throw new Error(message)
    }
  }
}
