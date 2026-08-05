import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiPrompt, AiPromptVersion, PromptKind } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { estimateTokenCount } from '../providers/ai-provider.types';
import { BUILTIN_PROMPTS } from './prompt.templates';

export type RenderedPrompt = {
  key: string;
  version: number;
  kind: PromptKind;
  text: string;
  variables: string[];
  tokenEstimate: number;
};

@Injectable()
export class PromptManager implements OnModuleInit {
  private readonly logger = new Logger(PromptManager.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBuiltins();
    } catch (err) {
      this.logger.warn(`Prompt seed skipped: ${String(err)}`);
    }
  }

  async ensureBuiltins(): Promise<void> {
    for (const p of BUILTIN_PROMPTS) {
      const existing = await this.prisma.aiPrompt.findFirst({
        where: { organizationId: null, key: p.key },
      });
      if (existing) continue;
      await this.prisma.aiPrompt.create({
        data: {
          organizationId: null,
          key: p.key,
          name: p.name,
          kind: p.kind,
          description: p.description,
          currentVersion: 1,
          versions: {
            create: {
              version: 1,
              template: p.template,
              variables: p.variables,
              changelog: 'Initial builtin',
            },
          },
        },
      });
    }
  }

  renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (_, key: string) => (variables[key] !== undefined ? variables[key] : ''),
    );
  }

  async getPrompt(
    key: string,
    organizationId?: string | null,
  ): Promise<(AiPrompt & { versions: AiPromptVersion[] }) | null> {
    if (organizationId) {
      const orgPrompt = await this.prisma.aiPrompt.findFirst({
        where: { organizationId, key, active: true },
        include: { versions: { orderBy: { version: 'desc' } } },
      });
      if (orgPrompt) return orgPrompt;
    }
    return this.prisma.aiPrompt.findFirst({
      where: { organizationId: null, key, active: true },
      include: { versions: { orderBy: { version: 'desc' } } },
    });
  }

  async render(
    key: string,
    variables: Record<string, string>,
    organizationId?: string | null,
  ): Promise<RenderedPrompt> {
    const prompt = await this.getPrompt(key, organizationId);
    if (!prompt || !prompt.versions.length) {
      const text = this.renderTemplate('{{userMessage}}', variables);
      return {
        key,
        version: 0,
        kind: PromptKind.WORKSPACE,
        text,
        variables: Object.keys(variables),
        tokenEstimate: estimateTokenCount(text),
      };
    }
    const version =
      prompt.versions.find((v) => v.version === prompt.currentVersion) ??
      prompt.versions[0];
    const text = this.renderTemplate(version.template, variables);
    return {
      key: prompt.key,
      version: version.version,
      kind: prompt.kind,
      text,
      variables: version.variables,
      tokenEstimate: estimateTokenCount(text),
    };
  }

  /** Budget conversation history to fit a token window. */
  budgetHistory(
    messages: Array<{ role: string; content: string }>,
    maxTokens: number,
  ): Array<{ role: string; content: string }> {
    const kept: Array<{ role: string; content: string }> = [];
    let used = 0;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      const cost = estimateTokenCount(m.content) + 4;
      if (used + cost > maxTokens) break;
      kept.unshift(m);
      used += cost;
    }
    return kept;
  }

  async createVersion(
    organizationId: string | null,
    key: string,
    template: string,
    variables: string[],
    changelog?: string,
  ): Promise<AiPromptVersion> {
    const prompt = await this.prisma.aiPrompt.findFirst({
      where: { organizationId, key },
    });
    if (!prompt) {
      const created = await this.prisma.aiPrompt.create({
        data: {
          organizationId,
          key,
          name: key,
          kind: PromptKind.WORKSPACE,
          currentVersion: 1,
          versions: {
            create: {
              version: 1,
              template,
              variables,
              changelog: changelog ?? 'Created',
            },
          },
        },
        include: { versions: true },
      });
      return created.versions[0];
    }
    const next = prompt.currentVersion + 1;
    const version = await this.prisma.aiPromptVersion.create({
      data: {
        promptId: prompt.id,
        version: next,
        template,
        variables,
        changelog,
      },
    });
    await this.prisma.aiPrompt.update({
      where: { id: prompt.id },
      data: { currentVersion: next },
    });
    return version;
  }

  async listPrompts(organizationId?: string | null) {
    return this.prisma.aiPrompt.findMany({
      where: {
        OR: [
          { organizationId: null },
          ...(organizationId ? [{ organizationId }] : []),
        ],
        active: true,
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: { key: 'asc' },
    });
  }

  async auditRender(
    organizationId: string | null,
    userId: string | null,
    rendered: RenderedPrompt,
    requestId?: string,
  ): Promise<void> {
    await this.prisma.aiProviderLog.create({
      data: {
        organizationId: organizationId ?? undefined,
        userId: userId ?? undefined,
        provider: 'MOCK',
        operation: 'prompt.render',
        success: true,
        promptKey: rendered.key,
        promptVersion: rendered.version,
        requestId,
        metadata: {
          tokenEstimate: rendered.tokenEstimate,
          kind: rendered.kind,
        },
      },
    });
  }
}
