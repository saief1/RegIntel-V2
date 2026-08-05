import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailMessage, EmailProvider, EmailSendResult } from '../email.types';

@Injectable()
export class SendgridEmailProvider implements EmailProvider {
  readonly name = 'sendgrid';
  private readonly logger = new Logger(SendgridEmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const apiKey = this.config.get<string>('email.sendgridApiKey') ?? '';
    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        error: 'SENDGRID_API_KEY missing',
      };
    }
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: message.fromAddress, name: message.fromName },
          subject: message.subject,
          content: [
            { type: 'text/plain', value: message.text },
            { type: 'text/html', value: message.html },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, provider: this.name, error: body.slice(0, 500) };
      }
      return {
        ok: true,
        provider: this.name,
        messageId: res.headers.get('x-message-id') ?? `sendgrid-${Date.now()}`,
      };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'sendgrid_failed';
      this.logger.warn(err);
      return { ok: false, provider: this.name, error: err };
    }
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured'> {
    const apiKey = this.config.get<string>('email.sendgridApiKey');
    return Promise.resolve(apiKey ? 'up' : 'unconfigured');
  }
}
