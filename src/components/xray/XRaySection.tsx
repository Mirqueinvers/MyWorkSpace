import { useState } from 'react'
import type { XRaySectionProps } from './types'
import { XRayHome } from './components'

export function XRaySection(props: XRaySectionProps) {
  const [homeResetKey, setHomeResetKey] = useState(0)

  return (
    <section className="xray-layout">
      <XRayHome
        key={homeResetKey}
        {...props}
        onReset={() => {
          props.onReset()
          setHomeResetKey((currentKey) => currentKey + 1)
        }}
      />
    </section>
  )
}
