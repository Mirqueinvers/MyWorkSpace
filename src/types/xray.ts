export interface XRayPatient {
  id: number
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string | null
  createdAt: string
}

export interface XRayStudy {
  id: number
  patientId: number
  studyDate: string
  description: string
  referralDiagnosis: string
  studyArea: string
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
  createdAt: string
}

export interface XRayJournalEntry {
  patient: XRayPatient
  studies: XRayStudy[]
}

export interface XRayFlJournalEntry {
  id: number
  shotDate: string
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  dose: string
  pathologyDescription: string
  pathologyConclusion: string
  rmisUrl: string | null
  createdAt: string
}

export interface XRayDoseReference {
  id: number
  flag: string
  title: string
  constitution: string
  detail: string
  adultKv: string
  adultMas: string
  childKv: string
  childMas: string
  sortOrder: number
  createdAt: string
}

export interface UpdateXRayDoseReferencePayload {
  id: number
  flag: string
  title: string
  constitution: string
  detail: string
  adultKv: string
  adultMas: string
  childKv: string
  childMas: string
}

export interface AddXRayDoseReferencePayload {
  flag: string
  title: string
  constitution: string
  detail: string
  adultKv: string
  adultMas: string
  childKv: string
  childMas: string
}

export interface XRayStatisticsRangePayload {
  startDate: string
  endDate: string
}

export interface XRayStatisticsTotals {
  uniquePatients: number
  researchCount: number
  fluorographyCount: number
  procedureCount: number
  totalDose: number
}

export interface XRayStatisticsReferralSummary {
  label: string
  researchCount: number
  procedureCount: number
}

export interface XRayStatisticsAreaSummary {
  label: string
  researchCount: number
  procedureCount: number
  adultDose: number
  childDose: number
  totalDose: number
}

export interface XRayStatisticsMonthlySummary {
  monthKey: string
  monthLabel: string
  uniquePatients: number
  studiesCount: number
  procedureCount: number
  workingDays: number
}

export interface XRayStatisticsForm30Row {
  label: string
  researchCount: number
  procedureCount: number
  ambulatoryCount: number
  dayHospitalCount: number
  inpatientCount: number
}

export interface XRayStatistics {
  totals: XRayStatisticsTotals
  referrals: XRayStatisticsReferralSummary[]
  studyAreas: XRayStatisticsAreaSummary[]
  monthlyPatients: XRayStatisticsMonthlySummary[]
  form30Rows: XRayStatisticsForm30Row[]
}

export interface ListXRayFlJournalByPatientPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
}

export interface ImportXRayFlJournalResult {
  imported: number
  skipped: number
}

export interface ImportXRayFlPathologyResult {
  matchedKeys: number
  skippedKeys: number
  failedKeys: number
  importedDescriptions: number
  updatedEntries: number
}

export interface UpdateXRayFlJournalRmisUrlPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  rmisUrl: string | null
}

export interface ImportXRayFlPathologyPayload {
  shotDate: string
  folderPath: string
}

export interface UpdateXRayFlJournalPathologyPayload {
  id: number
  clearDescription?: boolean
}

export interface AddXRayPatientPayload {
  lastName: string
  firstName: string
  patronymic: string
  birthDate: string
  address: string
  rmisUrl: string | null
}

export interface UpdateXRayPatientPayload extends AddXRayPatientPayload {
  id: number
}

export interface XRaySearchResult extends XRayPatient {
  matchLabel: string
}

export interface AddXRayStudyPayload {
  patientId: number
  studyDate: string
  description: string
  referralDiagnosis: string
  studyArea: string
  studyType: 'Рентген' | 'Урография'
  cassette: '13х18' | '18х24' | '24х30' | '30х40' | '35х35'
  studyCount: 1 | 2 | 3 | 4 | 5 | 6
  radiationDose: string
  referredBy: string
}

export interface UpdateXRayStudyPayload extends AddXRayStudyPayload {
  id: number
}

export interface XRayApi {
  searchPatients: (query: string) => Promise<XRaySearchResult[]>
  listPatients: () => Promise<XRayPatient[]>
  addPatient: (payload: AddXRayPatientPayload) => Promise<XRayPatient>
  updatePatient: (payload: UpdateXRayPatientPayload) => Promise<XRayPatient>
  deletePatient: (id: number) => Promise<boolean>
  openLink: (url: string) => Promise<boolean>
  listJournalByDate: (studyDate: string) => Promise<XRayJournalEntry[]>
  getStatistics: (payload: XRayStatisticsRangePayload) => Promise<XRayStatistics>
  listDoseReference: () => Promise<XRayDoseReference[]>
  addDoseReference: (payload: AddXRayDoseReferencePayload) => Promise<XRayDoseReference>
  updateDoseReference: (payload: UpdateXRayDoseReferencePayload) => Promise<XRayDoseReference>
  deleteDoseReference: (id: number) => Promise<boolean>
  listFlJournalByDate: (shotDate: string) => Promise<XRayFlJournalEntry[]>
  listFlJournalByPatient: (
    payload: ListXRayFlJournalByPatientPayload,
  ) => Promise<XRayFlJournalEntry[]>
  updateFlJournalRmisUrl: (payload: UpdateXRayFlJournalRmisUrlPayload) => Promise<boolean>
  selectFlJournalFile: () => Promise<string | null>
  importFlJournalFile: (filePath: string) => Promise<ImportXRayFlJournalResult>
  selectFlPathologyFolder: () => Promise<string | null>
  importFlPathologyFolder: (
    payload: ImportXRayFlPathologyPayload,
  ) => Promise<ImportXRayFlPathologyResult>
  updateFlJournalPathology: (payload: UpdateXRayFlJournalPathologyPayload) => Promise<boolean>
  listStudies: (patientId: number) => Promise<XRayStudy[]>
  addStudy: (payload: AddXRayStudyPayload) => Promise<XRayStudy>
  updateStudy: (payload: UpdateXRayStudyPayload) => Promise<XRayStudy>
  deleteStudy: (id: number) => Promise<boolean>
}
