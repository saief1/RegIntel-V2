import { RagService } from './rag.service';
import type { RetrievalHit } from '../retrieval/retrieval.service';

describe('RagService confidence', () => {
  const service = Object.create(RagService.prototype) as RagService;

  it('returns low confidence for empty hits', () => {
    expect(service.computeConfidence([])).toBe(0.15);
  });

  it('increases with stronger scores and more hits', () => {
    const weak: RetrievalHit[] = [
      {
        chunkId: '1',
        entityType: 'POLICY',
        entityId: 'p1',
        chunkIndex: 0,
        title: 'Policy',
        content: 'text',
        score: 0.2,
        vectorScore: 0.2,
        keywordScore: 0,
        freshnessScore: 0,
      },
    ];
    const strong: RetrievalHit[] = [
      {
        chunkId: '1',
        entityType: 'GUIDANCE',
        entityId: 'g1',
        chunkIndex: 0,
        title: 'Travel Rule',
        content: 'FINTRAC travel rule',
        score: 0.9,
        vectorScore: 0.8,
        keywordScore: 0.1,
        freshnessScore: 0.05,
      },
      {
        chunkId: '2',
        entityType: 'POLICY',
        entityId: 'p1',
        chunkIndex: 0,
        title: 'Security',
        content: 'policy',
        score: 0.7,
        vectorScore: 0.6,
        keywordScore: 0.1,
        freshnessScore: 0,
      },
      {
        chunkId: '3',
        entityType: 'CONTROL',
        entityId: 'c1',
        chunkIndex: 0,
        title: 'Control',
        content: 'control',
        score: 0.65,
        vectorScore: 0.55,
        keywordScore: 0.1,
        freshnessScore: 0,
      },
      {
        chunkId: '4',
        entityType: 'PROCEDURE',
        entityId: 'pr1',
        chunkIndex: 0,
        title: 'Proc',
        content: 'procedure',
        score: 0.6,
        vectorScore: 0.5,
        keywordScore: 0.1,
        freshnessScore: 0,
      },
    ];
    expect(service.computeConfidence(strong)).toBeGreaterThan(
      service.computeConfidence(weak),
    );
    expect(service.computeConfidence(strong)).toBeGreaterThan(0.45);
  });
});
