import type { FormEvent } from 'react'

interface XRayAddPatientCardProps {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  formError: string
  isSaving: boolean
  onLastNameChange: (value: string) => void
  onFirstNameChange: (value: string) => void
  onPatronymicChange: (value: string) => void
  onBirthDateChange: (value: string) => void
  onAddressChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
}

export function XRayAddPatientCard({
  lastName,
  firstName,
  patronymic,
  birthDate,
  address,
  formError,
  isSaving,
  onLastNameChange,
  onFirstNameChange,
  onPatronymicChange,
  onBirthDateChange,
  onAddressChange,
  onSubmit,
  onCancel,
}: XRayAddPatientCardProps) {
  return (
    <section className="content-card xray-patient-card">
      <div className="section-head">
        <div>
          <p className="section-kicker">Новый пациент</p>
          <h3>Добавление в X-ray журнал</h3>
        </div>
      </div>

      <form className="patient-form xray-patient-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Фамилия</span>
          <input
            type="text"
            value={lastName}
            onChange={(event) => onLastNameChange(event.target.value)}
            placeholder="Кузнецов"
          />
        </label>

        <label className="field">
          <span>Имя</span>
          <input
            type="text"
            value={firstName}
            onChange={(event) => onFirstNameChange(event.target.value)}
            placeholder="Дмитрий"
          />
        </label>

        <label className="field">
          <span>Отчество</span>
          <input
            type="text"
            value={patronymic}
            onChange={(event) => onPatronymicChange(event.target.value)}
            placeholder="Юрьевич"
          />
        </label>

        <label className="field">
          <span>Дата рождения</span>
          <input
            type="text"
            value={birthDate}
            onChange={(event) => onBirthDateChange(event.target.value)}
            placeholder="ДДММГГГГ"
            inputMode="numeric"
          />
        </label>

        <label className="field field-wide">
          <span>Адрес</span>
          <input
            type="text"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder="г. Тамбов, ул. Примерная, д. 1"
          />
        </label>

        {formError ? <div className="state-banner error-banner">{formError}</div> : null}

        <div className="xray-form-actions">
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? 'Сохраняю...' : 'Сохранить пациента'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={isSaving}
          >
            Отмена
          </button>
        </div>
      </form>
    </section>
  )
}
