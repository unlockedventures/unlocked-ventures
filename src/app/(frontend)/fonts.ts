import localFont from 'next/font/local'

// Normal width only. This set has no semibold or bold cut, so Medium also
// covers 600 and Black also covers 700.
export const helveticaNeueLtPro = localFont({
  src: [
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Th.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-UltLt.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Lt.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Roman.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Md.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Md.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Blk.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/helvetica-neue-lt-pro/HelveticaNeueLTPro-Blk.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-helvetica-neue-lt-pro-next',
  display: 'swap',
})

export const dmSans = localFont({
  src: '../../assets/fonts/dm-sans/DMSans-Variable.ttf',
  variable: '--font-dm-sans-next',
  display: 'swap',
  weight: '100 1000',
})

export const inter = localFont({
  src: '../../assets/fonts/inter/Inter-Variable.ttf',
  variable: '--font-inter-next',
  display: 'swap',
  weight: '100 1000',
})
