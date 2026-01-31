'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FieldState {
  value: string
  touched: boolean
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateName(name: string): boolean {
  return name.trim().length >= 2
}

function validatePhone(phone: string): boolean {
  return /^\+?[\d\s-]{10,}$/.test(phone)
}

function FormValidationGroupHasDemo() {
  const [email, setEmail] = useState<FieldState>({ value: '', touched: false })
  const [name, setName] = useState<FieldState>({ value: '', touched: false })
  const [phone, setPhone] = useState<FieldState>({ value: '', touched: false })

  const emailHasError = email.touched && !validateEmail(email.value)
  const nameHasError = name.touched && !validateName(name.value)
  const phoneHasError = phone.touched && !validatePhone(phone.value)

  const allValid =
    email.touched &&
    name.touched &&
    phone.touched &&
    validateEmail(email.value) &&
    validateName(name.value) &&
    validatePhone(phone.value)

  return (
    <div className="bg-muted/50 flex min-h-[500px] w-full items-center justify-center p-4 sm:p-8">
      {/* The form has "group" class - all group-has-* selectors query within this scope */}
      <form
        className="bg-card border-border group w-full max-w-md overflow-hidden rounded-xl border shadow-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* 
          Header section - reacts to validation state anywhere in the form
          group-has-[.field-error] queries: "does this group contain any element with .field-error class?"
        */}
        <div
          className={cn(
            'border-border border-b p-5 transition-colors duration-300',
            'group-has-[.field-error]:border-red-500/30 group-has-[.field-error]:bg-red-500/10',
            'group-has-[.field-success]:border-emerald-500/30 group-has-[.field-success]:bg-emerald-500/10'
          )}
        >
          <div className="flex items-center gap-3">
            {/* Icon changes based on validation state */}
            <div
              className={cn(
                'bg-muted flex size-10 items-center justify-center rounded-full transition-colors duration-300',
                'group-has-[.field-error]:bg-red-500/20',
                'group-has-[.field-success]:bg-emerald-500/20'
              )}
            >
              <AlertCircle
                className={cn(
                  'hidden size-5 text-red-500',
                  'group-has-[.field-error]:block'
                )}
              />
              <CheckCircle2
                className={cn(
                  'hidden size-5 text-emerald-500',
                  'group-has-[.field-success]:block'
                )}
              />
              <Mail
                className={cn(
                  'text-muted-foreground size-5',
                  'group-has-[.field-error]:hidden',
                  'group-has-[.field-success]:hidden'
                )}
              />
            </div>

            <div className="flex-1">
              <h2
                className={cn(
                  'text-foreground font-semibold transition-colors duration-300',
                  'group-has-[.field-error]:text-red-500',
                  'group-has-[.field-success]:text-emerald-500'
                )}
              >
                Contact Form
              </h2>
              {/* Description text changes based on state */}
              <p
                className={cn(
                  'text-muted-foreground text-sm transition-colors duration-300',
                  'group-has-[.field-error]:text-red-500/80',
                  'group-has-[.field-success]:text-emerald-500/80'
                )}
              >
                <span className="group-has-[.field-error]:hidden group-has-[.field-success]:hidden">
                  Please fill out all required fields
                </span>
                <span className="hidden group-has-[.field-error]:inline group-has-[.field-success]:hidden">
                  Please fix the errors below
                </span>
                <span className="hidden group-has-[.field-success]:inline">
                  All fields are valid!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Form fields - each can have .field-error class when invalid */}
        <div className="space-y-4 p-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4" />
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email.value}
              onChange={(e) =>
                setEmail({ value: e.target.value, touched: true })
              }
              onBlur={() => setEmail((prev) => ({ ...prev, touched: true }))}
              className={cn(
                'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200',
                'focus:border-foreground focus:ring-foreground/10 focus:ring-2',
                // Add field-error class when invalid - this triggers group-has-[.field-error]
                emailHasError &&
                  'field-error border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {emailHasError && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="size-3" />
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Name field */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <User className="size-4" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name.value}
              onChange={(e) =>
                setName({ value: e.target.value, touched: true })
              }
              onBlur={() => setName((prev) => ({ ...prev, touched: true }))}
              className={cn(
                'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200',
                'focus:border-foreground focus:ring-foreground/10 focus:ring-2',
                nameHasError &&
                  'field-error border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {nameHasError && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="size-3" />
                Name must be at least 2 characters
              </p>
            )}
          </div>

          {/* Phone field */}
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Phone className="size-4" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone.value}
              onChange={(e) =>
                setPhone({ value: e.target.value, touched: true })
              }
              onBlur={() => setPhone((prev) => ({ ...prev, touched: true }))}
              className={cn(
                'border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200',
                'focus:border-foreground focus:ring-foreground/10 focus:ring-2',
                phoneHasError &&
                  'field-error border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            {phoneHasError && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="size-3" />
                Please enter a valid phone number
              </p>
            )}
          </div>

          {/* Hidden success marker - appears when all fields are valid */}
          {allValid && <div className="field-success hidden" />}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!allValid}
            className={cn(
              'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Submit
          </button>
        </div>

        {/* Footer hint */}
        <div className="border-border bg-muted/50 border-t px-5 py-3">
          <p className="text-muted-foreground text-center text-xs">
            Try typing invalid values in the fields above and see the header
            react!
          </p>
        </div>
      </form>
    </div>
  )
}

export default FormValidationGroupHasDemo
