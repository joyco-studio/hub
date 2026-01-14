---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#form-best-practices
---

# Form Best Practices

### What

- Use correct `type` attributes (`email`, `tel`, `url`, `number`) and `inputmode`
- Never block paste with `onPaste` + `preventDefault`
- Labels must be clickable (`htmlFor` or wrapping the control)
- Disable spellcheck on emails, codes, usernames: `spellCheck={false}`
- Checkboxes/radios: label + control share single hit target (no dead zones)
- Submit button stays enabled until request starts
- Show errors inline next to fields; focus first error on submit
- Use `autocomplete="off"` on non-auth fields to avoid password manager triggers

### Why

Proper input types improve mobile UX by showing the right keyboard (email shows `@`, tel shows number pad). Blocking paste is hostile—users paste passwords from managers, verification codes from messages, etc. Clickable labels increase hit targets and improve accessibility. Pre-disabling submit buttons prevents submission entirely if JavaScript fails.

### Good

```tsx
<form onSubmit={handleSubmit}>
  {/* Proper type and autocomplete */}
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    autoComplete="email"
    spellCheck={false}
    required
  />
  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

  {/* Phone with tel type and inputmode */}
  <label htmlFor="phone">Phone</label>
  <input
    id="phone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
  />

  {/* Verification code - no autocomplete, no spellcheck */}
  <label htmlFor="code">Verification Code</label>
  <input
    id="code"
    type="text"
    inputMode="numeric"
    autoComplete="one-time-code"
    spellCheck={false}
    pattern="[0-9]*"
  />

  {/* Checkbox with clickable label */}
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" name="terms" />
    <span>I agree to the terms</span>
  </label>

  {/* Submit enabled until loading */}
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting…' : 'Submit'}
  </button>
</form>
```

### Bad

```tsx
<form>
  {/* Wrong type - shows regular keyboard on mobile */}
  <input type="text" placeholder="Email" />

  {/* Blocking paste - hostile to users */}
  <input
    type="password"
    onPaste={(e) => e.preventDefault()}
  />

  {/* Label not connected to input */}
  <label>Username</label>
  <input type="text" />

  {/* Spellcheck on email - shows red squiggles */}
  <input type="email" />

  {/* Checkbox with dead zone between checkbox and text */}
  <div className="flex items-center gap-4">
    <input type="checkbox" id="terms" />
    <label htmlFor="terms">I agree to the terms</label>
  </div>
</form>
```
