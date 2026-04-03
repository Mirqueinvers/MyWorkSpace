import { useState } from 'react'
import { XRayFlJournal, XRayJournal } from './components'
import { UltrasoundJournal } from './components/UltrasoundJournal'
import type { XRayPatient } from '../../types/xray'

const JOURNAL_TABS = ['Рентген журнал', 'ФЛ журнал', 'УЗИ журнал'] as const

type JournalTab = (typeof JOURNAL_TABS)[number]

interface XRayJournalsSectionProps {
  onSelectPatient: (patient: XRayPatient) => void
  onOpenPatient: () => void
}

export function XRayJournalsSection({
  onSelectPatient,
  onOpenPatient,
}: XRayJournalsSectionProps) {
  const [activeTab, setActiveTab] = useState<JournalTab>(JOURNAL_TABS[0])

  return (
    <section className="xray-layout">
      <nav className="xray-subnav" aria-label="Разделы журналов">
        {JOURNAL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`xray-subnav-button${tab === activeTab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Рентген журнал' ? (
        <XRayJournal onSelectPatient={onSelectPatient} onOpenPatient={onOpenPatient} />
      ) : null}

      {activeTab === 'ФЛ журнал' ? (
        <XRayFlJournal onSelectPatient={onSelectPatient} onOpenPatient={onOpenPatient} />
      ) : null}

      {activeTab === 'УЗИ журнал' ? (
        <UltrasoundJournal onSelectPatient={onSelectPatient} onOpenPatient={onOpenPatient} />
      ) : null}
    </section>
  )
}
