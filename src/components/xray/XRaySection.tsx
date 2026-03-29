import { useState } from 'react'
import { XRAY_TABS } from './config'
import type { XRayTab } from './config'
import type { XRaySectionProps } from './types'
import { XRayDoses, XRayFlJournal, XRayHome, XRayJournal, XRayStatistics } from './components'

export function XRaySection(props: XRaySectionProps) {
  const [homeTab, journalTab, flJournalTab, dosesTab] = XRAY_TABS
  const [activeTab, setActiveTab] = useState<XRayTab>(XRAY_TABS[0])
  const [homeResetKey, setHomeResetKey] = useState(0)

  function handleTabClick(tab: XRayTab) {
    if (tab === activeTab && tab === homeTab) {
      props.onReset()
      setHomeResetKey((currentKey) => currentKey + 1)
      return
    }

    setActiveTab(tab)
  }

  function renderContent() {
    if (activeTab === homeTab) {
      return <XRayHome key={homeResetKey} {...props} />
    }

    if (activeTab === journalTab) {
      return (
        <XRayJournal
          onSelectPatient={props.onSelectPatient}
          onOpenPatient={() => setActiveTab(homeTab)}
        />
      )
    }

    if (activeTab === flJournalTab) {
      return <XRayFlJournal />
    }

    if (activeTab === dosesTab) {
      return <XRayDoses />
    }

    return <XRayStatistics />
  }

  return (
    <section className="xray-layout">
      <nav className="xray-subnav" aria-label="Разделы X-ray">
        {XRAY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`xray-subnav-button${tab === activeTab ? ' is-active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {renderContent()}
    </section>
  )
}

