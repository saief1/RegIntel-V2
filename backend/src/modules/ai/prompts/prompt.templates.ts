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
      'Draft an executive summary for {{period}} covering risk posture, open cases, and recommended actions.\n\nNotes:\n{{notes}}\n\nRetrieved context:\n{{context}}',
    variables: ['period', 'notes', 'context'],
  },
  {
    key: 'system.rag',
    name: 'RAG system',
    kind: PromptKind.SYSTEM,
    description: 'System prompt for grounded RAG answers',
    template:
      'You are RegIntel RAG for {{orgName}}. Answer only from retrieved sources when possible. Cite with [n] markers. If evidence is weak, say so. Role: {{role}}.',
    variables: ['orgName', 'role'],
  },
  {
    key: 'workspace.rag',
    name: 'Workspace RAG',
    kind: PromptKind.WORKSPACE,
    description: 'Default RAG orchestration prompt',
    template:
      'Mode: rag. Produce a grounded compliance answer.\n\nSources:\n{{context}}\n\nUser: {{userMessage}}',
    variables: ['context', 'userMessage'],
  },
  {
    key: 'workspace.research',
    name: 'Research mode',
    kind: PromptKind.WORKSPACE,
    description: 'Deep research with citations',
    template:
      'Mode: research. Synthesize findings with clear citations.\n\nSources:\n{{context}}\n\nQuestion: {{userMessage}}',
    variables: ['context', 'userMessage'],
  },
  {
    key: 'workspace.document_analysis',
    name: 'Document analysis',
    kind: PromptKind.WORKSPACE,
    description: 'Analyze a document against retrieved knowledge',
    template:
      'Mode: document_analysis. Analyze the material and relate it to sources.\n\nDocument / sources:\n{{context}}\n{{documentText}}\n\nAsk: {{userMessage}}',
    variables: ['context', 'documentText', 'userMessage'],
  },
  {
    key: 'workspace.compare',
    name: 'Compare mode',
    kind: PromptKind.WORKSPACE,
    description: 'Compare two artefacts with retrieval support',
    template:
      'Mode: compare. Compare the materials and cite sources.\n\nLeft:\n{{leftText}}\n\nRight:\n{{rightText}}\n\nRetrieved:\n{{context}}\n\nFocus: {{userMessage}}',
    variables: ['leftText', 'rightText', 'context', 'userMessage'],
  },
  {
    key: 'workspace.drafting',
    name: 'Drafting mode',
    kind: PromptKind.WORKSPACE,
    description: 'Draft policy/report language grounded in sources',
    template:
      'Mode: drafting. Draft clear compliance language grounded in sources.\n\nSources:\n{{context}}\n\nBrief:\n{{draftBrief}}\n\nRequest: {{userMessage}}',
    variables: ['context', 'draftBrief', 'userMessage'],
  },
  {
    key: 'workspace.executive_brief',
    name: 'Executive brief',
    kind: PromptKind.WORKSPACE,
    description: 'Executive brief from retrieved knowledge',
    template:
      'Mode: executive_brief. Write a concise executive brief.\n\nSources:\n{{context}}\n\nRequest: {{userMessage}}',
    variables: ['context', 'userMessage'],
  },
];
