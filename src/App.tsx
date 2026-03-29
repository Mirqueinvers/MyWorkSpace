import { useEffect, useState } from 'react'
import { PlaceholderSection } from './components/common/PlaceholderSection'
import { HomeSection } from './components/home/HomeSection'
import { ClockPanel } from './components/layout/ClockPanel'
import { TopNav } from './components/layout/TopNav'
import { MedicalExamsSection } from './components/medical/MedicalExamsSection'
import { NotesSection } from './components/notes/NotesSection'
import { ReferencesSection } from './components/references/ReferencesSection'
import { RemindersPanel } from './components/reminders/RemindersPanel'
import { SchoolsSection } from './components/schools/SchoolsSection'
import { SickLeavesSection } from './components/sickLeaves/SickLeavesSection'
import { XRaySection } from './components/xray/XRaySection'
import { NAV_ITEMS } from './constants/navigation'
import type { AppSection } from './constants/navigation'
import type { XRaySearchResult, XRayStatisticsRangePayload } from './types/xray'
import { useMedicalExams } from './hooks/useMedicalExams'
import { useNotes } from './hooks/useNotes'
import { useReminders } from './hooks/useReminders'
import { useSchools } from './hooks/useSchools'
import { useSickLeaves } from './hooks/useSickLeaves'
import { useWeather } from './hooks/useWeather'
import { useXRay } from './hooks/useXRay'
import {
  getCurrentDateDigits,
  getCurrentDayOfMonth,
  getCurrentMonthKey,
  isReminderVisibleOnDate,
} from './utils/date'
import './App.css'

function getTodayIsoDate() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

function getMonthStartIsoDate() {
  const today = getTodayIsoDate()
  return `${today.slice(0, 8)}01`
}

function getYearStartIsoDate() {
  const today = getTodayIsoDate()
  return `${today.slice(0, 4)}-01-01`
}

