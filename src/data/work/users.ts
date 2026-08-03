import type { WorkUser } from '../../types/work'

export const WORK_USERS: WorkUser[] = [
  { id: 'u-01', name: 'Alex Chen', initials: 'AC', role: 'Compliance Lead' },
  { id: 'u-02', name: 'Jordan Blake', initials: 'JB', role: 'Reviewer' },
  { id: 'u-03', name: 'Sam Rivera', initials: 'SR', role: 'Analyst' },
  { id: 'u-04', name: 'Morgan Lee', initials: 'ML', role: 'Counsel' },
  { id: 'u-05', name: 'Riley Patel', initials: 'RP', role: 'Ops' },
]

export function getWorkUser(id: string): WorkUser | undefined {
  return WORK_USERS.find((user) => user.id === id)
}
