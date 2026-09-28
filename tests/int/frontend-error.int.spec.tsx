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

import FrontendError from '@/app/(frontend)/error'

describe('FrontendError', () => {
  it('renders the crash screen without the error detail', () => {
    const reset = vi.fn()

    render(
      <FrontendError
        error={Object.assign(new Error('secret crash check'), { digest: 'digest-1' })}
        reset={reset}
      />,
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    expect(screen.getByText('This page could not be loaded.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('secret crash check')).not.toBeInTheDocument()
    expect(screen.queryByText('digest-1')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(reset).not.toHaveBeenCalled()
  })
})
