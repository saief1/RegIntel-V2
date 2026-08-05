import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailMessage, EmailProvider, EmailSendResult } from '../email.types';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend';
  private readonly logger = new Logger(ResendEmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const apiKey = this.config.get<string>('email.resendApiKey') ?? '';
    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        error: 'RESEND_API_KEY missing',
      };
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${message.fromName} <${message.fromAddress}>`,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, provider: this.name, error: body.slice(0, 500) };
      }
      const json = (await res.json()) as { id?: string };
      return { ok: true, provider: this.name, messageId: json.id };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'resend_failed';
      this.logger.warn(err);
      return { ok: false, provider: this.name, error: err };
    }
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured'> {
    const apiKey = this.config.get<string>('email.resendApiKey');
    return Promise.resolve(apiKey ? 'up' : 'unconfigured');
  }
}
