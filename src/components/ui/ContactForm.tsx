import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, Mail, Send } from 'lucide-react'
import { getContactMode, sendContactMessage, type ContactPayload } from '@/services/contactApi'
import type { ContactMode } from '@/services/config'
import { CONTACT_LIMITS, hasErrors, validateContact, type ContactErrors } from '@/features/contact/validation'

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'delivered' } | { kind: 'demo' } | { kind: 'error'; message: string }

const EMPTY: ContactPayload = { name: '', email: '', subject: '', message: '' }

interface ContactFormProps {
  /** Fallback address shown when the message cannot be delivered. */
  email: string
  /** Override for tests; defaults to the configured mode. */
  mode?: ContactMode
}

export function ContactForm({ email, mode = getContactMode() }: ContactFormProps) {
  const [values, setValues] = useState<ContactPayload>(EMPTY)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ContactPayload, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [honeypot, setHoneypot] = useState('')
  const uid = useId()
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status.kind === 'demo' || status.kind === 'delivered' || status.kind === 'error') {
      statusRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [status.kind])

  const update = (field: keyof ContactPayload, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) setErrors(validateContact(next))
    if (status.kind === 'error') setStatus({ kind: 'idle' })
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validateContact(values)
    setErrors(found)
    setTouched({ name: true, email: true, subject: true, message: true })
    if (hasErrors(found)) {
      const first = (Object.keys(found) as (keyof ContactPayload)[])[0]
      document.getElementById(`${uid}-${first}`)?.focus()
      return
    }
    if (honeypot) {
      // Bot detected — pretend nothing happened, never deliver.
      setStatus({ kind: 'demo' })
      return
    }
    setStatus({ kind: 'submitting' })
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      }
      const result = await sendContactMessage(payload, mode)
      setStatus(result.delivered ? { kind: 'delivered' } : { kind: 'demo' })
      if (result.delivered) {
        setValues(EMPTY)
        setTouched({})
      }
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  const mailto = `mailto:${email}?subject=${encodeURIComponent(values.subject.trim())}&body=${encodeURIComponent(values.message.trim())}`

  const field = (name: keyof ContactPayload, label: string, props: { type?: string; autoComplete?: string; textarea?: boolean; max: number }) => {
    const id = `${uid}-${name}`
    const errId = `${id}-error`
    const showError = touched[name] && errors[name]
    const common = {
      id,
      name,
      value: values[name],
      maxLength: props.max,
      'aria-invalid': showError ? true : undefined,
      'aria-describedby': showError ? errId : undefined,
      onChange: (ev: { target: { value: string } }) => update(name, ev.target.value),
      onBlur: () => {
        setTouched((t) => ({ ...t, [name]: true }))
        setErrors(validateContact(values))
      },
      className: 'field',
      disabled: status.kind === 'submitting',
    }
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
          {label} <span className="text-rose-300" aria-hidden="true">*</span>
        </label>
        {props.textarea ? <textarea {...common} rows={5} className="field resize-y" /> : <input {...common} type={props.type ?? 'text'} autoComplete={props.autoComplete} />}
        {showError && (
          <p id={errId} className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-300">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
            {errors[name]}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {mode === 'demo' && (
        <div className="mb-4 flex gap-2.5 rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-sm text-amber-100" role="note">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <strong className="font-semibold">Demo mode:</strong> this form is not connected to a backend yet, so messages are{' '}
            <strong className="font-semibold">not delivered</strong>. You can still email me directly.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4" aria-describedby={`${uid}-status`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'Name', { autoComplete: 'name', max: CONTACT_LIMITS.name.max })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email', max: 254 })}
        </div>
        {field('subject', 'Subject', { max: CONTACT_LIMITS.subject.max })}
        {field('message', 'Message', { textarea: true, max: CONTACT_LIMITS.message.max })}
        <p className="-mt-2 text-right text-[11px] text-slate-500">
          {values.message.trim().length}/{CONTACT_LIMITS.message.max}
        </p>

        {/* Honeypot: hidden from humans and assistive tech */}
        <div className="hidden" aria-hidden="true">
          <label>
            Leave this field empty
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={status.kind === 'submitting'}>
          {status.kind === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" /> {mode === 'demo' ? 'Submit (demo)' : 'Send message'}
            </>
          )}
        </button>
      </form>

      <div ref={statusRef} id={`${uid}-status`} aria-live="polite" className="mt-4 scroll-mb-4">
        {status.kind === 'delivered' && (
          <div className="flex gap-2.5 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
            <p>Thanks! Your message was sent successfully. I&apos;ll get back to you soon.</p>
          </div>
        )}
        {status.kind === 'demo' && (
          <div className="rounded-xl border border-sky-300/25 bg-sky-400/10 p-3 text-sm text-sky-100">
            <p className="flex gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-sky-300" aria-hidden="true" />
              <span>
                Your message passed validation, but it was <strong>not sent</strong> — this portfolio is running in demo mode without a backend.
              </span>
            </p>
            <a href={mailto} className="btn-secondary mt-3 w-full">
              <Mail className="size-4" aria-hidden="true" /> Open in your email app instead
            </a>
          </div>
        )}
        {status.kind === 'error' && (
          <div className="flex gap-2.5 rounded-xl border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100" role="alert">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-300" aria-hidden="true" />
            <p>
              Sorry, the message could not be sent: {status.message} Please try again or email{' '}
              <a className="underline" href={`mailto:${email}`}>
                {email}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
