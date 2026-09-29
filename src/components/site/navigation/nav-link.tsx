import Link from 'next/link'

import type { NavLink } from '@/config/navigation'

export function NavAnchor({
  link,
  className,
  onNavigate,
}: {
  link: NavLink
  className?: string
  onNavigate?: () => void
}) {
  if (link.external) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  )
}
