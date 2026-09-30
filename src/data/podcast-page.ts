export const podcastPage = {
  breadcrumb: {
    home: { label: 'Home', href: '/' },
    podcast: { label: 'Podcast', href: '/podcast' },
  },
  episode: {
    category: 'Communication',
    title: 'My Experience Working with Steve Jobs',
    meta: '12,480 plays · Maya Okafor · EP 24 · Sep 18, 2026',
    description:
      'Saker Ghani spent fourteen years at Apple, much of it in product reviews with Steve Jobs. He talks about what those meetings were really like, how Jobs decided what to cut, why he cared about details no customer would see, and which of those habits hold up for teams building products today.',
    coverSrc: '/podcast/episode/cover.png',
    coverAlt: 'Saker Ghani recording the episode My Experience Working with Steve Jobs',
    timeLabel: '47:38 / 1:52:32',
    progress: 418 / 1069,
  },
  chapters: [
    { time: '0:00', title: 'Joining Apple in 1997' },
    { time: '4:12', title: 'Led the development of the iMac' },
    { time: '16:15', title: 'Oversaw the launch of the iPod in 2001' },
    { time: '30:55', title: 'Introduced the iPhone in 2007' },
    { time: '45:15', title: 'Expanded the App Store ecosystem' },
    { time: '55:15', title: 'Pioneered the iPad in 2010' },
    { time: '1:01:20', title: 'Drove the transition to Apple Silicon chips' },
    { time: '1:30:32', title: 'Launched Apple Watch in 2015' },
    { time: '1:52:32', title: 'Focused on services like Apple Music and TV+' },
  ],
  listenNext: [
    {
      meta: '233K plays · 6 days ago',
      title: "How tech will (and won't) replace your doctor",
      href: '/podcast/how-tech-will-and-wont-replace-your-doctor',
      imageSrc: '/podcast/episode/listen-1.png',
    },
    {
      meta: '233K plays · 6 days ago',
      title: "How tech will (and won't) replace your doctor",
      href: '/podcast/how-tech-will-and-wont-replace-your-doctor',
      imageSrc: '/podcast/episode/listen-2.png',
    },
    {
      meta: '233K plays · 6 days ago',
      title: "How tech will (and won't) replace your doctor",
      href: '/podcast/how-tech-will-and-wont-replace-your-doctor',
      imageSrc: '/podcast/episode/listen-3.png',
    },
    {
      meta: '233K plays · 6 days ago',
      title: "How tech will (and won't) replace your doctor",
      href: '/podcast/how-tech-will-and-wont-replace-your-doctor',
      imageSrc: '/podcast/episode/listen-4.png',
    },
  ],
  allEpisodes: { label: 'All episode', href: '/podcast' },
  subscribe: [
    { name: 'Spotify', href: 'https://open.spotify.com', logoSrc: '/podcast/episode/subscribe-1.png', width: 67, height: 20 },
    { name: 'Apple Podcasts', href: 'https://podcasts.apple.com', logoSrc: '/podcast/episode/subscribe-2.png', width: 90, height: 18 },
    { name: 'RSS.com', href: 'https://rss.com', logoSrc: '/podcast/episode/subscribe-3.png', width: 63, height: 42 },
  ],
}
