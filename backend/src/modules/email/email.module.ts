import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EMAIL_PROVIDER } from './email.types';
import { ConsoleEmailProvider } from './providers/console.provider';
import { ResendEmailProvider } from './providers/resend.provider';
import { SendgridEmailProvider } from './providers/sendgrid.provider';
import { SesEmailProvider } from './providers/ses.provider';
import { SmtpEmailProvider } from './providers/smtp.provider';

@Module({
  controllers: [EmailController],
  providers: [
    ConsoleEmailProvider,
    SmtpEmailProvider,
    ResendEmailProvider,
    SendgridEmailProvider,
    SesEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      inject: [
        ConfigService,
        ConsoleEmailProvider,
        SmtpEmailProvider,
        ResendEmailProvider,
        SendgridEmailProvider,
        SesEmailProvider,
      ],
      useFactory: (
        config: ConfigService,
        consoleProvider: ConsoleEmailProvider,
        smtp: SmtpEmailProvider,
        resend: ResendEmailProvider,
        sendgrid: SendgridEmailProvider,
        ses: SesEmailProvider,
      ) => {
        const name = (
          config.get<string>('email.provider') ?? 'console'
        ).toLowerCase();
        switch (name) {
          case 'smtp':
            return smtp;
          case 'resend':
            return resend;
          case 'sendgrid':
            return sendgrid;
          case 'ses':
            return ses;
          default:
            return consoleProvider;
        }
      },
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
