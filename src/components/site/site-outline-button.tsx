'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'cn'

const outlineClassName =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6'

const labelClassName = 'block leading-none'

export function SiteOutlineButton({
  text,
  href,
  onClick,
  className,
  type = 'button',
  disabled = false,
  icon,
}: {
  text: string
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: ReactNode
}) {
  const classNames = cn(outlineClassName, disabled && 'pointer-events-none opacity-50', className)
  const label = (
    <>
      <span className={labelClassName}>{text}</span>
      {icon}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-disabled={disabled || undefined}
        className={classNames}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault()
            return
          }
          onClick?.()
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={classNames} onClick={onClick}>
      {label}
    </button>
  )
}
