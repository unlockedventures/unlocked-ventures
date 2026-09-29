import type { Metadata } from 'next'

import { ConversationSection } from '@/components/site/contact/conversation-section'
import { HelpSection } from '@/components/site/contact/help-section'
import { homepageLocationStats, LocationsSection } from '@/components/site/locations/locations-section'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Start a conversation with Unlocked Ventures.',
}

export default function ContactPage() {
  return (
    <div className="bg-white">
      <ConversationSection />
      <HelpSection />
      <LocationsSection stats={homepageLocationStats} className="bg-white" />
    </div>
  )
}
