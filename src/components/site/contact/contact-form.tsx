'use client'

import Image from 'next/image'
import { useForm } from 'react-hook-form'

import { useContactStore } from '@/stores/contact-store'

type ContactValues = {
  firstName: string
  lastName: string
  company: string
  email: string
  countryCode: string
  phone: string
  message: string
}

const labelClassName =
  'font-sans text-[13px] leading-4 font-normal tracking-[0.78px] text-[#222222] min-[1440px]:text-[#222222]/80 min-[1440px]:uppercase'

const fieldClassName =
  'h-[46px] w-full border-0 border-b border-black/12 bg-transparent font-sans text-base leading-6 font-normal text-[#25282D] outline-none placeholder:text-[#919191]'

const errorClassName = 'font-sans text-[13px] leading-4 font-normal text-[#B42318]'

export type ContactField = {
  label: string
  placeholder: string
}

export type ContactFormContent = {
  successMessage: string
  submitLabel: string
  countryCode: string
  phoneLabel: string
  phonePlaceholder: string
  countryCodeLabel: string
  phoneAriaLabel: string
  requiredMessage: string
  invalidEmailMessage: string
  invalidCountryCodeMessage: string
  invalidPhoneMessage: string
  firstName: ContactField
  lastName: ContactField
  company: ContactField
  email: ContactField
  message: ContactField
}

export function ContactForm({ content }: { content: ContactFormContent }) {
  const sent = useContactStore((state) => state.sent)
  const setSent = useContactStore((state) => state.setSent)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      countryCode: content.countryCode,
      phone: '',
      message: '',
    },
  })

  if (sent) {
    return (
      <p className="font-sans text-2xl leading-8 font-normal tracking-[-0.5px] text-[#33353F]">
        {content.successMessage}
      </p>
    )
  }

  return (
    <form className="flex flex-col gap-8" noValidate onSubmit={handleSubmit(() => setSent(true))}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>{content.firstName.label}</span>
          <input
            className={fieldClassName}
            placeholder={content.firstName.placeholder}
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            {...register('firstName', {
              validate: (value) => value.trim().length > 0 || content.requiredMessage,
            })}
          />
          {errors.firstName ? (
            <span id="firstName-error" className={errorClassName}>
              {errors.firstName.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>{content.lastName.label}</span>
          <input
            className={fieldClassName}
            placeholder={content.lastName.placeholder}
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            {...register('lastName', {
              validate: (value) => value.trim().length > 0 || content.requiredMessage,
            })}
          />
          {errors.lastName ? (
            <span id="lastName-error" className={errorClassName}>
              {errors.lastName.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>{content.company.label}</span>
          <input
            className={fieldClassName}
            placeholder={content.company.placeholder}
            autoComplete="organization"
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={errors.company ? 'company-error' : undefined}
            {...register('company', {
              validate: (value) => value.trim().length > 0 || content.requiredMessage,
            })}
          />
          {errors.company ? (
            <span id="company-error" className={errorClassName}>
              {errors.company.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>{content.email.label}</span>
          <input
            className={fieldClassName}
            type="email"
            placeholder={content.email.placeholder}
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              validate: (value) => {
                const trimmed = value.trim()
                if (!trimmed) return content.requiredMessage
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return content.invalidEmailMessage
                return true
              },
            })}
          />
          {errors.email ? (
            <span id="email-error" className={errorClassName}>
              {errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px] md:col-span-2">
          <span className={labelClassName}>{content.phoneLabel}</span>
          <span className="flex h-[46px] items-center gap-4 border-b border-black/12">
            <input
              className="w-16 shrink-0 border-0 bg-transparent font-sans text-base leading-6 text-[#242B1A] outline-none"
              aria-label={content.countryCodeLabel}
              autoComplete="tel-country-code"
              aria-invalid={errors.countryCode ? true : undefined}
              aria-describedby={errors.phone || errors.countryCode ? 'phone-error' : undefined}
              {...register('countryCode', {
                validate: (value, formValues) => {
                  if (!formValues.phone.trim()) return true
                  if (!/^\+\d{1,4}$/.test(value.trim())) return content.invalidCountryCodeMessage
                  return true
                },
              })}
            />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent font-sans text-base leading-6 text-[#25282D] outline-none placeholder:text-[#919191]"
              aria-label={content.phoneAriaLabel}
              placeholder={content.phonePlaceholder}
              autoComplete="tel-national"
              inputMode="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone || errors.countryCode ? 'phone-error' : undefined}
              {...register('phone', {
                validate: (value) => {
                  const trimmed = value.trim()
                  if (!trimmed) return true
                  if (!/^\d[\d\s()-]{5,}$/.test(trimmed)) return content.invalidPhoneMessage
                  return true
                },
              })}
            />
          </span>
          {errors.phone || errors.countryCode ? (
            <span id="phone-error" className={errorClassName}>
              {errors.phone?.message ?? errors.countryCode?.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px] md:col-span-2">
          <span className={labelClassName}>{content.message.label}</span>
          <textarea
            className="h-[98px] w-full resize-none border-0 border-b border-black/12 bg-transparent pt-2 font-sans text-base leading-6 font-normal text-[#25282D] outline-none placeholder:text-[#919191]"
            placeholder={content.message.placeholder}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
            {...register('message', {
              validate: (value) => value.trim().length > 0 || content.requiredMessage,
            })}
          />
          {errors.message ? (
            <span id="message-error" className={errorClassName}>
              {errors.message.message}
            </span>
          ) : null}
        </label>
      </div>
      <button
        type="submit"
        className="group inline-flex h-12 w-fit cursor-pointer items-center gap-2.5 rounded-md bg-[#484D56] px-5 font-sans text-base leading-6 font-normal text-white transition-[background-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#3c4149] hover:shadow-[0_12px_28px_-14px_rgba(72,77,86,0.55)] focus-visible:-translate-y-0.5 focus-visible:bg-[#3c4149] focus-visible:shadow-[0_12px_28px_-14px_rgba(72,77,86,0.55)] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {content.submitLabel}
        <Image
          src="/contact/icon-arrow-up-right.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45 motion-reduce:transition-none"
        />
      </button>
    </form>
  )
}
