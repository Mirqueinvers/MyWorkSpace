import { useState } from 'react'
import { XRAY_TABS } from './config'
import type { XRayTab } from './config'
import type { XRaySectionProps } from './types'
import { XRayHome } from './components'

export function XRaySection(props: XRaySectionProps) {
  const [activeTab, setActiveTab] = useState<XRayTab>(XRAY_TABS[0])
  const [homeResetKey, setHomeResetKey] = useState(0)

  function handleTabClick(tab: XRayTab) {
    if (tab === activeTab && tab === 'Главная') {
      props.onReset()
      setHomeResetKey((currentKey) => currentKey + 1)
      return
    }

    setActiveTab(tab)
  }

  function renderContent() {
    if (activeTab === 'Главная') {
      return <XRayHome key={homeResetKey} {...props} />
    }

    if (activeTab === 'Журнал') {
      return (
        <section className="content-card placeholder-card">
          <p className="section-kicker">X-ray</p>
          <h2>Журнал</h2>
          <p className="section-copy">
            Здесь можно будет собрать основной список исследований, статусы и историю
            работы по пациентам.
          </p>
        </section>
      )
    }

    return (
      <section className="content-card placeholder-card">
        <p className="section-kicker">X-ray</p>
        <h2>Статистика</h2>
        <p className="section-copy">
          Здесь можно будет показать сводку по выполненным исследованиям и текущей
          нагрузке.
        </p>
      </section>
    )
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

