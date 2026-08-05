import { PromptKind } from '@prisma/client';

export type BuiltinPrompt = {
  key: string;
  name: string;
  kind: PromptKind;
  description: string;
  template: string;
  variables: string[];
};

export const BUILTIN_PROMPTS: BuiltinPrompt[] = [
  {
    key: 'system.default',
    name: 'Default system',
    kind: PromptKind.SYSTEM,
    description: 'Base system prompt for RegIntel AI Workspace',
    template:
      'You are RegIntel, a compliance intelligence assistant for {{orgName}}. Be precise, cite uncertainty, and prefer actionable next steps. Role context: {{role}}.',
    variables: ['orgName', 'role'],
  },
  {
    key: 'workspace.chat',
    name: 'Workspace chat',
    kind: PromptKind.WORKSPACE,
    description: 'Default chat mode orchestration prompt',
    template:
      'Mode: chat. Answer the user with concise compliance guidance.\n\nContext:\n{{context}}\n\nConversation:\n{{history}}\n\nUser: {{userMessage}}',
    variables: ['context', 'history', 'userMessage'],
  },
  {
    key: 'role.compliance_officer',
    name: 'Compliance officer role',
    kind: PromptKind.ROLE,
    description: 'Tone and priorities for compliance officers',
    template:
      'Respond as a senior compliance officer. Prioritize regulatory risk, evidence, and auditability.',
    variables: [],
  },
  {
    key: 'agent.monitor',
    name: 'Monitoring agent',
    kind: PromptKind.AGENT,
    description: 'Agent-style monitoring prompt (foundation only)',
    template:
      'You are a monitoring agent. Summarize signals and recommend human review thresholds.\nSignals:\n{{signals}}',
    variables: ['signals'],
  },
  {
    key: 'policy.review',
    name: 'Policy review',
    kind: PromptKind.POLICY,
    description: 'Policy gap analysis',
    template:
      'Review the policy excerpt for gaps against {{framework}}.\n\nPolicy:\n{{policyText}}\n\nKnown changes:\n{{changes}}',
    variables: ['framework', 'policyText', 'changes'],
  },
  {
    key: 'report.executive',
    name: 'Executive report',
    kind: PromptKind.REPORT,
    description: 'Executive summary drafting',
    template:
      'Draft an executive summary for {{period}} covering risk posture, open cases, and recommended actions.\n\nNotes:\n{{notes}}',
    variables: ['period', 'notes'],
  },
];
