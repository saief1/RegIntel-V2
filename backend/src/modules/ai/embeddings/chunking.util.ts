import { createHash } from 'node:crypto';

export type TextChunk = {
  index: number;
  content: string;
  contentHash: string;
  tokenCount: number;
};

export function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Simple paragraph/sentence-aware chunker with overlap. */
export function chunkText(
  text: string,
  opts?: { maxChars?: number; overlapChars?: number },
): TextChunk[] {
  const maxChars = opts?.maxChars ?? 1200;
  const overlapChars = opts?.overlapChars ?? 150;
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer.trim()) {
      pieces.push(buffer.trim());
      buffer = '';
    }
  };

  for (const para of paragraphs) {
    if (para.length > maxChars) {
      flush();
      for (let i = 0; i < para.length; i += maxChars - overlapChars) {
        pieces.push(para.slice(i, i + maxChars));
      }
      continue;
    }
    if ((buffer + '\n\n' + para).length > maxChars) {
      flush();
      buffer = para;
    } else {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    }
  }
  flush();

  return pieces.map((content, index) => ({
    index,
    content,
    contentHash: contentHash(content),
    tokenCount: Math.max(1, Math.ceil(content.length / 4)),
  }));
}
