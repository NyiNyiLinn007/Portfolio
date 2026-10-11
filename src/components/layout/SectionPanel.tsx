import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { SECTION_IDS, SECTIONS } from '@/data/sections'
import { SECTION_REGISTRY } from '@/features/sectionRegistry'
import { useAppStore } from '@/store/useAppStore'
import { Panel } from '@/components/ui/Panel'

/** The information panel for whichever object is currently selected. */
export function SectionPanel() {
  const active = useAppStore((s) => s.activeSection)
  const openSection = useAppStore((s) => s.openSection)
  const closeSection = useAppStore((s) => s.closeSection)

  const meta = active ? SECTIONS[active] : null
  const entry = active ? SECTION_REGISTRY[active] : null
  const index = active ? SECTION_IDS.indexOf(active) : -1
  const prev = index >= 0 ? SECTION_IDS[(index - 1 + SECTION_IDS.length) % SECTION_IDS.length] : null
  const next = index >= 0 ? SECTION_IDS[(index + 1) % SECTION_IDS.length] : null

  return (
    <Panel
      open={!!active}
      onClose={closeSection}
      title={meta?.title ?? ''}
      eyebrow={meta?.object}
      icon={entry ? <entry.Icon className="size-5" aria-hidden="true" /> : null}
      contentKey={active ?? undefined}
      footer={
        active && prev && next ? (
          <div className="flex items-center gap-2">
            <button type="button" className="icon-btn" onClick={() => openSection(prev)} aria-label={`Previous: ${SECTIONS[prev].title}`}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={closeSection}>
              <Undo2 className="size-4" aria-hidden="true" /> Return to Room
            </button>
            <button type="button" className="icon-btn" onClick={() => openSection(next)} aria-label={`Next: ${SECTIONS[next].title}`}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null
      }
    >
      {entry && <entry.Content />}
    </Panel>
  )
}
