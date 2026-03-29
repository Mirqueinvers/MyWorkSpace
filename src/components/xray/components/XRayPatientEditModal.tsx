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
  onDelete: () => void
}

const EDIT_PATIENT_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'
const CLOSE_EDIT_MODAL_LABEL = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043e\u043a\u043d\u043e \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'
const LAST_NAME_LABEL = '\u0424\u0430\u043c\u0438\u043b\u0438\u044f'
const FIRST_NAME_LABEL = '\u0418\u043c\u044f'
const PATRONYMIC_LABEL = '\u041e\u0442\u0447\u0435\u0441\u0442\u0432\u043e'
const BIRTH_DATE_LABEL = '\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f'
const ADDRESS_LABEL = '\u0410\u0434\u0440\u0435\u0441'
const RMIS_LINK_LABEL = '\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u0420\u041c\u0418\u0421'
const OPTIONAL_PLACEHOLDER = '\u041d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e'
const DELETE_PATIENT_LABEL = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0430\u0446\u0438\u0435\u043d\u0442\u0430'
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'
const SAVE_BUSY_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u044e...'

export function XRayPatientEditModal({
  patientEditForm,
  patientEditError,
  isSaving,
  onFormChange,
  onClose,
  onSubmit,
  onDelete,
}: XRayPatientEditModalProps) {
  return (
    <div className="reminders-modal-overlay">
      <section
        className="reminders-modal xray-confirm-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="xray-patient-edit-kicker"
      >
        <div className="reminders-modal-head">
          <div>
            <div id="xray-patient-edit-kicker" className="section-kicker">
              {EDIT_PATIENT_LABEL}
            </div>
          </div>

          <button
            type="button"
            className="reminders-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label={CLOSE_EDIT_MODAL_LABEL}
          >
            {'\u00D7'}
          </button>
        </div>

        <form className="patient-form xray-patient-form" onSubmit={onSubmit}>
          <label className="field">
            <span>{LAST_NAME_LABEL}</span>
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
            <span>{FIRST_NAME_LABEL}</span>
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
            <span>{PATRONYMIC_LABEL}</span>
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
            <span>{BIRTH_DATE_LABEL}</span>
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
            <span>{ADDRESS_LABEL}</span>
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
            <span>{RMIS_LINK_LABEL}</span>
            <input
              type="text"
              value={patientEditForm.rmisUrl}
              onChange={(event) =>
                onFormChange((currentForm) => ({
                  ...currentForm,
                  rmisUrl: event.target.value,
                }))
              }
              placeholder={OPTIONAL_PLACEHOLDER}
            />
          </label>

          {patientEditError ? <div className="state-banner error-banner">{patientEditError}</div> : null}

          <div className="xray-confirm-actions xray-patient-edit-actions">
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? SAVE_BUSY_LABEL : SAVE_LABEL}
            </button>
            <button
              type="button"
              className="ghost-danger-button"
              onClick={onDelete}
              disabled={isSaving}
            >
              {DELETE_PATIENT_LABEL}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
