import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

function createIconProps(props: IconProps): IconProps {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.2V19a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0A1.5 1.5 0 0 1 13.5 15v5H17a1 1 0 0 0 1-1v-8.8" />
    </svg>
  )
}

export function AIWorkspaceIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <path d="M12 3.5 13.6 8l4.5 1.6-4.5 1.6L12 15.7 10.4 11.2 5.9 9.6l4.5-1.6L12 3.5Z" />
      <path d="M18.5 15.5 19.3 17.6l2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1Z" />
    </svg>
  )
}

export function KnowledgeIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <path d="M4 5.5c1.9-.9 4.6-.9 6.5 0 .5.24 1.5.24 2 0 1.9-.9 4.6-.9 6.5 0v12c-1.9-.9-4.6-.9-6.5 0-.5.24-1.5.24-2 0-1.9-.9-4.6-.9-6.5 0Z" />
      <path d="M10.5 5.5v12" />
    </svg>
  )
}

export function WorkIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M8.5 7.5v-2a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5.5v2" />
      <path d="M3.5 12.5h17" />
    </svg>
  )
}

export function ReportsIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M8 13v3.5M12 10v6.5M16 7.5v9" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M19.2 13.9c.1-.6.1-1.2 0-1.8l1.6-1.2-1.6-2.8-1.9.6a7 7 0 0 0-1.6-.9l-.3-2H10.6l-.3 2a7 7 0 0 0-1.6.9l-1.9-.6-1.6 2.8 1.6 1.2c-.1.6-.1 1.2 0 1.8L5.2 15.1l1.6 2.8 1.9-.6c.5.4 1 .7 1.6.9l.3 2h2.8l.3-2c.6-.2 1.1-.5 1.6-.9l1.9.6 1.6-2.8Z" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m19 19-4-4" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...createIconProps(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
