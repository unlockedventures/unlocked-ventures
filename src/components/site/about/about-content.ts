export type AboutLogo = {
  name: string
  src: string
  width: number
  height: number
}

export type AboutExperienceRole = {
  role: string
  company: string
  dateLabel: string
  summary?: string
  highlights: string[]
  defaultOpen?: boolean
}

export type AboutContent = {
  metaTitle: string
  metaDescription: string
  breadcrumbHomeLabel: string
  breadcrumbHomeHref: string
  breadcrumbCurrent: string
  title: string
  description: string
  badgeSrc?: string
  badgeAlt: string
  heroSrc?: string
  heroAlt: string
  logoTitle: string
  logos: AboutLogo[]
  deliveredTitle: string
  stats: { value: string; label: string }[]
  founderRole: string
  founderTitle: string
  founderSummary: string
  founderBio: string
  founderImageSrc?: string
  founderImageAlt: string
  founderCtaLabel: string
  founderCtaHref: string
  experienceTitle: string
  experienceRoles: AboutExperienceRole[]
  howWeWorkTitle: string
  principles: { title: string; body: string; iconSrc: string; width: number; height: number }[]
}
