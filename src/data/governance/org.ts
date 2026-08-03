import type {
  ControlRecord,
  EnterpriseRole,
  OrgBusinessUnit,
  OrgDepartment,
  OrgLocation,
  OrgTeam,
  RiskRecord,
  RoleAssignment,
} from '../../types/governance'

export const DEPARTMENTS: OrgDepartment[] = [
  { id: 'dept-compliance', name: 'Compliance', managerId: 'u-01' },
  { id: 'dept-risk', name: 'Risk', managerId: 'u-02' },
  { id: 'dept-legal', name: 'Legal', managerId: 'u-04' },
  { id: 'dept-ops', name: 'Operations', managerId: 'u-05' },
  { id: 'dept-tech', name: 'Technology', managerId: 'u-03' },
]

export const BUSINESS_UNITS: OrgBusinessUnit[] = [
  { id: 'bu-retail', name: 'Retail Banking', departmentIds: ['dept-compliance', 'dept-ops'] },
  { id: 'bu-wealth', name: 'Wealth', departmentIds: ['dept-compliance', 'dept-risk'] },
  { id: 'bu-markets', name: 'Capital Markets', departmentIds: ['dept-risk', 'dept-legal'] },
]

export const LOCATIONS: OrgLocation[] = [
  { id: 'loc-tor', name: 'Toronto HQ', region: 'Canada' },
  { id: 'loc-mtl', name: 'Montreal', region: 'Canada' },
  { id: 'loc-nyc', name: 'New York', region: 'United States' },
]

export const TEAMS: OrgTeam[] = [
  {
    id: 'team-aml',
    name: 'AML Team',
    departmentId: 'dept-compliance',
    leadId: 'u-01',
    memberIds: ['u-01', 'u-02', 'u-03'],
  },
  {
    id: 'team-privacy',
    name: 'Privacy Office',
    departmentId: 'dept-legal',
    leadId: 'u-04',
    memberIds: ['u-04', 'u-01'],
  },
  {
    id: 'team-cyber',
    name: 'Cyber Governance',
    departmentId: 'dept-tech',
    leadId: 'u-03',
    memberIds: ['u-03', 'u-05'],
  },
]

export const ENTERPRISE_ROLES: EnterpriseRole[] = [
  {
    id: 'administrator',
    label: 'Administrator',
    description: 'Full platform administration.',
    permissions: ['view', 'edit', 'delete', 'approve', 'export', 'manage'],
  },
  {
    id: 'compliance_officer',
    label: 'Compliance Officer',
    description: 'Owns day-to-day compliance execution.',
    permissions: ['view', 'edit', 'approve', 'export'],
  },
  {
    id: 'compliance_manager',
    label: 'Compliance Manager',
    description: 'Manages reviews, approvals, and team assignments.',
    permissions: ['view', 'edit', 'approve', 'export', 'manage'],
  },
  {
    id: 'risk_manager',
    label: 'Risk Manager',
    description: 'Owns residual risk and control effectiveness.',
    permissions: ['view', 'edit', 'export'],
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Executive visibility and final approvals.',
    permissions: ['view', 'approve', 'export'],
  },
  {
    id: 'auditor',
    label: 'Auditor',
    description: 'Read and export evidence for assurance.',
    permissions: ['view', 'export'],
  },
  {
    id: 'read_only',
    label: 'Read Only',
    description: 'View-only access across governance objects.',
    permissions: ['view'],
  },
]

export const ROLE_ASSIGNMENTS: RoleAssignment[] = [
  { userId: 'u-01', roleId: 'compliance_manager', departmentId: 'dept-compliance' },
  { userId: 'u-02', roleId: 'compliance_officer', departmentId: 'dept-compliance' },
  { userId: 'u-03', roleId: 'risk_manager', departmentId: 'dept-risk' },
  { userId: 'u-04', roleId: 'executive', departmentId: 'dept-legal' },
  { userId: 'u-05', roleId: 'auditor', departmentId: 'dept-ops' },
]

export const CONTROLS: ControlRecord[] = [
  { id: 'ctrl-01', name: 'Beneficial ownership capture', ownerId: 'u-03', status: 'gap' },
  { id: 'ctrl-02', name: 'Transfer annex attestation', ownerId: 'u-04', status: 'testing' },
  { id: 'ctrl-03', name: 'Incident notification timer', ownerId: 'u-05', status: 'effective' },
  { id: 'ctrl-04', name: 'Sanctions exception disposition', ownerId: 'u-02', status: 'testing' },
]

export const RISKS: RiskRecord[] = [
  { id: 'risk-01', name: 'Incomplete KYC field mapping', severity: 'critical', ownerId: 'u-03' },
  { id: 'risk-02', name: 'Cross-border residual transfer risk', severity: 'high', ownerId: 'u-04' },
  { id: 'risk-03', name: 'Incident clock ambiguity', severity: 'high', ownerId: 'u-01' },
  { id: 'risk-04', name: 'Board reporting lag', severity: 'medium', ownerId: 'u-01' },
]
