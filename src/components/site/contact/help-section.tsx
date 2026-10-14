import { ContactForm, type ContactFormContent } from '@/components/site/contact/contact-form'

export function HelpSection({ title, form }: { title: string; form: ContactFormContent }) {
  return (
    <section className="relative overflow-hidden bg-[#F5F7FA]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(28,172,174,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(51,53,63,0.05),transparent_50%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 px-4 py-16 sm:px-6 md:px-8 md:py-20 lg:py-[100px] xl:px-14 min-[1440px]:pb-[114px]!">
        <div className="flex w-full max-w-[902px] flex-col gap-12 rounded-2xl bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(48,55,63,0.28)] ring-1 ring-[#33353F]/6 backdrop-blur-[2px] sm:p-8 lg:p-12">
          <h2 className="max-w-[12ch] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px] min-[1440px]:max-w-[391px]">
            {title}
          </h2>
          <ContactForm content={form} />
        </div>
      </div>
    </section>
  )
}
