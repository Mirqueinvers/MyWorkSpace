export interface SchoolLink {
  id: number
  studentId: number
  url: string
  createdAt: string
}

export interface SchoolStudent {
  id: number
  classId: number
  name: string
  birthDate: string
  xrayPatientId?: number | null
  rmisUrl?: string | null
  createdAt: string
  links: SchoolLink[]
}

export interface SchoolClass {
  id: number
  institutionId: number
  name: string
  createdAt: string
  students: SchoolStudent[]
}

export interface SchoolInstitution {
  id: number
  name: string
  type: 'school' | 'kindergarten'
  createdAt: string
  classes: SchoolClass[]
}

export interface AddSchoolInstitutionPayload {
  name: string
  type: 'school' | 'kindergarten'
}

export interface AddSchoolClassPayload {
  institutionId: number
  name: string
}

export interface AddSchoolStudentPayload {
  classId: number
  name: string
  birthDate: string
}

export interface AddSchoolLinkPayload {
  studentId: number
  url: string
}

export interface SchoolApi {
  list: () => Promise<SchoolInstitution[]>
  addInstitution: (
    payload: AddSchoolInstitutionPayload,
  ) => Promise<SchoolInstitution>
  addClass: (payload: AddSchoolClassPayload) => Promise<SchoolClass>
  addStudent: (payload: AddSchoolStudentPayload) => Promise<SchoolStudent>
  addLink: (payload: AddSchoolLinkPayload) => Promise<SchoolLink>
  openLink: (url: string) => Promise<boolean>
  deleteInstitution: (id: number) => Promise<boolean>
  deleteClass: (id: number) => Promise<boolean>
  deleteStudent: (id: number) => Promise<boolean>
  deleteLink: (id: number) => Promise<boolean>
}
