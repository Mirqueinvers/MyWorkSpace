import { useEffect, useState } from 'react'
import {
  normalizeBirthDateInput,
  normalizePersonNameInput,
} from '../../../utils/patient'
import { createPatientFormState } from '../helpers'
import type { PatientFormState } from '../types'
import type { XRaySectionProps } from '../types'

interface SearchDraft {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
}

interface UseXRayPatientStateArgs {
  selectedPatient: XRaySectionProps['selectedPatient']
  searchDraft: SearchDraft
  onAddPatient: XRaySectionProps['onAddPatient']
  onUpdatePatient: XRaySectionProps['onUpdatePatient']
  onDeletePatient: XRaySectionProps['onDeletePatient']
}

export function useXRayPatientState({
  selectedPatient,
  searchDraft,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
}: UseXRayPatientStateArgs) {
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)
  const [isPatientEditOpen, setIsPatientEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [patientEditForm, setPatientEditForm] = useState<PatientFormState | null>(null)
  const [patientEditError, setPatientEditError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')

  useEffect(() => {
    if (!copyFeedback) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopyFeedback(''), 1600)
    return () => window.clearTimeout(timeoutId)
  }, [copyFeedback])

  function handleShowAddForm() {
    setLastName(searchDraft.lastName)
    setFirstName(searchDraft.firstName)
    setPatronymic(searchDraft.patronymic)
    setBirthDate(searchDraft.birthDate)
    setAddress('')
    setFormError('')
    setIsAddFormVisible(true)
  }

  function handleCancelAddForm() {
    setIsAddFormVisible(false)
  }

  function handleOpenPatientEdit() {
    if (!selectedPatient) {
      return
    }

    setPatientEditForm(createPatientFormState(selectedPatient))
    setPatientEditError('')
    setIsPatientEditOpen(true)
  }

  function handlePatientEditFormChange(updater: (current: PatientFormState) => PatientFormState) {
    setPatientEditForm((currentForm) => (currentForm ? updater(currentForm) : currentForm))
  }

  async function handleSubmitPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lastName.trim()) {
      setFormError('Введите фамилию пациента.')
      return
    }

    if (!firstName.trim()) {
      setFormError('Введите имя пациента.')
      return
    }

    if (!patronymic.trim()) {
      setFormError('Введите отчество пациента.')
      return
    }

    if (!/^\d{8}$/.test(birthDate)) {
      setFormError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!address.trim()) {
      setFormError('Введите адрес пациента.')
      return
    }

    setFormError('')

    const createdPatient = await onAddPatient({
      lastName: normalizePersonNameInput(lastName.trim()),
      firstName: normalizePersonNameInput(firstName.trim()),
      patronymic: normalizePersonNameInput(patronymic.trim()),
      birthDate,
      address: address.trim(),
      rmisUrl: null,
    })

    if (createdPatient) {
      setIsAddFormVisible(false)
      setAddress('')
    }
  }

  async function handleSubmitPatientEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPatient || !patientEditForm) {
      return
    }

    if (!patientEditForm.lastName.trim()) {
      setPatientEditError('Введите фамилию пациента.')
      return
    }

    if (!patientEditForm.firstName.trim()) {
      setPatientEditError('Введите имя пациента.')
      return
    }

    if (!patientEditForm.patronymic.trim()) {
      setPatientEditError('Введите отчество пациента.')
      return
    }

    if (!/^\d{8}$/.test(patientEditForm.birthDate)) {
      setPatientEditError('Введите дату рождения в формате ДДММГГГГ.')
      return
    }

    if (!patientEditForm.address.trim()) {
      setPatientEditError('Введите адрес пациента.')
      return
    }

    setPatientEditError('')

    const updatedPatient = await onUpdatePatient({
      id: selectedPatient.id,
      lastName: normalizePersonNameInput(patientEditForm.lastName.trim()),
      firstName: normalizePersonNameInput(patientEditForm.firstName.trim()),
      patronymic: normalizePersonNameInput(patientEditForm.patronymic.trim()),
      birthDate: patientEditForm.birthDate,
      address: patientEditForm.address.trim(),
      rmisUrl: patientEditForm.rmisUrl.trim() || null,
    })

    if (updatedPatient) {
      setIsPatientEditOpen(false)
    }
  }

  async function handleDeleteCurrentPatient() {
    if (!selectedPatient) {
      return
    }

    await onDeletePatient(selectedPatient.id)
    setIsDeleteConfirmOpen(false)
  }

  async function handleCopyPatientKey() {
    if (!selectedPatient) {
      return
    }

    const clipboardValue = `${selectedPatient.lastName.slice(0, 1)}${selectedPatient.firstName.slice(0, 1)}${selectedPatient.patronymic.slice(0, 1)}${selectedPatient.birthDate}`
      .toLocaleLowerCase('ru-RU')
      .replaceAll('ё', 'е')

    try {
      await navigator.clipboard.writeText(clipboardValue)
      setCopyFeedback('Скопировано')
    } catch {
      setCopyFeedback('Не удалось скопировать')
    }
  }

  return {
    isAddFormVisible,
    isPatientEditOpen,
    isDeleteConfirmOpen,
    lastName,
    firstName,
    patronymic,
    birthDate,
    address,
    formError,
    patientEditForm,
    patientEditError,
    copyFeedback,
    setIsPatientEditOpen,
    setIsDeleteConfirmOpen,
    handleShowAddForm,
    handleCancelAddForm,
    handleOpenPatientEdit,
    handlePatientEditFormChange,
    handleSubmitPatient,
    handleSubmitPatientEdit,
    handleDeleteCurrentPatient,
    handleCopyPatientKey,
    handleLastNameChange: (value: string) => setLastName(normalizePersonNameInput(value)),
    handleFirstNameChange: (value: string) => setFirstName(normalizePersonNameInput(value)),
    handlePatronymicChange: (value: string) => setPatronymic(normalizePersonNameInput(value)),
    handleBirthDateChange: (value: string) => setBirthDate(normalizeBirthDateInput(value)),
    handleAddressChange: setAddress,
  }
}
