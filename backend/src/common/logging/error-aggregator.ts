export type AggregatedError = {
  code: string;
  count: number;
  lastMessage: string;
  lastSeenAt: string;
};

/**
 * In-process error aggregation for ops dashboard (B022).
 * Not a substitute for an external APM; resets on process restart.
 */
export class ErrorAggregator {
  private readonly byCode = new Map<string, AggregatedError>();
  private total = 0;

  record(code: string, message: string): void {
    this.total += 1;
    const existing = this.byCode.get(code);
    if (existing) {
      existing.count += 1;
      existing.lastMessage = message.slice(0, 500);
      existing.lastSeenAt = new Date().toISOString();
    } else {
      this.byCode.set(code, {
        code,
        count: 1,
        lastMessage: message.slice(0, 500),
        lastSeenAt: new Date().toISOString(),
      });
    }
  }

  snapshot(limit = 50): { total: number; errors: AggregatedError[] } {
    const errors = [...this.byCode.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    return { total: this.total, errors };
  }

  reset(): void {
    this.byCode.clear();
    this.total = 0;
  }
}

/** Process-wide singleton so filters and Nest services share the same store. */
export const globalErrorAggregator = new ErrorAggregator();
