import { Injectable, Logger } from '@nestjs/common';
import { EmailMessage, EmailProvider, EmailSendResult } from '../email.types';

@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console';
  private readonly logger = new Logger(ConsoleEmailProvider.name);

  send(message: EmailMessage): Promise<EmailSendResult> {
    const messageId = `console-${Date.now()}`;
    this.logger.log(
      JSON.stringify({
        email: true,
        provider: this.name,
        messageId,
        to: message.to,
        subject: message.subject,
        text: message.text,
      }),
    );
    return Promise.resolve({ ok: true, provider: this.name, messageId });
  }

  healthCheck(): Promise<'up' | 'down' | 'unconfigured'> {
    return Promise.resolve('up');
  }
}
