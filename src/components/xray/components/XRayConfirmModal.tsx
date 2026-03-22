import type { ReactNode } from 'react'

interface XRayConfirmModalProps {
  kicker: string
  title: string
  description: ReactNode
  confirmLabel: string
  confirmBusyLabel: string
  isBusy: boolean
  isTopLayer?: boolean
  dialogLabelId: string
  closeAriaLabel: string
  onClose: () => void
  onConfirm: () => void
}

export function XRayConfirmModal({
  kicker,
  title,
  description,
  confirmLabel,
  confirmBusyLabel,
  isBusy,
  isTopLayer = false,
  dialogLabelId,
  closeAriaLabel,
  onClose,
  onConfirm,
}: XRayConfirmModalProps) {
  const overlayClassName = isTopLayer
    ? 'reminders-modal-overlay xray-top-overlay'
    : 'reminders-modal-overlay'
  const modalClassName = isTopLayer
    ? 'reminders-modal xray-confirm-modal xray-top-modal'
    : 'reminders-modal xray-confirm-modal'

  return (
    <div className={overlayClassName}>
      <section
        className={modalClassName}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogLabelId}
      >
        <div className="reminders-modal-head">
          <div>
            <div className="section-kicker">{kicker}</div>
            <h3 id={dialogLabelId} className="reminders-modal-title">
              {title}
            </h3>
          </div>

          <button
            type="button"
            className="reminders-modal-close"
            onClick={onClose}
            disabled={isBusy}
            aria-label={closeAriaLabel}
          >
            ×
          </button>
        </div>

        <p className="xray-confirm-copy">{description}</p>

        <div className="xray-confirm-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={isBusy}>
            Отмена
          </button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? confirmBusyLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
