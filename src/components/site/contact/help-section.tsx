import { ContactForm, type ContactFormContent } from '@/components/site/contact/contact-form'

export function HelpSection({ title, form }: { title: string; form: ContactFormContent }) {
  return (
    <section className="bg-[#F3F4F9] px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:px-[72px] lg:py-[100px] xl:px-[156px]">
      <div className="mx-auto flex w-full max-w-[902px] flex-col gap-12 bg-white p-6 sm:p-8 lg:p-12">
        <h2 className="max-w-[12ch] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          {title}
        </h2>
        <ContactForm content={form} />
      </div>
    </section>
  )
}
