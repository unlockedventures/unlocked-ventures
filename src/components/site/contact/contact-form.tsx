'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'

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
  'font-sans text-[13px] leading-4 font-normal tracking-[0.78px] text-[#222222]'

const fieldClassName =
  'h-[46px] w-full border-0 border-b border-black/12 bg-transparent font-sans text-base leading-6 font-normal text-[#25282D] outline-none placeholder:text-[#919191]'

const errorClassName = 'font-sans text-[13px] leading-4 font-normal text-[#B42318]'

const requiredMessage = 'This field is required'

function requiredText(value: string) {
  return value.trim().length > 0 || requiredMessage
}

export function ContactForm() {
  const [sent, setSent] = useState(false)
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
      countryCode: '+971',
      phone: '',
      message: '',
    },
  })

  if (sent) {
    return (
      <p className="font-sans text-2xl leading-8 font-normal tracking-[-0.5px] text-[#33353F]">
        Thank you. We will be in touch.
      </p>
    )
  }

  return (
    <form className="flex flex-col gap-8" noValidate onSubmit={handleSubmit(() => setSent(true))}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>First name *</span>
          <input
            className={fieldClassName}
            placeholder="Enter first name"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            {...register('firstName', { validate: requiredText })}
          />
          {errors.firstName ? (
            <span id="firstName-error" className={errorClassName}>
              {errors.firstName.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>Last name *</span>
          <input
            className={fieldClassName}
            placeholder="Enter last name"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            {...register('lastName', { validate: requiredText })}
          />
          {errors.lastName ? (
            <span id="lastName-error" className={errorClassName}>
              {errors.lastName.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>Company *</span>
          <input
            className={fieldClassName}
            placeholder="Enter company name"
            autoComplete="organization"
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={errors.company ? 'company-error' : undefined}
            {...register('company', { validate: requiredText })}
          />
          {errors.company ? (
            <span id="company-error" className={errorClassName}>
              {errors.company.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[11px]">
          <span className={labelClassName}>Email *</span>
          <input
            className={fieldClassName}
            type="email"
            placeholder="Enter email address"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              validate: (value) => {
                const trimmed = value.trim()
                if (!trimmed) return requiredMessage
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address'
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
          <span className={labelClassName}>Phone number</span>
          <span className="flex h-[46px] items-center gap-4 border-b border-black/12">
            <input
              className="w-16 shrink-0 border-0 bg-transparent font-sans text-base leading-6 text-[#242B1A] outline-none"
              aria-label="Country code"
              autoComplete="tel-country-code"
              aria-invalid={errors.countryCode ? true : undefined}
              aria-describedby={errors.phone || errors.countryCode ? 'phone-error' : undefined}
              {...register('countryCode', {
                validate: (value, formValues) => {
                  if (!formValues.phone.trim()) return true
                  if (!/^\+\d{1,4}$/.test(value.trim())) return 'Enter a valid country code'
                  return true
                },
              })}
            />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent font-sans text-base leading-6 text-[#25282D] outline-none placeholder:text-[#919191]"
              aria-label="Phone number"
              placeholder="543210987"
              autoComplete="tel-national"
              inputMode="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone || errors.countryCode ? 'phone-error' : undefined}
              {...register('phone', {
                validate: (value) => {
                  const trimmed = value.trim()
                  if (!trimmed) return true
                  if (!/^\d[\d\s()-]{5,}$/.test(trimmed)) return 'Enter a valid phone number'
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
          <span className={labelClassName}>Message *</span>
          <textarea
            className="h-[98px] w-full resize-none border-0 border-b border-black/12 bg-transparent pt-2 font-sans text-base leading-6 font-normal text-[#25282D] outline-none placeholder:text-[#919191]"
            placeholder="Enter message"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
            {...register('message', { validate: requiredText })}
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
        className="inline-flex h-12 w-fit cursor-pointer items-center gap-2.5 bg-[#484D56] px-5 font-sans text-base leading-6 font-normal text-white"
      >
        Send message
        <Image src="/contact/icon-arrow-up-right.svg" alt="" width={24} height={24} />
      </button>
    </form>
  )
}
