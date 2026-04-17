import { useEffect, useState } from 'react'
import type { UltrasoundProtocolEntry, UltrasoundStudyAttachment } from '../../../types/ultrasound'
import {
  getProtocolCopySections,
  getProtocolViewerHtml,
  writeProtocolToClipboard,
} from '../utils/ultrasoundProtocol'
import { XRayConfirmModal } from './XRayConfirmModal'

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
  const [attachments, setAttachments] = useState<UltrasoundStudyAttachment[]>([])
  const [attachmentsOpen, setAttachmentsOpen] = useState(false)
  const [attachmentsBusy, setAttachmentsBusy] = useState(false)
  const [attachmentsError, setAttachmentsError] = useState('')
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<number | null>(null)
  const [previewAttachmentId, setPreviewAttachmentId] = useState<number | null>(null)
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState('')
  const [previewImageUrls, setPreviewImageUrls] = useState<Record<number, string>>({})
  const [attachmentToDelete, setAttachmentToDelete] = useState<UltrasoundStudyAttachment | null>(null)
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false)

  const copySections = protocol ? getProtocolCopySections(protocol.documentHtml) : []
  const selectedAttachment = attachments.find((attachment) => attachment.id === selectedAttachmentId) ?? null
  const previewAttachment = attachments.find((attachment) => attachment.id === previewAttachmentId) ?? null
  const previewImageAttachments = attachments.filter((attachment) => attachment.kind === 'image')

  useEffect(() => {
    setAttachments(protocol?.attachments ?? [])
    setSelectedAttachmentId(null)
    setPreviewAttachmentId(null)
    setPreviewAttachmentUrl('')
    setPreviewImageUrls({})
    setAttachmentToDelete(null)
    setAttachmentsError('')
    setAttachmentsOpen(false)
  }, [protocol])

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      if (!previewAttachment || previewAttachment.kind !== 'image') {
        setPreviewAttachmentUrl('')
        return
      }

      if (!window.electronAPI?.ultrasoundJournal?.getAttachmentPreview) {
        setPreviewAttachmentUrl('')
        return
      }

      try {
        const previewUrl = await window.electronAPI.ultrasoundJournal.getAttachmentPreview(
          previewAttachment.filePath,
        )

        if (!cancelled) {
          setPreviewAttachmentUrl(previewUrl ?? '')
        }
      } catch {
        if (!cancelled) {
          setPreviewAttachmentUrl('')
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
    }
  }, [previewAttachment])

  useEffect(() => {
    let cancelled = false

    async function loadImagePreviews() {
      if (!window.electronAPI?.ultrasoundJournal?.getAttachmentPreview) {
        setPreviewImageUrls({})
        return
      }

      const nextUrls: Record<number, string> = {}

      for (const attachment of attachments) {
        if (attachment.kind !== 'image') {
          continue
        }

        try {
          const url = await window.electronAPI.ultrasoundJournal.getAttachmentPreview(attachment.filePath)
          if (url) {
            nextUrls[attachment.id] = url
          }
        } catch {}
      }

      if (!cancelled) {
        setPreviewImageUrls(nextUrls)
      }
    }

    void loadImagePreviews()

    return () => {
      cancelled = true
    }
  }, [attachments])

  if (!protocol && !loading && !error) {
    return null
  }

  async function handleCopyProtocol(
    sectionKey: string,
    documentHtml: string,
    conclusionText: string,
  ) {
    if (!documentHtml) {
      return
    }

    try {
      const copied = await writeProtocolToClipboard(documentHtml, {
        conclusionText,
      })

      if (!copied) {
        return
      }

      setCopiedSectionKey(sectionKey)
      window.setTimeout(() => {
        setCopiedSectionKey((currentKey) => (currentKey === sectionKey ? null : currentKey))
      }, 1400)
    } catch {}
  }

  async function handleAddAttachment() {
    if (!protocol || !window.electronAPI?.ultrasoundJournal) {
      return
    }

    if (
      !window.electronAPI.ultrasoundJournal.selectAttachmentFile ||
      !window.electronAPI.ultrasoundJournal.importAttachmentFile
    ) {
      setAttachmentsError('Добавление вложений недоступно в этой сборке.')
      return
    }

    setAttachmentsBusy(true)
    setAttachmentsError('')

    try {
      const filePath = await window.electronAPI.ultrasoundJournal.selectAttachmentFile()
      if (!filePath) {
        return
      }

      const attachment = await window.electronAPI.ultrasoundJournal.importAttachmentFile(
        protocol.id,
        filePath,
      )

      setAttachments((currentAttachments) => [...currentAttachments, attachment])
      setSelectedAttachmentId(attachment.id)
      setPreviewAttachmentId(attachment.kind === 'image' ? attachment.id : null)
      setAttachmentsOpen(true)
    } catch {
      setAttachmentsError('Не удалось добавить файл.')
    } finally {
      setAttachmentsBusy(false)
    }
  }

  async function handleOpenAttachment(attachment: UltrasoundStudyAttachment) {
    if (attachment.kind === 'image') {
      setSelectedAttachmentId(attachment.id)
      setPreviewAttachmentId(attachment.id)
      return
    }

    if (!window.electronAPI?.ultrasoundJournal?.openAttachment) {
      setAttachmentsError('Открытие файла недоступно в этой сборке.')
      return
    }

    try {
      await window.electronAPI.ultrasoundJournal.openAttachment(attachment.filePath)
    } catch {
      setAttachmentsError('Не удалось открыть файл.')
    }
  }

  async function handleDeleteAttachment(attachment: UltrasoundStudyAttachment) {
    if (!window.electronAPI?.ultrasoundJournal?.deleteAttachment) {
      setAttachmentsError('Удаление вложений недоступно в этой сборке.')
      return
    }

    try {
      setIsDeletingAttachment(true)
      const deleted = await window.electronAPI.ultrasoundJournal.deleteAttachment(attachment.id)
      if (!deleted) {
        setAttachmentsError('Не удалось удалить вложение.')
        return
      }

      setAttachments((currentAttachments) =>
        currentAttachments.filter((currentAttachment) => currentAttachment.id !== attachment.id),
      )
      setPreviewImageUrls((currentUrls) => {
        const nextUrls = { ...currentUrls }
        delete nextUrls[attachment.id]
        return nextUrls
      })

      if (selectedAttachmentId === attachment.id) {
        setSelectedAttachmentId(null)
      }

      if (previewAttachmentId === attachment.id) {
        setPreviewAttachmentId(null)
        setPreviewAttachmentUrl('')
      }
    } catch {
      setAttachmentsError('Не удалось удалить вложение.')
    } finally {
      setIsDeletingAttachment(false)
    }
  }

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
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
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="section-kicker">{kicker}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {copySections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      void handleCopyProtocol(section.key, section.documentHtml, section.conclusionText)
                    }
                    style={{
                      minWidth: '186px',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {copiedSectionKey === section.key ? (
                      <svg viewBox="0 0 20 20" aria-hidden="true" style={{ width: '16px', height: '16px', color: '#16a34a' }}>
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
                      `Скопировать ${section.label}`
                    )}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '12px' }}>
                <div style={{ overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setAttachmentsOpen((currentValue) => !currentValue)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      border: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>Вложения</span>
                    <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>({attachments.length})</span>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: '1px',
                        background: attachmentsOpen ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.55)',
                      }}
                    />
                  </button>

                  {attachmentsOpen ? (
                    <div
                      style={{
                        marginTop: '-1px',
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        borderRadius: '16px',
                        background: '#f8fafc',
                        padding: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => void handleAddAttachment()}
                          disabled={attachmentsBusy}
                          style={{
                            border: '1px solid rgba(148, 163, 184, 0.45)',
                            background: '#e2e8f0',
                            color: '#475569',
                            borderRadius: '10px',
                            padding: '6px 10px',
                            minHeight: '30px',
                            minWidth: '112px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {attachmentsBusy ? 'Добавляю...' : 'Добавить файл'}
                        </button>
                      </div>

                      {attachmentsError ? (
                        <p className="xray-journal-empty" style={{ marginTop: '10px' }}>
                          {attachmentsError}
                        </p>
                      ) : null}

                      {attachments.length === 0 ? (
                        <p className="xray-journal-empty" style={{ marginTop: '10px' }}>
                          Вложений пока нет.
                        </p>
                      ) : (
                        <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
                          {attachments.map((attachment, index) => {
                            const isSelected = selectedAttachmentId === attachment.id

                            return (
                              <div
                                key={attachment.id}
                                style={{
                                  width: '100%',
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                                  alignItems: 'center',
                                  gap: '10px',
                                  border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.35)'}`,
                                  borderRadius: '12px',
                                  padding: '10px 12px',
                                  background: isSelected ? '#eff6ff' : '#fff',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => void handleOpenAttachment(attachment)}
                                  style={{
                                    width: '100%',
                                    minWidth: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    border: 0,
                                    background: 'transparent',
                                    padding: 0,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                      {index + 1}. {attachment.originalName}
                                    </div>
                                    <div style={{ marginTop: '2px', fontSize: '12px', color: '#64748b' }}>
                                      {attachment.kind === 'image'
                                        ? 'Изображение'
                                        : attachment.kind === 'video'
                                          ? 'AVI'
                                          : 'Файл'}
                                    </div>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setAttachmentToDelete(attachment)}
                                  onMouseEnter={(event) => {
                                    event.currentTarget.style.color = '#dc2626'
                                  }}
                                  onMouseLeave={(event) => {
                                    event.currentTarget.style.color = '#94a3b8'
                                  }}
                                  style={{
                                    flexShrink: 0,
                                    border: 0,
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 0,
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                    style={{ width: '16px', height: '16px', display: 'block' }}
                                  >
                                    <path
                                      d="M5 5l10 10M15 5 5 15"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <button type="button" className="primary-button" onClick={onClose}>
              Закрыть
            </button>
          </div>

        {loading ? <p className="xray-journal-empty">Открываю протокол...</p> : null}
        {error ? <p className="xray-journal-empty">{error}</p> : null}

        {protocol ? (
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <iframe
              title={`УЗИ протокол ${protocol.id}`}
              srcDoc={getProtocolViewerHtml(protocol.documentHtml)}
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: '16px',
                background: '#f1f5f9',
                display: 'block',
              }}
            />
          </div>
        ) : null}
        </div>
      </div>

      {previewAttachment && previewAttachment.kind === 'image' && previewAttachmentUrl ? (
        <div
          className="modal-backdrop"
          onClick={() => {
            setPreviewAttachmentId(null)
            setPreviewAttachmentUrl('')
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 140,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(1240px, 100%)',
              maxHeight: '90vh',
              background: '#e2e8f0',
              borderRadius: '18px',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{previewAttachment.originalName}</div>
                <div style={{ marginTop: '2px', fontSize: '12px', color: '#64748b' }}>Изображение</div>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setPreviewAttachmentId(null)
                  setPreviewAttachmentUrl('')
                }}
              >
                Закрыть
                </button>
              </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px minmax(0, 1fr)',
                gap: '12px',
                minHeight: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  borderRadius: '14px',
                  background: '#cbd5e1',
                  padding: '8px',
                  overflowY: 'auto',
                  minHeight: 0,
                }}
              >
                <div style={{ display: 'grid', gap: '8px' }}>
                  {previewImageAttachments.map((attachment) => {
                    const isSelected = attachment.id === previewAttachment.id
                    return (
                      <button
                        key={attachment.id}
                        type="button"
                        onClick={() => {
                          setPreviewAttachmentId(attachment.id)
                        }}
                        style={{
                          border: `2px solid ${isSelected ? '#2563eb' : 'rgba(148, 163, 184, 0.35)'}`,
                          borderRadius: '10px',
                          background: isSelected ? '#dbeafe' : '#e2e8f0',
                          padding: '4px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={previewImageUrls[attachment.id] ?? previewAttachmentUrl}
                          alt={attachment.originalName}
                          style={{
                            display: 'block',
                            width: '100%',
                            height: '72px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            background: '#e2e8f0',
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  borderRadius: '14px',
                  background: '#475569',
                  padding: '10px',
                  overflow: 'auto',
                  minHeight: 0,
                }}
              >
                <img
                  src={previewAttachmentUrl}
                  alt={previewAttachment.originalName}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    margin: '0 auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {attachmentToDelete ? (
        <XRayConfirmModal
          kicker="Вложения"
          title="Удалить вложение?"
          description={
            <>
              <div style={{ color: '#0f172a', fontWeight: 600 }}>{attachmentToDelete.originalName}</div>
              <div style={{ marginTop: '6px' }}>Файл будет удалён из журнала и с диска.</div>
            </>
          }
          confirmLabel="Удалить"
          confirmBusyLabel="Удаляю..."
          isBusy={isDeletingAttachment}
          isTopLayer
          dialogLabelId="ultrasound-attachment-delete-title"
          closeAriaLabel="Закрыть подтверждение удаления вложения"
          onClose={() => setAttachmentToDelete(null)}
          onConfirm={() => {
            const currentAttachment = attachmentToDelete
            setAttachmentToDelete(null)
            if (currentAttachment) {
              void handleDeleteAttachment(currentAttachment)
            }
          }}
        />
      ) : null}
    </>
  )
}
