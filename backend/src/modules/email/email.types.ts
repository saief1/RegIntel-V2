export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromAddress: string;
  fromName: string;
  tags?: Record<string, string>;
};

export type EmailSendResult = {
  ok: boolean;
  provider: string;
  messageId?: string;
  error?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
  healthCheck(): Promise<'up' | 'down' | 'unconfigured'>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export const SYSTEM_EMAIL_TEMPLATES = [
  {
    key: 'welcome',
    name: 'Welcome',
    subject: 'Welcome to {{orgName}}, {{name}}',
    htmlBody:
      '<p>Hi {{name}},</p><p>Welcome to <strong>{{orgName}}</strong> on RegIntel.</p>',
    textBody: 'Hi {{name}}, Welcome to {{orgName}} on RegIntel.',
    variables: ['name', 'orgName'],
  },
  {
    key: 'password_reset',
    name: 'Password reset',
    subject: 'Reset your RegIntel password',
    htmlBody:
      '<p>Hi {{name}},</p><p>Reset your password using this link: <a href="{{resetUrl}}">{{resetUrl}}</a></p>',
    textBody: 'Hi {{name}}, Reset your password: {{resetUrl}}',
    variables: ['name', 'resetUrl'],
  },
  {
    key: 'mfa',
    name: 'MFA code',
    subject: 'Your RegIntel verification code',
    htmlBody: '<p>Your verification code is <strong>{{code}}</strong>.</p>',
    textBody: 'Your verification code is {{code}}.',
    variables: ['code'],
  },
  {
    key: 'invitation',
    name: 'Organization invitation',
    subject: 'You are invited to {{orgName}}',
    htmlBody:
      '<p>{{inviterName}} invited you to join <strong>{{orgName}}</strong>.</p><p><a href="{{inviteUrl}}">Accept invitation</a></p>',
    textBody:
      '{{inviterName}} invited you to {{orgName}}. Accept: {{inviteUrl}}',
    variables: ['inviterName', 'orgName', 'inviteUrl'],
  },
  {
    key: 'task_assignment',
    name: 'Task assignment',
    subject: 'Task assigned: {{taskTitle}}',
    htmlBody:
      '<p>You were assigned <strong>{{taskTitle}}</strong>.</p><p><a href="{{taskUrl}}">Open task</a></p>',
    textBody: 'You were assigned {{taskTitle}}. Open: {{taskUrl}}',
    variables: ['taskTitle', 'taskUrl'],
  },
  {
    key: 'approval',
    name: 'Approval request',
    subject: 'Approval needed: {{itemTitle}}',
    htmlBody:
      '<p>Please review and approve <strong>{{itemTitle}}</strong>.</p><p><a href="{{itemUrl}}">Review</a></p>',
    textBody: 'Please approve {{itemTitle}}: {{itemUrl}}',
    variables: ['itemTitle', 'itemUrl'],
  },
  {
    key: 'policy_review_reminder',
    name: 'Policy review reminder',
    subject: 'Policy review due: {{policyTitle}}',
    htmlBody:
      '<p>Policy <strong>{{policyTitle}}</strong> is due for review by {{dueDate}}.</p>',
    textBody: 'Policy {{policyTitle}} is due for review by {{dueDate}}.',
    variables: ['policyTitle', 'dueDate'],
  },
  {
    key: 'daily_digest',
    name: 'Daily digest',
    subject: 'Your daily RegIntel digest',
    htmlBody: '<p>Daily summary for {{orgName}}:</p><pre>{{summary}}</pre>',
    textBody: 'Daily summary for {{orgName}}:\n{{summary}}',
    variables: ['orgName', 'summary'],
  },
  {
    key: 'weekly_digest',
    name: 'Weekly digest',
    subject: 'Your weekly RegIntel digest',
    htmlBody: '<p>Weekly summary for {{orgName}}:</p><pre>{{summary}}</pre>',
    textBody: 'Weekly summary for {{orgName}}:\n{{summary}}',
    variables: ['orgName', 'summary'],
  },
  {
    key: 'security_alert',
    name: 'Security alert',
    subject: 'Security alert: {{alertTitle}}',
    htmlBody:
      '<p><strong>{{alertTitle}}</strong></p><p>{{detail}}</p><p>Severity: {{severity}}</p>',
    textBody:
      'Security alert: {{alertTitle}}\n{{detail}}\nSeverity: {{severity}}',
    variables: ['alertTitle', 'detail', 'severity'],
  },
] as const;

export type SystemTemplateKey = (typeof SYSTEM_EMAIL_TEMPLATES)[number]['key'];
