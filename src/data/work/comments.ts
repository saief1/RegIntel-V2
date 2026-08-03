import type { WorkComment } from '../../types/work'

export const WORK_COMMENTS: WorkComment[] = [
  {
    id: 'cm-01',
    caseId: 'case-01',
    authorId: 'u-02',
    body: 'Clause deltas look material on subprocessors. Flagging for counsel before we greenlight renewals.',
    createdAt: '2026-07-28T15:20:00.000Z',
  },
  {
    id: 'cm-02',
    caseId: 'case-01',
    authorId: 'u-04',
    body: 'Agreed — residual risk may need a TOM schedule. Syncing tomorrow morning.',
    createdAt: '2026-08-01T11:35:00.000Z',
    taskId: 'task-02',
  },
  {
    id: 'cm-03',
    caseId: 'case-02',
    authorId: 'u-03',
    body: 'CRM export attached. Mapping to beneficial ownership fields is next.',
    createdAt: '2026-08-01T16:10:00.000Z',
    taskId: 'task-04',
  },
  {
    id: 'cm-04',
    caseId: 'case-03',
    authorId: 'u-01',
    body: 'Blocked on whether the notification clock starts at detection or confirmation.',
    createdAt: '2026-07-30T18:30:00.000Z',
  },
]
