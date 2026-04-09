import { useState } from 'react'
import type { UltrasoundProtocolEntry } from '../../../types/ultrasound'
import {
  getProtocolCopySections,
  getProtocolViewerHtml,
  writeProtocolToClipboard,
} from '../utils/ultrasoundProtocol'

interface UltrasoundProtocolModalProps {
  protocol: UltrasoundProtocolEntry | null
  loading: boolean
  error: string
  onClose: () => void
  kicker: string
}

export function UltrasoundProtocolModal({
  protocol,
  loading,
  error,
  onClose,
  kicker,
}: UltrasoundProtocolModalProps) {
  const [copiedSectionKey, setCopiedSectionKey] = useState<string | null>(null)
  const copySections = protocol ? getProtocolCopySections(protocol.documentHtml) : []

  if (!protocol && !loading && !error) {
    return null
  }

  async function handleCopyProtocol(sectionKey: string, documentHtml: string) {
    if (!documentHtml) {
      return
    }

    try {
      const copied = await writeProtocolToClipboard(documentHtml)

      if (!copied) {
        return
      }

      setCopiedSectionKey(sectionKey)
      window.setTimeout(() => {
        setCopiedSectionKey((currentKey) => (currentKey === sectionKey ? null : currentKey))
      }, 1400)
    } catch {}
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 120,
      }}
    >
      <div
        className="content-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(1100px, 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div>
            <p className="section-kicker">{kicker}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {copySections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className="primary-button"
                  onClick={() => void handleCopyProtocol(section.key, section.documentHtml)}
                  style={{
                    minWidth: '186px',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {copiedSectionKey === section.key ? (
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      style={{ width: '16px', height: '16px', color: '#16a34a' }}
                    >
                      <path
                        d="M4.5 10.5 8 14l7.5-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    `\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c ${section.label}`
                  )}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="primary-button" onClick={onClose}>
            {'\u0417\u0430\u043a\u0440\u044b\u0442\u044c'}
          </button>
        </div>

        {loading ? (
          <p className="xray-journal-empty">
            {'\u041e\u0442\u043a\u0440\u044b\u0432\u0430\u044e \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b...'}
          </p>
        ) : null}
        {error ? <p className="xray-journal-empty">{error}</p> : null}

        {protocol ? (
          <iframe
            title={`\u0423\u0417\u0418 \u043f\u0440\u043e\u0442\u043e\u043a\u043e\u043b ${protocol.id}`}
            srcDoc={getProtocolViewerHtml(protocol.documentHtml)}
            style={{
              width: '100%',
              minHeight: '70vh',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius: '16px',
              background: '#f1f5f9',
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
