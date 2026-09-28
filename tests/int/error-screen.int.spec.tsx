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

import { ErrorScreen } from '@/components/site/error-screen'

describe('ErrorScreen', () => {
  it('renders the shared full-screen column', () => {
    const { container } = render(
      <ErrorScreen label="404" title="This page is not available" description="The address may be wrong, or the page may have moved." />,
    )

    const image = container.querySelector('img')
    expect(image).toHaveAttribute('src', '/brand/brand-logo.svg')
    expect(image).toHaveAttribute('alt', '')
    expect(container.querySelectorAll('img')).toHaveLength(1)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'This page is not available' })).toBeInTheDocument()
    expect(screen.getByText('The address may be wrong, or the page may have moved.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: 'Get in touch' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('bg-[#F3F4F9]')
  })
})
