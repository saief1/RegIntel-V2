import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { AvatarGroup } from '../../components/work/AvatarGroup/AvatarGroup'
import { PriorityBadge } from '../../components/work/PriorityBadge/PriorityBadge'
import { RiskBadge } from '../../components/work/RiskBadge/RiskBadge'
import { StatusBadge } from '../../components/work/StatusBadge/StatusBadge'
import { Button } from '../../components/ui/Button/Button'
import { Dropdown } from '../../components/ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel, DropdownSeparator } from '../../components/ui/Dropdown/DropdownItem'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { IconButton } from '../../components/ui/IconButton/IconButton'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SearchField } from '../../components/ui/SearchField/SearchField'
import { Select } from '../../components/ui/Select/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table/Table'
import { useWork } from '../../hooks/useWork'
import type { CaseStatus, Priority, RiskLevel } from '../../types/work'
import { formatDate, formatRelativeTime } from '../../utils/date'
import styles from './CasesPage.module.css'

type SortKey = 'caseNumber' | 'title' | 'status' | 'risk' | 'dueDate' | 'createdAt' | 'updatedAt'
const PAGE_SIZE = 6

export function CasesPage() {
  const navigate = useNavigate()
  const { cases, getUser, updateCaseStatus } = useWork()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')
  const [risk, setRisk] = useState<RiskLevel | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const riskRank: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    const statusRank: Record<CaseStatus, number> = {
      open: 1,
      in_review: 2,
      escalated: 3,
      completed: 4,
      closed: 5,
    }

    const result = cases.filter((item) => {
      if (normalized && !`${item.caseNumber} ${item.title} ${item.summary}`.toLowerCase().includes(normalized)) return false
      if (status !== 'all' && item.status !== status) return false
      if (risk !== 'all' && item.risk !== risk) return false
      if (priority !== 'all' && item.priority !== priority) return false
      return true
    })

    return [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'caseNumber':
        case 'title':
          cmp = a[sortKey].localeCompare(b[sortKey])
          break
        case 'status':
          cmp = statusRank[a.status] - statusRank[b.status]
          break
        case 'risk':
          cmp = riskRank[a.risk] - riskRank[b.risk]
          break
        case 'dueDate':
        case 'createdAt':
        case 'updatedAt':
          cmp = new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [cases, query, status, risk, priority, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selected.includes(item.id))

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'title' || key === 'caseNumber' ? 'asc' : 'desc')
    }
  }

  function toggleRow(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function togglePage() {
    if (allPageSelected) {
      setSelected((current) => current.filter((id) => !pageItems.some((item) => item.id === id)))
    } else {
      setSelected((current) => [...new Set([...current, ...pageItems.map((item) => item.id)])])
    }
  }

  function bulkStatus(next: CaseStatus) {
    selected.forEach((id) => updateCaseStatus(id, next))
    setSelected([])
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Cases"
        description="Search, filter, and manage the compliance case queue."
        icon={<Briefcase size={20} />}
        actions={
          <Button variant="secondary" onClick={() => navigate('/work')}>
            Back to dashboard
          </Button>
        }
      />

      <div className={styles.toolbar}>
        <SearchField
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Search by ID or title..."
          aria-label="Search cases"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as CaseStatus | 'all')
            setPage(1)
          }}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="escalated">Escalated</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </Select>
        <Select
          value={risk}
          onChange={(e) => {
            setRisk(e.target.value as RiskLevel | 'all')
            setPage(1)
          }}
          aria-label="Filter by risk"
        >
          <option value="all">All risk</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as Priority | 'all')
            setPage(1)
          }}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {selected.length > 0 && (
        <div className={styles.bulkBar} role="region" aria-label="Bulk actions">
          <span>{selected.length} selected</span>
          <Button variant="secondary" size="sm" onClick={() => bulkStatus('in_review')}>
            Mark in review
          </Button>
          <Button variant="secondary" size="sm" onClick={() => bulkStatus('escalated')}>
            Escalate
          </Button>
          <Button variant="secondary" size="sm" onClick={() => bulkStatus('completed')}>
            Complete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      )}

      {pageItems.length === 0 ? (
        <EmptyState
          title="No cases match"
          description="Try clearing filters or searching with a different case ID."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('')
                setStatus('all')
                setRisk('all')
                setPriority('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.tableWrap}>
          <Table aria-label="Cases">
            <TableHead>
              <TableRow>
                <TableHeaderCell className={styles.checkCol}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={togglePage}
                    aria-label="Select all cases on this page"
                  />
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('caseNumber')}>
                    ID
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('title')}>
                    Title
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('status')}>
                    Status
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('risk')}>
                    Risk
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('dueDate')}>
                    Due date
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('createdAt')}>
                    Created
                  </button>
                </TableHeaderCell>
                <TableHeaderCell>
                  <button type="button" className={styles.sortButton} onClick={() => toggleSort('updatedAt')}>
                    Last updated
                  </button>
                </TableHeaderCell>
                <TableHeaderCell className={styles.actionsCol}>
                  <span className={styles.srOnly}>Actions</span>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageItems.map((workCase) => {
                const owner = getUser(workCase.ownerId)
                const assignees = workCase.assigneeIds
                  .map((id) => getUser(id))
                  .filter((user): user is NonNullable<typeof user> => Boolean(user))
                return (
                  <TableRow key={workCase.id} data-selected={selected.includes(workCase.id) || undefined}>
                    <TableCell className={styles.checkCol}>
                      <input
                        type="checkbox"
                        checked={selected.includes(workCase.id)}
                        onChange={() => toggleRow(workCase.id)}
                        aria-label={`Select ${workCase.caseNumber}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link to={`/work/cases/${workCase.id}`} className={styles.caseLink}>
                        {workCase.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className={styles.titleCell}>
                        <Link to={`/work/cases/${workCase.id}`} className={styles.caseLink}>
                          {workCase.title}
                        </Link>
                        <PriorityBadge priority={workCase.priority} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={workCase.status} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge risk={workCase.risk} />
                    </TableCell>
                    <TableCell>
                      <div className={styles.ownerCell}>
                        <span>{owner?.name ?? 'Unassigned'}</span>
                        <AvatarGroup users={assignees} max={2} />
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(workCase.dueDate)}</TableCell>
                    <TableCell>{formatDate(workCase.createdAt)}</TableCell>
                    <TableCell>{formatRelativeTime(workCase.updatedAt)}</TableCell>
                    <TableCell className={styles.actionsCol}>
                      <Dropdown
                        align="end"
                        trigger={
                          <IconButton label={`Actions for ${workCase.caseNumber}`}>
                            <MoreHorizontal size={16} />
                          </IconButton>
                        }
                      >
                        {(close) => (
                          <>
                            <DropdownLabel>Case actions</DropdownLabel>
                            <DropdownItem
                              onClick={() => {
                                close()
                                navigate(`/work/cases/${workCase.id}`)
                              }}
                            >
                              Open details
                            </DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem
                              onClick={() => {
                                close()
                                updateCaseStatus(workCase.id, 'in_review')
                              }}
                            >
                              Mark in review
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                close()
                                updateCaseStatus(workCase.id, 'escalated')
                              }}
                            >
                              Escalate
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                close()
                                updateCaseStatus(workCase.id, 'completed')
                              }}
                            >
                              Complete
                            </DropdownItem>
                          </>
                        )}
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>

          <nav className={styles.pagination} aria-label="Cases pagination">
            <span>
              Page {currentPage} of {totalPages} · {filtered.length} cases
            </span>
            <div className={styles.paginationButtons}>
              <Button
                variant="secondary"
                size="sm"
                leadingIcon={<ChevronLeft size={14} />}
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                trailingIcon={<ChevronRight size={14} />}
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      )}
    </PageContainer>
  )
}
