import { useEffect, useState } from 'react'
import { PlaceholderSection } from './components/common/PlaceholderSection'
import AtlasPage from './atlas/pages/AtlasPage'
import { HomeSection } from './components/home/HomeSection'
import { ClockPanel } from './components/layout/ClockPanel'
import { PlanSection } from './components/plan/PlanSection'
import { TopNav } from './components/layout/TopNav'
import { MedicalExamsSection } from './components/medical/MedicalExamsSection'
import { NotesSection } from './components/notes/NotesSection'
import { ReferencesSection } from './components/references/ReferencesSection'
import { RemindersPanel } from './components/reminders/RemindersPanel'
import { SchoolSection } from './components/school/SchoolSection'
import { SchoolsSection } from './components/schools/SchoolsSection'
import { SickLeavesSection } from './components/sickLeaves/SickLeavesSection'
import { XRayDoses, XRayStatistics } from './components/xray/components'
import { XRayJournalsSection } from './components/xray/XRayJournalsSection'
import { XRaySection } from './components/xray/XRaySection'
import { NAV_ITEMS } from './constants/navigation'
import type { AppSection } from './constants/navigation'
import type { XRaySearchResult, XRayStatisticsRangePayload } from './types/xray'
import { useMedicalExams } from './hooks/useMedicalExams'
import { useNotes } from './hooks/useNotes'
import { useReminders } from './hooks/useReminders'
import { useSchool } from './hooks/useSchool'
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

type AppTheme = 'light' | 'dark' | 'cartoon' | 'paper' | 'notebook'

