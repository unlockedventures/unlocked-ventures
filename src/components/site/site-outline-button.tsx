'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'cn'

const outlineClassName =
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6'

/** Pingen-style pill CTA — logo navy (#0B1F3A), not brand teal. */
const solidClassName =
  'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-solid border-[#0B1F3A] bg-[#0B1F3A] px-7 font-sans text-[15px] leading-[22px] font-normal tracking-normal text-white antialiased transition-[background-color,padding] duration-200 ease-out hover:bg-[#16325A]'

const labelClassName = 'block leading-none'

/** Trim the line box to the cap height so the label sits on the button's vertical center. */
const solidLabelClassName =
  'block leading-none [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]'

export const buttonHoverLabelClassName =
  'transition-transform duration-200 ease-out group-hover/cta:-translate-x-2 group-focus-visible/cta:-translate-x-2 motion-reduce:transition-none'

const hoverArrowClassName =
  'pointer-events-none absolute top-1/2 right-3 inline-flex -translate-y-1/2 opacity-0 transition-opacity duration-200 ease-out group-hover/cta:opacity-100 group-focus-visible/cta:opacity-100 motion-reduce:transition-none'

export function ButtonHoverArrow() {
  return (
    <span aria-hidden="true" className={hoverArrowClassName}>
      <svg viewBox="0 0 13.88 9.42" className="h-2.5 w-3.5 shrink-0" fill="none">
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
  variant = 'outline',
}: {
  text: string
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  icon?: ReactNode
  hoverArrow?: boolean
  variant?: 'outline' | 'solid'
}) {
  const classNames = cn(
    variant === 'solid' ? solidClassName : outlineClassName,
    hoverArrow && 'group/cta relative',
    variant === 'solid' && hoverArrow && 'pr-7 hover:pr-9 hover:pl-5',
    disabled && 'pointer-events-none opacity-50',
    className,
  )
  const label = (
    <span className="inline-flex items-center">
      <span
        className={cn(
          variant === 'solid' ? solidLabelClassName : labelClassName,
          hoverArrow && buttonHoverLabelClassName,
        )}
      >
        {text}
      </span>
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
