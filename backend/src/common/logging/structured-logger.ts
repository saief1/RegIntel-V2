import { shouldLog } from './log-level';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function structuredLog(
  level: LogLevel,
  message: string,
  fields?: Record<string, unknown>,
): void {
  if (!shouldLog(level)) return;
  const line = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'regintel-api',
    ...fields,
  });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}
