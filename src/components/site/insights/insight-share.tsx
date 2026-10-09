function ShareIcon({ network }: { network: 'facebook' | 'linkedin' | 'x' }) {
  if (network === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
        <path
          d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z"
          fill="currentColor"
        />
      </svg>
    )
  }
  if (network === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
        <path
          d="M6.5 9.5H9v9H6.5v-9ZM7.75 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11 9.5h2.4v1.2h.03c.34-.62 1.2-1.35 2.57-1.35 2.75 0 3.25 1.75 3.25 4.12V18.5H17v-4.35c0-1.04-.02-2.37-1.45-2.37-1.45 0-1.67 1.13-1.67 2.3V18.5H11V9.5Z"
          fill="currentColor"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M17.6 4H20l-5.7 6.5L21 20h-4.6l-3.6-4.7L8.4 20H6l6.1-7L5 4h4.7l3.2 4.3L17.6 4Zm-1.6 14.4h1.3L8.1 5.5H6.8l9.2 12.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

const buttonClassName =
  'inline-flex size-10 items-center justify-center border border-[#C8CAD0] text-[#484D56] transition-colors hover:border-[#484D56] hover:text-[#171616]'

export function InsightShare({
  title,
  shareTitle,
  url,
}: {
  title: string
  shareTitle: string
  url: string
}) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <p className="font-sans text-base leading-6 font-normal text-[#171616]">{shareTitle}</p>
      <div className="flex items-center gap-3">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={buttonClassName}
        >
          <ShareIcon network="facebook" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={buttonClassName}
        >
          <ShareIcon network="linkedin" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={buttonClassName}
        >
          <ShareIcon network="x" />
        </a>
      </div>
    </div>
  )
}
