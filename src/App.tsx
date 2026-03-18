import { useState } from 'react'
import { PlaceholderSection } from './components/common/PlaceholderSection'
import { ClockPanel } from './components/layout/ClockPanel'
import { TopNav } from './components/layout/TopNav'
import { MedicalExamsForm } from './components/medical/MedicalExamsForm'
import { MedicalExamsSection } from './components/medical/MedicalExamsSection'
import { ReferencesSection } from './components/references/ReferencesSection'
import { RemindersPanel } from './components/reminders/RemindersPanel'
import { SchoolsSection } from './components/schools/SchoolsSection'
import { SickLeavesSection } from './components/sickLeaves/SickLeavesSection'
import type { AppSection } from './constants/navigation'
import { useMedicalExams } from './hooks/useMedicalExams'
import { useReminders } from './hooks/useReminders'
import { useSchools } from './hooks/useSchools'
import { useSickLeaves } from './hooks/useSickLeaves'
import { useWeather } from './hooks/useWeather'
import { getCurrentDateDigits, getCurrentMonthKey } from './utils/date'
import './App.css'

function App() {
  const currentMonthKey = getCurrentMonthKey()
  const [activeSection, setActiveSection] = useState<AppSection>('Главная')
  const weather = useWeather()
  const medicalExams = useMedicalExams(currentMonthKey)
  const sickLeaves = useSickLeaves()
  const reminders = useReminders()
  const schools = useSchools()
  const todayDateDigits = getCurrentDateDigits()
  const urgentSickLeaves = sickLeaves.sickLeaves.filter((sickLeave) => {
    if (sickLeave.status !== 'open' || sickLeave.periods.length === 0) {
      return false
    }

    const lastPeriod = sickLeave.periods[sickLeave.periods.length - 1]
    return lastPeriod.endDate === todayDateDigits
  })
  const visibleReminders = reminders.reminders.filter(
    (reminder) =>
      reminder.reminderDate === null || reminder.reminderDate === todayDateDigits,
  )

  function renderContent() {
    if (activeSection === 'Главная') {
      return (
        <section className="home-form-wrap">
          <MedicalExamsForm
            currentMonthExamCount={medicalExams.currentMonthExamCount}
            monthKey={medicalExams.monthKey}
            onMonthChange={medicalExams.setMonthKey}
            patientName={medicalExams.patientName}
            birthDate={medicalExams.birthDate}
            onPatientNameChange={medicalExams.setPatientName}
            onBirthDateChange={medicalExams.setBirthDate}
            onAddPatient={medicalExams.handleAddPatient}
            isSaving={medicalExams.isSavingPatient}
            patientNameFocusKey={medicalExams.patientNameFocusKey}
          />
        </section>
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

    if (activeSection === 'Справки') {
      return <ReferencesSection />
    }

    return <PlaceholderSection title={activeSection} />
  }

  return (
    <main className="app-shell">
      <TopNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <section className="content-area">{renderContent()}</section>

      <aside className="right-rail">
        <ClockPanel weather={weather} />
        <RemindersPanel
          reminders={visibleReminders}
          urgentSickLeaves={urgentSickLeaves}
          reminderText={reminders.text}
          reminderDate={reminders.reminderDate}
          loading={reminders.loading}
          error={reminders.error}
          isSaving={reminders.isSaving}
          deletingReminderId={reminders.deletingReminderId}
          onReminderTextChange={reminders.setText}
          onReminderDateChange={reminders.setReminderDate}
          onAddReminder={reminders.handleAddReminder}
          onDeleteReminder={reminders.handleDeleteReminder}
        />
      </aside>
    </main>
  )
}

export default App
