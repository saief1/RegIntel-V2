import { IndexingService } from './indexing.service';

describe('IndexingService.parseContent', () => {
  const service = Object.create(IndexingService.prototype) as IndexingService;

  it('normalizes whitespace and counts words', () => {
    const parsed = service.parseContent(
      '  Title  ',
      'Hello\r\nworld  from  RegIntel',
      { docType: 'guidance' },
    );
    expect(parsed.title).toBe('Title');
    expect(parsed.content).toContain('Hello\nworld');
    expect(parsed.metadata.docType).toBe('guidance');
    expect(parsed.metadata.wordCount).toBe(4);
  });
});
