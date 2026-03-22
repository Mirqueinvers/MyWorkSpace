import type { FormEvent } from 'react'
import {
  XRAY_CASSETTES,
  XRAY_STUDY_AREAS,
  XRAY_STUDY_COUNTS,
  XRAY_STUDY_TYPES,
} from '../config'
import { normalizeLeadingCapital } from '../helpers'
import type { StudyFormState } from '../types'
import { XRaySelectField } from './XRaySelectField'

interface XRayStudyFormModalProps {
  editingStudy: boolean
  studyForm: StudyFormState
  studyFormError: string
  isSavingStudy: boolean
  openStudySelect: null | 'studyArea' | 'studyType' | 'cassette' | 'studyCount'
  referredByHistory: string[]
  isReferredByOpen: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onStudyFormChange: (updater: (current: StudyFormState) => StudyFormState) => void
  onToggleSelect: (field: null | 'studyArea' | 'studyType' | 'cassette' | 'studyCount') => void
  onReferredByOpenChange: (isOpen: boolean) => void
  onDelete: () => void
}

export function XRayStudyFormModal({
  editingStudy,
  studyForm,
  studyFormError,
  isSavingStudy,
  openStudySelect,
  referredByHistory,
  isReferredByOpen,
  onClose,
  onSubmit,
  onStudyFormChange,
  onToggleSelect,
  onReferredByOpenChange,
  onDelete,
}: XRayStudyFormModalProps) {
  return (
    <div className="reminders-modal-overlay">
      <section
        className="reminders-modal xray-study-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="xray-study-modal-title"
      >
        <div className="reminders-modal-head xray-study-modal-head">
          <div className="xray-study-modal-heading">
            <h3
              id="xray-study-modal-title"
              className="reminders-modal-title xray-study-modal-title"
            >
              {editingStudy ? 'Редактирование исследования' : 'Новое исследование'}
            </h3>
            <label className="xray-study-date-picker">
              <input
                type="date"
                value={studyForm.studyDate}
                onChange={(event) =>
                  onStudyFormChange((currentForm) => ({
                    ...currentForm,
                    studyDate: event.target.value,
                  }))
                }
                max="2099-12-31"
              />
            </label>
          </div>

          <button
            type="button"
            className="reminders-modal-close"
            onClick={onClose}
            disabled={isSavingStudy}
            aria-label="Закрыть окно исследования"
          >
            ×
          </button>
        </div>

        <form className="xray-study-form" onSubmit={onSubmit}>
          <label className="field field-wide xray-study-diagnosis-field">
            <span>Направительный диагноз</span>
            <textarea
              className="xray-study-diagnosis"
              value={studyForm.referralDiagnosis}
              onChange={(event) =>
                onStudyFormChange((currentForm) => ({
                  ...currentForm,
                  referralDiagnosis: normalizeLeadingCapital(event.target.value),
                }))
              }
            />
          </label>

          <XRaySelectField
            label="Область исследования"
            value={studyForm.studyArea}
            options={XRAY_STUDY_AREAS}
            isOpen={openStudySelect === 'studyArea'}
            onToggle={() => onToggleSelect(openStudySelect === 'studyArea' ? null : 'studyArea')}
            onSelect={(value) => {
              onStudyFormChange((currentForm) => ({
                ...currentForm,
                studyArea: value,
              }))
              onToggleSelect(null)
            }}
          />

          <XRaySelectField
            label="Тип исследования"
            value={studyForm.studyType}
            options={XRAY_STUDY_TYPES}
            isOpen={openStudySelect === 'studyType'}
            onToggle={() => onToggleSelect(openStudySelect === 'studyType' ? null : 'studyType')}
            onSelect={(value) => {
              onStudyFormChange((currentForm) => ({
                ...currentForm,
                studyType: value,
              }))
              onToggleSelect(null)
            }}
          />

          <XRaySelectField
            label="Кассета"
            value={studyForm.cassette}
            options={XRAY_CASSETTES}
            isOpen={openStudySelect === 'cassette'}
            onToggle={() => onToggleSelect(openStudySelect === 'cassette' ? null : 'cassette')}
            onSelect={(value) => {
              onStudyFormChange((currentForm) => ({
                ...currentForm,
                cassette: value,
              }))
              onToggleSelect(null)
            }}
          />

          <XRaySelectField
            label="Количество исследований"
            value={studyForm.studyCount}
            options={XRAY_STUDY_COUNTS}
            isOpen={openStudySelect === 'studyCount'}
            onToggle={() => onToggleSelect(openStudySelect === 'studyCount' ? null : 'studyCount')}
            onSelect={(value) => {
              onStudyFormChange((currentForm) => ({
                ...currentForm,
                studyCount: value,
              }))
              onToggleSelect(null)
            }}
          />

          <label className="field">
            <span>Доза облучения</span>
            <input
              type="text"
              value={studyForm.radiationDose}
              onChange={(event) =>
                onStudyFormChange((currentForm) => ({
                  ...currentForm,
                  radiationDose: event.target.value,
                }))
              }
            />
          </label>

          <div className="field field-wide xray-referred-by-field">
            <span>Направил</span>
            <input
              type="text"
              value={studyForm.referredBy}
              onChange={(event) =>
                onStudyFormChange((currentForm) => ({
                  ...currentForm,
                  referredBy: event.target.value,
                }))
              }
              onFocus={() => onReferredByOpenChange(referredByHistory.length > 0)}
              onBlur={() => {
                window.setTimeout(() => onReferredByOpenChange(false), 120)
              }}
            />
            {isReferredByOpen && referredByHistory.length > 0 ? (
              <div className="xray-referred-by-menu">
                {referredByHistory.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="xray-select-option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onStudyFormChange((currentForm) => ({
                        ...currentForm,
                        referredBy: value,
                      }))
                      onReferredByOpenChange(false)
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {studyFormError ? <div className="state-banner error-banner">{studyFormError}</div> : null}

          <div className="xray-confirm-actions">
            {editingStudy ? (
              <button
                type="button"
                className="danger-button xray-study-modal-delete"
                onClick={onDelete}
                disabled={isSavingStudy}
              >
                Удалить
              </button>
            ) : null}
            <button type="submit" className="primary-button" disabled={isSavingStudy}>
              {isSavingStudy
                ? 'Сохраняю...'
                : editingStudy
                  ? 'Сохранить изменения'
                  : 'Добавить исследование'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
