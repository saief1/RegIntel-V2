import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';
import * as tls from 'tls';
import { EmailMessage, EmailProvider, EmailSendResult } from '../email.types';

/**
 * Minimal SMTP client (no external dependency). Supports plain + STARTTLS-ish
 * secure sockets when SMTP_SECURE=true. Falls back to console-style success
 * logging when host is unreachable in local/dev.
 */
@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';
  private readonly logger = new Logger(SmtpEmailProvider.name);

  constructor(private readonly config: ConfigService) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const host = this.config.get<string>('email.smtpHost') ?? 'localhost';
    const port = this.config.get<number>('email.smtpPort') ?? 1025;
    const secure = this.config.get<boolean>('email.smtpSecure') ?? false;
    const user = this.config.get<string>('email.smtpUser') ?? '';
    const pass = this.config.get<string>('email.smtpPass') ?? '';

    try {
      await this.deliver({ host, port, secure, user, pass, message });
      const messageId = `smtp-${Date.now()}`;
      return { ok: true, provider: this.name, messageId };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'smtp_failed';
      this.logger.warn(`SMTP send failed: ${err}`);
      return { ok: false, provider: this.name, error: err };
    }
  }

  async healthCheck(): Promise<'up' | 'down' | 'unconfigured'> {
    const host = this.config.get<string>('email.smtpHost');
    if (!host) return 'unconfigured';
    const port = this.config.get<number>('email.smtpPort') ?? 1025;
    return new Promise((resolve) => {
      const socket = net.connect({ host, port }, () => {
        socket.end();
        resolve('up');
      });
      socket.setTimeout(1500, () => {
        socket.destroy();
        resolve('down');
      });
      socket.on('error', () => resolve('down'));
    });
  }

  private deliver(opts: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    message: EmailMessage;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket: net.Socket = opts.secure
        ? tls.connect({
            host: opts.host,
            port: opts.port,
            servername: opts.host,
          })
        : net.connect({ host: opts.host, port: opts.port });

      let buffer = '';
      let step = 0;
      const from = `${opts.message.fromName} <${opts.message.fromAddress}>`;
      const commands = [
        `EHLO regintel.local`,
        opts.user ? `AUTH LOGIN` : null,
        opts.user ? Buffer.from(opts.user).toString('base64') : null,
        opts.user ? Buffer.from(opts.pass).toString('base64') : null,
        `MAIL FROM:<${opts.message.fromAddress}>`,
        `RCPT TO:<${opts.message.to}>`,
        `DATA`,
        [
          `From: ${from}`,
          `To: ${opts.message.to}`,
          `Subject: ${opts.message.subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/plain; charset=utf-8`,
          ``,
          opts.message.text,
          `.`,
        ].join('\r\n'),
        `QUIT`,
      ].filter((c): c is string => Boolean(c));

      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        if (!buffer.includes('\n')) return;
        buffer = '';
        if (step >= commands.length) {
          socket.end();
          resolve();
          return;
        }
        socket.write(`${commands[step++]}\r\n`);
      };

      socket.on('data', onData);
      socket.on('error', reject);
      socket.setTimeout(5000, () => {
        socket.destroy();
        reject(new Error('SMTP timeout'));
      });
      socket.on('end', () => resolve());
    });
  }
}
