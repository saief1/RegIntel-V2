import { renderTemplate } from './template.engine';

describe('renderTemplate', () => {
  it('substitutes variables', () => {
    expect(renderTemplate('Hello {{name}}', { name: 'Ada' })).toBe('Hello Ada');
  });

  it('replaces missing variables with empty string', () => {
    expect(renderTemplate('Hi {{name}}', {})).toBe('Hi ');
  });
});
