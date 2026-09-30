import type { Metadata } from 'next'

import { ConversationSection } from '@/components/site/contact/conversation-section'
import { HelpSection } from '@/components/site/contact/help-section'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { getContact } from '@/data/get-contact'
import { getLocations } from '@/data/get-locations'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact()

  return {
    title: contact?.metaTitle,
    description: contact?.metaDescription,
  }
}

export default async function ContactPage() {
  const [contact, locations] = await Promise.all([getContact(), getLocations()])

  return (
    <div className="bg-white">
      {contact ? (
        <>
          <ConversationSection {...contact} />
          <HelpSection title={contact.helpTitle} form={contact.form} />
        </>
      ) : null}
      {locations ? <LocationsSection {...locations} className="bg-white" /> : null}
    </div>
  )
}
