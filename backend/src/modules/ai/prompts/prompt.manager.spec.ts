import { PromptManager } from './prompt.manager';

describe('PromptManager', () => {
  const manager = new PromptManager({} as never);

  it('renders template variables', () => {
    const text = manager.renderTemplate('Hello {{name}} from {{org}}', {
      name: 'Ada',
      org: 'RegIntel',
    });
    expect(text).toBe('Hello Ada from RegIntel');
  });

  it('budgets history to token window', () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: 'user',
      content: `message ${i} ${'word '.repeat(40)}`,
    }));
    const kept = manager.budgetHistory(messages, 100);
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.length).toBeLessThan(messages.length);
    expect(kept[kept.length - 1]?.content).toContain('message 19');
  });
});
