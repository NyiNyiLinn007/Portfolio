import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { PANEL_WIDTH, SHEET_VISIBLE_FRACTION } from '@/utils/uiConstants'

interface PanelProps {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** Changing this key re-runs the enter animation & resets scroll (e.g. switching sections). */
  contentKey?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog panel.
 * Desktop: glass side panel on the right (the 3D scene stays visible on the left).
 * Mobile: bottom sheet with drag-to-dismiss handle.
 * Escape closes, focus is moved in on open, trapped while open and restored on close.
 */
export function Panel({ open, onClose, title, eyebrow, icon, children, footer, contentKey }: PanelProps) {
  const isDesktop = useIsDesktop()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)
  const dragControls = useDragControls()

  // Remember what had focus so it can be restored on close.
  useEffect(() => {
    if (open) {
      restoreFocus.current = (document.activeElement as HTMLElement) ?? null
    } else if (restoreFocus.current) {
      const el = restoreFocus.current
      restoreFocus.current = null
      if (el && document.contains(el) && el !== document.body) el.focus({ preventScroll: true })
    }
  }, [open])

  // Move focus into the panel whenever it opens or its content changes.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      panelRef.current?.focus({ preventScroll: true })
    }, 30)
    return () => window.clearTimeout(id)
  }, [open, contentKey])

  // Escape to close + focus trap.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (!panelRef.current.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const desktopMotion = {
    initial: { x: PANEL_WIDTH * 0.25, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: PANEL_WIDTH * 0.25, opacity: 0 },
  }
  const mobileMotion = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          {...(isDesktop ? desktopMotion : mobileMotion)}
          transition={{ type: 'spring', damping: 30, stiffness: 260, mass: 0.9 }}
          drag={isDesktop ? false : 'y'}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 600) onClose()
          }}
          className={
            isDesktop
              ? 'glass pointer-events-auto fixed top-20 right-4 bottom-4 z-40 flex flex-col overflow-hidden rounded-3xl outline-none'
              : 'glass pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden rounded-t-3xl pb-[env(safe-area-inset-bottom)] outline-none'
          }
          style={isDesktop ? { width: PANEL_WIDTH } : { height: `${Math.round((1 - SHEET_VISIBLE_FRACTION) * 100)}dvh` }}
        >
          {!isDesktop && (
            <div
              className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
              aria-hidden="true"
            >
              <span className="h-1.5 w-12 rounded-full bg-slate-400/40" />
            </div>
          )}
          <header className="flex items-start gap-3 border-b border-white/5 px-5 pt-3 pb-4 lg:px-6 lg:pt-5">
            {icon && (
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h2 id={titleId} className="mt-0.5 truncate text-xl font-semibold text-white">
                {title}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="icon-btn" aria-label="Close panel and return to room">
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          <motion.div
            key={contentKey}
            ref={scrollRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain px-5 py-5 lg:px-6"
          >
            {children}
          </motion.div>
          {footer && <footer className="border-t border-white/5 px-5 py-3 lg:px-6">{footer}</footer>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
