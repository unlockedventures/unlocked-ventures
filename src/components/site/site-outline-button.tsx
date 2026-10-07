'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'cn'

const outlineClassName =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6'

const labelClassName = 'block leading-none'

export const buttonHoverLabelClassName =
  'transition-transform duration-200 ease-out group-hover/cta:-translate-x-2 group-focus-visible/cta:-translate-x-2 motion-reduce:transition-none'

const hoverArrowClassName =
  'pointer-events-none absolute top-1/2 right-1.5 inline-flex -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100 group-focus-visible/cta:opacity-100 motion-reduce:transition-none'

export function ButtonHoverArrow() {
  return (
    <span aria-hidden="true" className={hoverArrowClassName}>
      <svg viewBox="0 0 13.88 9.42" className="h-2 w-3 shrink-0" fill="none">
        <path d="M0 4.6h12.7" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8.34.54 12.79 4.71 8.34 8.87" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </span>
  )
}

export function SiteOutlineButton({
  text,
  href,
  onClick,
  className,
  type = 'button',
  disabled = false,
  icon,
  hoverArrow = false,
}: {
  text: string
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: ReactNode
  hoverArrow?: boolean
}) {
  const classNames = cn(
    outlineClassName,
    hoverArrow && 'group/cta relative',
    disabled && 'pointer-events-none opacity-50',
    className,
  )
  const label = (
    <span className="inline-flex items-center">
      <span className={cn(labelClassName, hoverArrow && buttonHoverLabelClassName)}>{text}</span>
      {hoverArrow ? <ButtonHoverArrow /> : icon}
    </span>
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
