import type { FormEvent } from 'react'
import {
  normalizeBirthDateInput,
  normalizePersonNameInput,
} from '../../../utils/patient'
import type { PatientFormState } from '../types'

interface XRayPatientEditModalProps {
  patientEditForm: PatientFormState
  patientEditError: string
  isSaving: boolean
  onFormChange: (updater: (current: PatientFormState) => PatientFormState) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function XRayPatientEditModal({
  patientEditForm,
  patientEditError,
  isSaving,
  onFormChange,
  onClose,
  onSubmit,
}: XRayPatientEditModalProps) {
  return (
    <div className="reminders-modal-overlay">
      <section
        className="reminders-modal xray-confirm-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="xray-patient-edit-title"
      >
        <div className="reminders-modal-head">
          <div>
            <div className="section-kicker">Редактирование пациента</div>
            <h3 id="xray-patient-edit-title" className="reminders-modal-title">
              Карточка пациента
            </h3>
          </div>

          <button
            type="button"
            className="reminders-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Закрыть окно редактирования пациента"
          >
            ×
          </button>
        </div>

        <form className="patient-form xray-patient-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Фамилия</span>
            <input
              type="text"
              value={patientEditForm.lastName}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  lastName: normalizePersonNameInput(event.target.value),
                }))
              }
            />
          </label>

          <label className="field">
            <span>Имя</span>
            <input
              type="text"
              value={patientEditForm.firstName}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  firstName: normalizePersonNameInput(event.target.value),
                }))
              }
            />
          </label>

          <label className="field">
            <span>Отчество</span>
            <input
              type="text"
              value={patientEditForm.patronymic}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  patronymic: normalizePersonNameInput(event.target.value),
                }))
              }
            />
          </label>

          <label className="field">
            <span>Дата рождения</span>
            <input
              type="text"
              value={patientEditForm.birthDate}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  birthDate: normalizeBirthDateInput(event.target.value),
                }))
              }
              inputMode="numeric"
            />
          </label>

          <label className="field field-wide">
            <span>Адрес</span>
            <input
              type="text"
              value={patientEditForm.address}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  address: event.target.value,
                }))
              }
            />
          </label>

          <label className="field field-wide">
            <span>Ссылка на РМИС</span>
            <input
              type="text"
              value={patientEditForm.rmisUrl}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  rmisUrl: event.target.value,
                }))
              }
              placeholder="Необязательно"
            />
          </label>

          {patientEditError ? (
            <div className="state-banner error-banner">{patientEditError}</div>
          ) : null}

          <div className="xray-confirm-actions">
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