function App() {
  const currentMonthKey = getCurrentMonthKey()
  const [activeSection, setActiveSection] = useState<AppSection>(NAV_ITEMS[0])
  const [isHomeEditing, setIsHomeEditing] = useState(false)
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const savedTheme = window.localStorage.getItem('app-theme')
    return savedTheme === 'dark' ||
      savedTheme === 'cartoon' ||
      savedTheme === 'paper' ||
      savedTheme === 'notebook'
      ? savedTheme
      : 'light'
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
  const school = useSchool()
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

    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('app-theme', theme)
  }, [theme])

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
    setActiveSection(NAV_ITEMS[1])
  }

  function handleSectionChange(section: AppSection) {
    if (section === NAV_ITEMS[1]) {
      xray.resetState()
    }

    setActiveSection(section)
  }

  function renderContent() {
    if (activeSection === NAV_ITEMS[0]) {
      return (
        <HomeSection
          isEditing={isHomeEditing}
          medicalMonthKey={medicalExams.monthKey}
          currentMonthExamCount={medicalExams.currentMonthExamCount}
          medicalPatients={medicalExams.patients}
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
          theme={theme}
          onMedicalMonthChange={medicalExams.setMonthKey}
          onXRayQueryChange={xray.setQuery}
          onXRaySearch={xray.handleSearch}
          onSelectXRayPatient={handleHomeXRayPatientSelect}
          onNotesTextChange={notes.setText}
          onAddNote={notes.handleAddNote}
          notesIsSaving={notes.isSaving}
          onThemeChange={setTheme}
          onOpenSection={setActiveSection}
        />
      )
    }

    if (activeSection === NAV_ITEMS[7]) {
      return (
        <MedicalExamsSection
          currentMonthExamCount={medicalExams.currentMonthExamCount}
          monthKey={medicalExams.monthKey}
          onMonthChange={medicalExams.setMonthKey}
          patients={medicalExams.patients}
          loading={medicalExams.patientsLoading}
          error={medicalExams.patientsError}
          onSelectPatient={xray.handleSelectPatient}
          onOpenPatient={() => handleSectionChange(NAV_ITEMS[1])}
          onUpdatePatientRmisUrl={medicalExams.handleUpdatePatientRmisUrl}
          onOpenLink={xray.handleOpenLink}
        />
      )
    }

    if (activeSection === NAV_ITEMS[8]) {
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
          onSelectPatient={xray.handleSelectPatient}
          onOpenPatient={() => handleSectionChange(NAV_ITEMS[1])}
          onLastNameChange={sickLeaves.setLastName}
          onFirstNameChange={sickLeaves.setFirstName}
          onPatronymicChange={sickLeaves.setPatronymic}
          onBirthDateChange={sickLeaves.setBirthDate}
          onPeriodStartDateChange={sickLeaves.setPeriodStartDate}
          onPeriodEndDateChange={sickLeaves.setPeriodEndDate}
          onDiagnosisChange={sickLeaves.setDiagnosis}
          onSubmit={sickLeaves.handleAddSickLeave}
          onAddPeriod={sickLeaves.handleAddPeriod}
          onUpdatePeriod={sickLeaves.handleUpdatePeriod}
          onCloseSickLeave={sickLeaves.handleCloseSickLeave}
          onDeleteSickLeave={sickLeaves.handleDeleteSickLeave}
        />
      )
    }

    if (activeSection === NAV_ITEMS[9]) {
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

    if (activeSection === NAV_ITEMS[10]) {
      return (
        <SchoolSection
          institutionName={school.institutionName}
          institutionType={school.institutionType}
          institutions={school.institutions}
          loading={school.loading}
          error={school.error}
          isSavingInstitution={school.isSavingInstitution}
          savingClassInstitutionId={school.savingClassInstitutionId}
          savingLinkStudentId={school.savingLinkStudentId}
          deletingEntityKey={school.deletingEntityKey}
          onInstitutionNameChange={school.setInstitutionName}
          onInstitutionTypeChange={school.setInstitutionType}
          onAddInstitution={school.handleAddInstitution}
          onAddClass={school.handleAddClass}
          onAddLink={school.handleAddLink}
          onDeleteInstitution={school.handleDeleteInstitution}
          onDeleteClass={school.handleDeleteClass}
          onSelectPatient={xray.handleSelectPatient}
          onOpenPatient={() => setActiveSection(NAV_ITEMS[1])}
        />
      )
    }

    if (activeSection === NAV_ITEMS[1]) {
      return (
        <XRaySection
          query={xray.query}
          results={xray.results}
          selectedPatient={xray.selectedPatient}
          studies={xray.studies}
          flStudies={xray.flStudies}
          ultrasoundStudies={xray.ultrasoundStudies}
          medicalExamEntries={xray.medicalExamEntries}
          lastSubmittedQuery={xray.lastSubmittedQuery}
          loading={xray.loading}
          error={xray.error}
          isSaving={xray.isSaving}
          isDeleting={xray.isDeleting}
          studiesLoading={xray.studiesLoading}
          flStudiesLoading={xray.flStudiesLoading}
          ultrasoundStudiesLoading={xray.ultrasoundStudiesLoading}
          medicalExamEntriesLoading={xray.medicalExamEntriesLoading}
          isSavingStudy={xray.isSavingStudy}
          isSavingMedicalExam={xray.isSavingMedicalExam}
          deletingStudyId={xray.deletingStudyId}
          deletingMedicalExamId={xray.deletingMedicalExamId}
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
          onAddMedicalExamForSelectedPatient={xray.handleAddMedicalExamForSelectedPatient}
          onDeleteMedicalExamForSelectedPatient={xray.handleDeleteMedicalExamForSelectedPatient}
          onReset={xray.resetState}
        />
      )
    }

    if (activeSection === NAV_ITEMS[2]) {
      return (
        <XRayJournalsSection
          onSelectPatient={xray.handleSelectPatient}
          onOpenPatient={() => handleSectionChange(NAV_ITEMS[1])}
        />
      )
    }

    if (activeSection === NAV_ITEMS[3]) {
      return (
        <PlanSection
          onSelectPatient={xray.handleSelectPatient}
          onOpenPatient={() => handleSectionChange(NAV_ITEMS[1])}
        />
      )
    }

    if (activeSection === NAV_ITEMS[4]) {
      return <XRayStatistics />
    }

    if (activeSection === NAV_ITEMS[5]) {
      return <XRayDoses />
    }

    if (activeSection === NAV_ITEMS[11]) {
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

    if (activeSection === NAV_ITEMS[12]) {
      return <ReferencesSection />
    }

    if (activeSection === '\u0410\u043d\u0430\u0442\u043e\u043c\u0438\u044f') {
      return <AtlasPage />
    }

    return <PlaceholderSection title={activeSection} />
  }

  return (
    <main className="app-shell">
      <TopNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <section className="content-area">{renderContent()}</section>

      <aside className="right-rail">
        <ClockPanel
          weather={weather}
          isHomeEditing={isHomeEditing}
          onToggleHomeEditing={() => setIsHomeEditing((current) => !current)}
        />
        <RemindersPanel
          currentDateDigits={todayDateDigits}
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
