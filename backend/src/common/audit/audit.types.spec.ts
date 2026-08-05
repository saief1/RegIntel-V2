import { categoryForAction } from './audit.types';

describe('categoryForAction', () => {
  it('maps domains', () => {
    expect(categoryForAction('auth.login')).toBe('authn');
    expect(categoryForAction('policy.publish')).toBe('policy');
    expect(categoryForAction('task.create')).toBe('tasks');
    expect(categoryForAction('storage.upload')).toBe('uploads');
    expect(categoryForAction('workflow.approve')).toBe('workflow');
  });
});
