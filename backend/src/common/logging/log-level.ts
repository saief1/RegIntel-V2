type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function resolveLogLevel(raw?: string): LogLevel {
  const value = (raw ?? process.env.LOG_LEVEL ?? 'info').toLowerCase();
  if (
    value === 'debug' ||
    value === 'info' ||
    value === 'warn' ||
    value === 'error'
  ) {
    return value;
  }
  return 'info';
}

export function shouldLog(level: LogLevel, configured?: string): boolean {
  const min = resolveLogLevel(configured);
  return RANK[level] >= RANK[min];
}
