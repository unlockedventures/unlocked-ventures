export type AwardSeed = {
  name: string
  file: string
  displayWidth: number
  displayHeight: number
  href: string
}

const defaultHref = 'https://unlockedventures.com'

export const awardSeed: readonly AwardSeed[] = [
  { name: 'GDPR', file: 'gdpr.png', displayWidth: 65, displayHeight: 97, href: defaultHref },
  { name: 'ISO 9001:2015', file: 'iso-9001.png', displayWidth: 62, displayHeight: 97, href: defaultHref },
  { name: 'ISO 27001:2022', file: 'iso-27001.png', displayWidth: 68, displayHeight: 97, href: defaultHref },
  { name: 'CMMI Level 3', file: 'cmmi.png', displayWidth: 65, displayHeight: 97, href: defaultHref },
  { name: 'Certified Partner', file: 'certified-partner.png', displayWidth: 79, displayHeight: 71, href: defaultHref },
  { name: 'HR Tech Awards', file: 'hr-tech-awards.png', displayWidth: 111, displayHeight: 75, href: defaultHref },
  {
    name: 'EY Entrepreneur Of The Year',
    file: 'ey-entrepreneur.png',
    displayWidth: 148,
    displayHeight: 31,
    href: defaultHref,
  },
  { name: 'Fortune 100', file: 'fortune-100.png', displayWidth: 96, displayHeight: 41, href: defaultHref },
  { name: 'Inc. 5000', file: 'inc-5000.png', displayWidth: 62, displayHeight: 40, href: defaultHref },
  {
    name: 'Tech Forward Awards',
    file: 'tech-forward-awards.png',
    displayWidth: 115,
    displayHeight: 49,
    href: defaultHref,
  },
  { name: 'Global Tech Awards', file: 'global-tech-awards.png', displayWidth: 95, displayHeight: 87, href: defaultHref },
  { name: 'BASIS', file: 'basis.png', displayWidth: 113, displayHeight: 37, href: defaultHref },
]