function App() {
  const currentMonthKey = getCurrentMonthKey()
  const [activeSection, setActiveSection] = useState<AppSection>(NAV_ITEMS[0])
  const [isHomeEditing, setIsHomeEditing] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('app-theme') === 'dark'
  })
  const [fluorographyMonthCount, setFluorographyMonthCount] = useState(0)
  const [fluorographyYearCount, setFluorographyYearCount] = useState(0)
  const [xrayTodayPatientsCount, setXrayTodayPatientsCount] = useState(0)
  const [xrayTodayStudiesCount, setXrayTodayStudiesCount] = useState(0)
  const weather = useWeather()
  const medicalExams = useMedicalExams(currentMonthKey)
  const sickLeaves = useSickLeaves()
  const reminders = useReminders()
  const notes = useNotes()
  const schools = useSchools()
  const xray = useXRay()
  const todayDateDigits = getCurrentDateDigits()
  const currentDayOfMonth = getCurrentDayOfMonth()
  const urgentSickLeaves = sickLeaves.sickLeaves.filter((sickLeave) => {
    if (sickLeave.status !== 'open' || sickLeave.periods.length === 0) {
      return false
    }

    const lastPeriod = sickLeave.periods[sickLeave.periods.length - 1]
    return lastPeriod.endDate === todayDateDigits
  })
  const visibleReminders = reminders.reminders.filter((reminder) =>
    isReminderVisibleOnDate(reminder, todayDateDigits, currentDayOfMonth),
  )

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return
    }

    document.documentElement.dataset.theme = isDarkTheme ? 'dark' : 'light'
    window.localStorage.setItem('app-theme', isDarkTheme ? 'dark' : 'light')
  }, [isDarkTheme])

  useEffect(() => {
    let isCancelled = false

    async function loadXRayDashboardSummary() {
      if (!window.electronAPI?.xray?.getStatistics) {
        if (!isCancelled) {
          setFluorographyMonthCount(0)
          setFluorographyYearCount(0)
          setXrayTodayPatientsCount(0)
          setXrayTodayStudiesCount(0)
        }
        return
      }

      const today = getTodayIsoDate()
      const monthRange: XRayStatisticsRangePayload = {
        startDate: getMonthStartIsoDate(),
        endDate: today,
      }
      const yearRange: XRayStatisticsRangePayload = {
        startDate: getYearStartIsoDate(),
        endDate: today,
      }
      const todayRange: XRayStatisticsRangePayload = {
        startDate: today,
        endDate: today,
      }

      try {
        const [monthStatistics, yearStatistics, todayStatistics] = await Promise.all([
          window.electronAPI.xray.getStatistics(monthRange),
          window.electronAPI.xray.getStatistics(yearRange),
          window.electronAPI.xray.getStatistics(todayRange),
        ])

        if (!isCancelled) {
          setFluorographyMonthCount(monthStatistics.totals.fluorographyCount)
          setFluorographyYearCount(yearStatistics.totals.fluorographyCount)
          setXrayTodayPatientsCount(todayStatistics.totals.uniquePatients)
          setXrayTodayStudiesCount(todayStatistics.totals.researchCount)
        }
      } catch {
        if (!isCancelled) {
          setFluorographyMonthCount(0)
          setFluorographyYearCount(0)
          setXrayTodayPatientsCount(0)
          setXrayTodayStudiesCount(0)
        }
      }
    }

    void loadXRayDashboardSummary()

    return () => {
      isCancelled = true
    }
  }, [])

  function handleHomeXRayPatientSelect(patient: XRaySearchResult) {
    xray.handleSelectPatient(patient)
    setActiveSection('X-ray')
  }

  function renderContent() {
    if (activeSection === 'Главная') {
      return (
        <HomeSection
          isEditing={isHomeEditing}
          medicalMonthKey={medicalExams.monthKey}
          currentMonthExamCount={medicalExams.currentMonthExamCount}
          medicalPatients={medicalExams.patients}
          medicalPatientName={medicalExams.patientName}
          medicalBirthDate={medicalExams.birthDate}
          sickLeaves={sickLeaves.sickLeaves}
          urgentSickLeavesCount={urgentSickLeaves.length}
          schools={schools.institutions}
          xraySelectedPatient={xray.selectedPatient}
          xrayStudies={xray.studies}
          xrayFlStudies={xray.flStudies}
          fluorographyMonthCount={fluorographyMonthCount}
          fluorographyYearCount={fluorographyYearCount}
          xrayTodayPatientsCount={xrayTodayPatientsCount}
          xrayTodayStudiesCount={xrayTodayStudiesCount}
          xrayQuery={xray.query}
          xrayResults={xray.results}
          xrayLoading={xray.loading}
          xrayError={xray.error}
          notes={notes.notes}
          notesText={notes.text}
          onMedicalMonthChange={medicalExams.setMonthKey}
          onMedicalPatientNameChange={medicalExams.setPatientName}
          onMedicalBirthDateChange={medicalExams.setBirthDate}
          onAddMedicalPatient={medicalExams.handleAddPatient}
          onXRayQueryChange={xray.setQuery}
          onXRaySearch={xray.handleSearch}
          onSelectXRayPatient={handleHomeXRayPatientSelect}
          medicalIsSaving={medicalExams.isSavingPatient}
          medicalPatientNameFocusKey={medicalExams.patientNameFocusKey}
          onNotesTextChange={notes.setText}
          onAddNote={notes.handleAddNote}
          notesIsSaving={notes.isSaving}
          onOpenSection={setActiveSection}
        />
      )
    }

    if (activeSection === 'Мед осмотры') {
      return (
        <MedicalExamsSection
          currentMonthExamCount={medicalExams.currentMonthExamCount}
          monthKey={medicalExams.monthKey}
          onMonthChange={medicalExams.setMonthKey}
          patients={medicalExams.patients}
          loading={medicalExams.patientsLoading}
          error={medicalExams.patientsError}
          patientName={medicalExams.patientName}
          birthDate={medicalExams.birthDate}
          onPatientNameChange={medicalExams.setPatientName}
          onBirthDateChange={medicalExams.setBirthDate}
          onAddPatient={medicalExams.handleAddPatient}
          onDeletePatient={medicalExams.handleDeletePatient}
          isSaving={medicalExams.isSavingPatient}
          deletingPatientId={medicalExams.deletingPatientId}
          patientNameFocusKey={medicalExams.patientNameFocusKey}
        />
      )
    }

    if (activeSection === 'Больничные листы') {
      return (
        <SickLeavesSection
          lastName={sickLeaves.lastName}
          firstName={sickLeaves.firstName}
          patronymic={sickLeaves.patronymic}
          birthDate={sickLeaves.birthDate}
          periodStartDate={sickLeaves.periodStartDate}
          periodEndDate={sickLeaves.periodEndDate}
          diagnosis={sickLeaves.diagnosis}
          sickLeaves={sickLeaves.sickLeaves}
          loading={sickLeaves.loading}
          error={sickLeaves.error}
          isSaving={sickLeaves.isSaving}
          savingPeriodLeaveId={sickLeaves.savingPeriodLeaveId}
          closingLeaveId={sickLeaves.closingLeaveId}
          deletingLeaveId={sickLeaves.deletingLeaveId}
          openSickLeavesCount={sickLeaves.openSickLeavesCount}
          lastNameFocusKey={sickLeaves.lastNameFocusKey}
          onLastNameChange={sickLeaves.setLastName}
          onFirstNameChange={sickLeaves.setFirstName}
          onPatronymicChange={sickLeaves.setPatronymic}
          onBirthDateChange={sickLeaves.setBirthDate}
          onPeriodStartDateChange={sickLeaves.setPeriodStartDate}
          onPeriodEndDateChange={sickLeaves.setPeriodEndDate}
          onDiagnosisChange={sickLeaves.setDiagnosis}
          onSubmit={sickLeaves.handleAddSickLeave}
          onAddPeriod={sickLeaves.handleAddPeriod}
          onCloseSickLeave={sickLeaves.handleCloseSickLeave}
          onDeleteSickLeave={sickLeaves.handleDeleteSickLeave}
        />
      )
    }

    if (activeSection === 'Школы') {
      return (
        <SchoolsSection
          institutionName={schools.institutionName}
          institutionType={schools.institutionType}
          institutions={schools.institutions}
          loading={schools.loading}
          error={schools.error}
          isSavingInstitution={schools.isSavingInstitution}
          savingClassInstitutionId={schools.savingClassInstitutionId}
          savingStudentClassId={schools.savingStudentClassId}
          savingLinkStudentId={schools.savingLinkStudentId}
          deletingEntityKey={schools.deletingEntityKey}
          onInstitutionNameChange={schools.setInstitutionName}
          onInstitutionTypeChange={schools.setInstitutionType}
          onAddInstitution={schools.handleAddInstitution}
          onAddClass={schools.handleAddClass}
          onAddStudent={schools.handleAddStudent}
          onAddLink={schools.handleAddLink}
          onDeleteInstitution={schools.handleDeleteInstitution}
          onDeleteClass={schools.handleDeleteClass}
          onDeleteStudent={schools.handleDeleteStudent}
          onDeleteLink={schools.handleDeleteLink}
        />
      )
    }

    if (activeSection === 'X-ray') {
      return (
        <XRaySection
          query={xray.query}
          results={xray.results}
          selectedPatient={xray.selectedPatient}
          studies={xray.studies}
          flStudies={xray.flStudies}
          lastSubmittedQuery={xray.lastSubmittedQuery}
          loading={xray.loading}
          error={xray.error}
          isSaving={xray.isSaving}
          isDeleting={xray.isDeleting}
          studiesLoading={xray.studiesLoading}
          flStudiesLoading={xray.flStudiesLoading}
          isSavingStudy={xray.isSavingStudy}
          deletingStudyId={xray.deletingStudyId}
          onQueryChange={xray.setQuery}
          onSearch={xray.handleSearch}
          onSelectPatient={xray.handleSelectPatient}
          onAddPatient={xray.handleAddPatient}
          onUpdatePatient={xray.handleUpdatePatient}
          onDeletePatient={xray.handleDeletePatient}
          onOpenLink={xray.handleOpenLink}
          onAddStudy={xray.handleAddStudy}
          onUpdateStudy={xray.handleUpdateStudy}
          onDeleteStudy={xray.handleDeleteStudy}
          onReset={xray.resetState}
        />
      )
    }

    if (activeSection === 'Заметки') {
      return (
        <NotesSection
          text={notes.text}
          notes={notes.notes}
          loading={notes.loading}
          error={notes.error}
          isSaving={notes.isSaving}
          deletingNoteId={notes.deletingNoteId}
          onTextChange={notes.setText}
          onAddNote={notes.handleAddNote}
          onDeleteNote={notes.handleDeleteNote}
        />
      )
    }

    if (activeSection === 'Справки') {
      return <ReferencesSection />
    }

    return <PlaceholderSection title={activeSection} />
  }

  return (
    <main className="app-shell">
      <TopNav
        activeSection={activeSection}
        isHomeEditing={isHomeEditing}
        isDarkTheme={isDarkTheme}
        onSectionChange={setActiveSection}
        onToggleHomeEditing={() => setIsHomeEditing((current) => !current)}
        onToggleTheme={() => setIsDarkTheme((current) => !current)}
      />

      <section className="content-area">{renderContent()}</section>

      <aside className="right-rail">
        <ClockPanel weather={weather} />
        <RemindersPanel
          reminders={visibleReminders}
          allReminders={reminders.reminders}
          urgentSickLeaves={urgentSickLeaves}
          reminderText={reminders.text}
          reminderDate={reminders.reminderDate}
          recurrence={reminders.recurrence}
          loading={reminders.loading}
          error={reminders.error}
          isSaving={reminders.isSaving}
          deletingReminderId={reminders.deletingReminderId}
          onReminderTextChange={reminders.setText}
          onReminderDateChange={reminders.setReminderDate}
          onRecurrenceChange={reminders.setRecurrence}
          onRecurrenceDayChange={reminders.setRecurrenceDay}
          onAddReminder={reminders.handleAddReminder}
          onDeleteReminder={reminders.handleDeleteReminder}
        />
      </aside>
    </main>
  )
}

export default App
