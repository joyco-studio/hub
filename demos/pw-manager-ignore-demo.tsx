'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ShieldOff, ShieldCheck, KeyRound, Mail, Lock } from 'lucide-react'

const pwIgnoreProps = {
  'data-1p-ignore': true,
  'data-lpignore': 'true',
  'data-bwignore': true,
  'data-form-type': 'other',
} as const

const inputClassName =
  'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground/10 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2'

function PwManagerIgnoreDemo() {
  const [withAttrs, setWithAttrs] = useState(true)

  // Key changes on toggle so inputs get re-created and pw managers
  // re-evaluate their targeting criteria on the fresh DOM elements.
  const inputKey = withAttrs ? 'ignored' : 'active'

  return (
    <div className="bg-muted/50 flex min-h-[500px] w-full items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {withAttrs ? (
              <ShieldOff className="text-muted-foreground size-5" />
            ) : (
              <ShieldCheck className="size-5 text-amber-500" />
            )}
            <h2 className="text-foreground text-sm font-semibold">
              {withAttrs
                ? 'Password managers ignored'
                : 'Password managers active'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setWithAttrs((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
              withAttrs ? 'bg-foreground' : 'bg-muted-foreground/30'
            )}
          >
            <span className="sr-only">Toggle pw manager ignore</span>
            <span
              className={cn(
                'bg-background pointer-events-none inline-block size-5 rounded-full shadow-lg ring-0 transition-transform duration-200',
                withAttrs ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        <form
          className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-lg"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
        >
          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4" />
              Email
            </label>
            <input
              key={`email-${inputKey}`}
              type="email"
              placeholder="you@example.com"
              autoComplete="off"
              className={inputClassName}
              {...(withAttrs && pwIgnoreProps)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4" />
              Password
            </label>
            <input
              key={`password-${inputKey}`}
              type="password"
              placeholder="********"
              autoComplete="off"
              className={inputClassName}
              {...(withAttrs && pwIgnoreProps)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              <KeyRound className="size-4" />
              Invite Code
            </label>
            <input
              key={`invite-${inputKey}`}
              type="text"
              placeholder="Enter invite code"
              autoComplete="off"
              className={inputClassName}
              {...(withAttrs && pwIgnoreProps)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground flex items-center gap-2 text-sm font-medium">
              OTP
            </label>
            <input
              key={`otp-${inputKey}`}
              type="text"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              className={inputClassName}
              {...(withAttrs && pwIgnoreProps)}
            />
          </div>

          {/* Attribute inspector */}
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Attributes on inputs
            </p>
            <div className="space-y-1 font-mono text-xs">
              {withAttrs ? (
                <>
                  <p className="text-emerald-500">data-1p-ignore</p>
                  <p className="text-emerald-500">
                    data-lpignore=&quot;true&quot;
                  </p>
                  <p className="text-emerald-500">data-bwignore</p>
                  <p className="text-emerald-500">
                    data-form-type=&quot;other&quot;
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground italic">
                  No ignore attributes
                </p>
              )}
            </div>
          </div>
        </form>

        <p className="text-muted-foreground text-center text-xs">
          Toggle the switch — inputs are re-mounted so password managers
          re-evaluate them.
        </p>
      </div>
    </div>
  )
}

export default PwManagerIgnoreDemo
