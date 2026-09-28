import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import SiteLayout from '@/app/(frontend)/(site)/layout'

describe('SiteLayout', () => {
  it('wraps page content with the site header', () => {
    render(
      <SiteLayout>
        <p>Home content</p>
      </SiteLayout>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', '/contact')
    expect(screen.getByText('Home content')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Home content'))
  })
})
