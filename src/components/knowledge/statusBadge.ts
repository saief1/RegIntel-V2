import type { BadgeVariant } from '../ui/Badge/Badge'
import type { DocumentStatus } from '../../types/knowledge'

/** Shared status → label/variant mapping so every knowledge surface (cards, meta, filters) renders status identically. */
export function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'proposed':
      return 'Proposed'
    case 'draft':
      return 'Draft'
    case 'superseded':
      return 'Superseded'
  }
}

export function statusBadgeVariant(status: DocumentStatus): BadgeVariant {
  switch (status) {
    case 'active':
      return 'success'
    case 'proposed':
      return 'accent'
    case 'draft':
      return 'neutral'
    case 'superseded':
      return 'warning'
  }
}

export function kindLabel(kind: 'regulation' | 'guidance' | 'bulletin'): string {
  switch (kind) {
    case 'regulation':
      return 'Regulation'
    case 'guidance':
      return 'Guidance'
    case 'bulletin':
      return 'Bulletin'
  }
}
