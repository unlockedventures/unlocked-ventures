'use client'

import { ConversationSection } from '@/components/site/contact/conversation-section'
import { HelpSection } from '@/components/site/contact/help-section'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { useContact, useLocations } from '@/hooks/queries/use-site-queries'

export function ContactPageView() {
  const contact = useContact()
  const locations = useLocations()
  const content = contact.data

  return (
    <div className="bg-white">
      {content ? (
        <>
          <ConversationSection {...content} />
          <HelpSection title={content.helpTitle} form={content.form} />
        </>
      ) : null}
      {locations.data ? <LocationsSection {...locations.data} className="bg-white" /> : null}
    </div>
  )
}
