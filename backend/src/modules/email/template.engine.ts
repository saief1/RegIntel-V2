export function renderTemplate(
  template: string,
  variables: Record<string, string | number | boolean | undefined | null>,
): string {
  return template.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_, key: string) => {
      const value = variables[key];
      return value === undefined || value === null ? '' : String(value);
    },
  );
}
