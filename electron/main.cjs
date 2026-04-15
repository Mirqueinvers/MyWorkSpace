const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const xrayDoseReferenceSeed = require('./xray-dose-reference-seed.json');

const isDev = !app.isPackaged;

let database;

function ensureMedicalExamPatientsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_exam_patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      birth_date TEXT NOT NULL DEFAULT '',
      month_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_medical_exam_patients_month_key
    ON medical_exam_patients (month_key, created_at DESC);
  `);

  const columns = db
    .prepare(`PRAGMA table_info('medical_exam_patients')`)
    .all()
    .map((column) => column.name);

  if (!columns.includes('birth_date')) {
    db.exec(`
      ALTER TABLE medical_exam_patients
      ADD COLUMN birth_date TEXT NOT NULL DEFAULT '';
    `);
  }
}

function ensureSickLeavesSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sick_leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      patronymic TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sick_leave_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sick_leave_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sick_leave_id) REFERENCES sick_leaves (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sick_leaves_status_created_at
    ON sick_leaves (status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_sick_leave_periods_leave_created_at
    ON sick_leave_periods (sick_leave_id, created_at ASC, id ASC);
  `);
}

function ensureRemindersSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      reminder_date TEXT,
      recurrence TEXT NOT NULL DEFAULT 'none',
      recurrence_day INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reminders_created_at
    ON reminders (created_at DESC, id DESC);
  `);

  const columns = db
    .prepare(`PRAGMA table_info('reminders')`)
    .all()
    .map((column) => column.name);

  if (!columns.includes('reminder_date')) {
    db.exec(`
      ALTER TABLE reminders
      ADD COLUMN reminder_date TEXT;
    `);
  }

  if (!columns.includes('recurrence')) {
    db.exec(`
      ALTER TABLE reminders
      ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'none';
    `);
  }

  if (!columns.includes('recurrence_day')) {
    db.exec(`
      ALTER TABLE reminders
      ADD COLUMN recurrence_day INTEGER;
    `);
  }
}

function ensureNotesSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notes_created_at
    ON notes (created_at DESC, id DESC);
  `);
}

function ensureSchoolsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS school_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (institution_id) REFERENCES school_institutions (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS school_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (class_id) REFERENCES school_classes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS school_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES school_students (id) ON DELETE CASCADE
    );
  `);
}

function ensureXRaySchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS xray_patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      patronymic TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      address TEXT NOT NULL,
      rmis_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_xray_patients_birth_date
    ON xray_patients (birth_date);

    CREATE INDEX IF NOT EXISTS idx_xray_patients_created_at
    ON xray_patients (created_at DESC, id DESC);

    CREATE TABLE IF NOT EXISTS xray_studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      study_date TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      referral_diagnosis TEXT NOT NULL,
      study_area TEXT NOT NULL,
      study_type TEXT NOT NULL,
      cassette TEXT NOT NULL,
      study_count INTEGER NOT NULL,
      radiation_dose TEXT NOT NULL,
      referred_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES xray_patients (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_xray_studies_patient_created_at
    ON xray_studies (patient_id, created_at DESC, id DESC);

    CREATE TABLE IF NOT EXISTS xray_flu_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shot_date TEXT NOT NULL,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      patronymic TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      dose TEXT NOT NULL,
      source_file TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_xray_flu_journal_shot_date
    ON xray_flu_journal (shot_date, created_at DESC, id DESC);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_xray_flu_journal_unique_entry
    ON xray_flu_journal (
      shot_date,
      last_name,
      first_name,
      patronymic,
      birth_date,
      dose
    );

    CREATE TABLE IF NOT EXISTS xray_dose_reference (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flag TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      constitution TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      adult_kv TEXT NOT NULL DEFAULT '',
      adult_mas TEXT NOT NULL DEFAULT '',
      child_kv TEXT NOT NULL DEFAULT '',
      child_mas TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_xray_dose_reference_sort_order
    ON xray_dose_reference (sort_order ASC, id ASC);
  `);

  const columns = db
    .prepare(`PRAGMA table_info('xray_patients')`)
    .all()
    .map((column) => column.name);

  if (!columns.includes('rmis_url')) {
    db.exec(`
      ALTER TABLE xray_patients
      ADD COLUMN rmis_url TEXT;
    `);
  }

  const studyColumns = db
    .prepare(`PRAGMA table_info('xray_studies')`)
    .all()
    .map((column) => column.name);

  if (!studyColumns.includes('study_date')) {
    db.exec(`
      ALTER TABLE xray_studies
      ADD COLUMN study_date TEXT NOT NULL DEFAULT '';
    `);

    db.exec(`
      UPDATE xray_studies
      SET study_date = substr(created_at, 1, 10)
      WHERE study_date = '';
    `);
  }

  if (!studyColumns.includes('description')) {
    db.exec(`
      ALTER TABLE xray_studies
      ADD COLUMN description TEXT NOT NULL DEFAULT '';
    `);
  }

  const doseReferenceCount = db
    .prepare(`SELECT COUNT(*) as count FROM xray_dose_reference`)
    .get().count;

  const doseReferenceColumns = db
    .prepare(`PRAGMA table_info('xray_dose_reference')`)
    .all()
    .map((column) => column.name);

  if (!doseReferenceColumns.includes('constitution')) {
    db.exec(`
      ALTER TABLE xray_dose_reference
      ADD COLUMN constitution TEXT NOT NULL DEFAULT '';
    `);
  }

  if (doseReferenceCount === 0) {
    const createdAt = new Date().toISOString();
    const insertDoseReferenceStatement = db.prepare(`
      INSERT INTO xray_dose_reference (
        flag,
        title,
        constitution,
        detail,
        adult_kv,
        adult_mas,
        child_kv,
        child_mas,
        sort_order,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let index = 0; index < xrayDoseReferenceSeed.length; index += 1) {
      const entry = xrayDoseReferenceSeed[index];
      insertDoseReferenceStatement.run(
        normalizeText(entry.flag),
        normalizeText(entry.title),
        normalizeText(entry.constitution),
        normalizeText(entry.detail),
        normalizeText(entry.adultKv),
        normalizeText(entry.adultMas),
        normalizeText(entry.childKv),
        normalizeText(entry.childMas),
        index,
        createdAt
      );
    }
  }
}

function ensureUltrasoundJournalSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ultrasound_journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_date TEXT NOT NULL,
      patient_full_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      patronymic TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      study_title TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      conclusion TEXT NOT NULL DEFAULT '',
      source_file TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      document_html TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ultrasound_journal_entries_study_date
    ON ultrasound_journal_entries (study_date, created_at DESC, id DESC);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_ultrasound_journal_entries_content_hash
    ON ultrasound_journal_entries (content_hash);
  `);
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeDateDigits(value) {
  const normalizedValue = normalizeText(value);

  if (!/^\d{8}$/.test(normalizedValue)) {
    throw new Error('DATE_INVALID');
  }

  return normalizedValue;
}

function normalizeIsoDate(value, errorCode) {
  const normalizedValue = normalizeText(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    throw new Error(errorCode);
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(errorCode);
  }

  const [year, month, day] = normalizedValue.split('-').map(Number);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new Error(errorCode);
  }

  return normalizedValue;
}

function normalizeRequiredText(value, errorCode) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    throw new Error(errorCode);
  }

  return normalizedValue;
}

function dateDigitsToNumber(value) {
  return Number(`${value.slice(4, 8)}${value.slice(2, 4)}${value.slice(0, 2)}`);
}

function assertPeriodRange(startDate, endDate) {
  if (dateDigitsToNumber(startDate) > dateDigitsToNumber(endDate)) {
    throw new Error('PERIOD_RANGE_INVALID');
  }
}

function getDatabase() {
  if (database) {
    return database;
  }

  const userDataPath = app.getPath('userData');
  fs.mkdirSync(userDataPath, { recursive: true });

  database = new DatabaseSync(path.join(userDataPath, 'myworkspase.sqlite'));
  database.exec('PRAGMA foreign_keys = ON;');
  ensureMedicalExamPatientsSchema(database);
  ensureSickLeavesSchema(database);
  ensureRemindersSchema(database);
  ensureNotesSchema(database);
  ensureSchoolsSchema(database);
  ensureXRaySchema(database);
  ensureUltrasoundJournalSchema(database);

  return database;
}

function normalizeSearchFragment(value) {
  return String(value ?? '')
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCompactSearchValue(value) {
  return normalizeSearchFragment(value).replace(/\s+/g, '');
}

function mapXRayPatient(row) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    patronymic: row.patronymic,
    birthDate: row.birth_date,
    address: row.address,
    rmisUrl: row.rmis_url ?? null,
    createdAt: row.created_at,
  };
}

function mapXRayStudy(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    studyDate: row.study_date,
    description: row.description ?? '',
    referralDiagnosis: row.referral_diagnosis,
    studyArea: row.study_area,
    studyType: row.study_type,
    cassette: row.cassette,
    studyCount: Number(row.study_count),
    radiationDose: row.radiation_dose,
    referredBy: row.referred_by,
    createdAt: row.created_at,
  };
}

function mapXRayDoseReference(row) {
  return {
    id: row.id,
    flag: row.flag,
    title: row.title,
    constitution: row.constitution,
    detail: row.detail,
    adultKv: row.adult_kv,
    adultMas: row.adult_mas,
    childKv: row.child_kv,
    childMas: row.child_mas,
    sortOrder: Number(row.sort_order),
    createdAt: row.created_at,
  };
}

function mapXRayFlJournalEntry(row) {
  return {
    id: row.id,
    shotDate: row.shot_date,
    lastName: row.last_name,
    firstName: row.first_name,
    patronymic: row.patronymic,
    birthDate: row.birth_date,
    dose: row.dose,
    rmisUrl: row.rmis_url ?? null,
    createdAt: row.created_at,
  };
}

function mapUltrasoundJournalStudy(row) {
  return {
    id: row.id,
    studyDate: row.study_date,
    studyTitle: row.study_title,
    doctorName: row.doctor_name,
    conclusion: row.conclusion ?? '',
    rmisUrl: row.rmis_url ?? null,
    createdAt: row.created_at,
  };
}

function mapUltrasoundProtocolEntry(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    studyDate: row.study_date,
    studyTitle: row.study_title,
    doctorName: row.doctor_name,
    conclusion: row.conclusion ?? '',
    createdAt: row.created_at,
    sourceFile: row.source_file,
    documentHtml: row.document_html,
    patient: {
      fullName: row.patient_full_name,
      lastName: row.last_name,
      firstName: row.first_name,
      patronymic: row.patronymic,
      birthDate: row.birth_date,
    },
  };
}

function normalizePositiveInteger(value, errorCode) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error(errorCode);
  }

  return numericValue;
}

function normalizeXRayStudyPayload(payload) {
  const normalizedPatientId = normalizePositiveInteger(
    payload.patientId,
    'XRAY_PATIENT_ID_INVALID'
  );
  const normalizedStudyDate = normalizeIsoDate(
    payload.studyDate,
    'XRAY_STUDY_DATE_INVALID'
  );
  const normalizedDescription = normalizeText(payload.description);
  const normalizedReferralDiagnosis = normalizeRequiredText(
    payload.referralDiagnosis,
    'XRAY_REFERRAL_DIAGNOSIS_REQUIRED'
  );
  const normalizedStudyArea = normalizeRequiredText(
    payload.studyArea,
    'XRAY_STUDY_AREA_REQUIRED'
  );
  const normalizedStudyType =
    payload.studyType === 'Урография' ? 'Урография' : 'Рентген';
  const normalizedCassette = normalizeRequiredText(
    payload.cassette,
    'XRAY_CASSETTE_REQUIRED'
  );
  const normalizedStudyCount = Number(payload.studyCount);
  const normalizedRadiationDose = normalizeRequiredText(
    payload.radiationDose,
    'XRAY_RADIATION_DOSE_REQUIRED'
  );
  const normalizedReferredBy = normalizeRequiredText(
    payload.referredBy,
    'XRAY_REFERRED_BY_REQUIRED'
  );

  if (![1, 2, 3, 4, 5, 6].includes(normalizedStudyCount)) {
    throw new Error('XRAY_STUDY_COUNT_INVALID');
  }

  return {
    patientId: normalizedPatientId,
    studyDate: normalizedStudyDate,
    description: normalizedDescription,
    referralDiagnosis: normalizedReferralDiagnosis,
    studyArea: normalizedStudyArea,
    studyType: normalizedStudyType,
    cassette: normalizedCassette,
    studyCount: normalizedStudyCount,
    radiationDose: normalizedRadiationDose,
    referredBy: normalizedReferredBy,
  };
}

function getXRayPatientSearchIndex(patient) {
  const lastName = getCompactSearchValue(patient.last_name);
  const firstName = getCompactSearchValue(patient.first_name);
  const patronymic = getCompactSearchValue(patient.patronymic);
  const birthDate = String(patient.birth_date ?? '').replace(/\D/g, '').slice(0, 8);
  const fullName = [lastName, firstName, patronymic].filter(Boolean).join(' ');
  const fullNameCompact = fullName.replace(/\s+/g, '');
  const initials = `${lastName.slice(0, 1)}${firstName.slice(0, 1)}${patronymic.slice(0, 1)}`;
  const keys = new Set(
    [
      `${initials}${birthDate}`,
      `${lastName}${birthDate}`,
      `${lastName}${firstName}${birthDate}`,
      `${fullNameCompact}${birthDate}`,
      fullNameCompact,
      lastName,
      `${lastName}${firstName}`,
    ].filter(Boolean)
  );

  return {
    birthDate,
    fullName,
    fullNameCompact,
    lastName,
    firstName,
    patronymic,
    keys,
  };
}

function getXRayMatchLabel(patient) {
  return `${patient.last_name} ${patient.first_name} ${patient.patronymic} ${patient.birth_date}`.trim();
}

function scoreXRayPatientMatch(patient, query) {
  const trimmedQuery = String(query ?? '').trim();
  if (!trimmedQuery) {
    return null;
  }

  const queryBirthDate = trimmedQuery.replace(/\D/g, '').slice(0, 8);
  const normalizedQuery = normalizeSearchFragment(trimmedQuery);
  const compactQuery = normalizedQuery.replace(/\s+/g, '');
  const lettersOnlyQuery = normalizedQuery.replace(/\d/g, '').replace(/\s+/g, ' ').trim();
  const compactLettersQuery = lettersOnlyQuery.replace(/\s+/g, '');
  const queryTokens = lettersOnlyQuery ? lettersOnlyQuery.split(' ') : [];
  const patientIndex = getXRayPatientSearchIndex(patient);

  if (!compactQuery) {
    return null;
  }

  if (queryBirthDate && patientIndex.birthDate !== queryBirthDate) {
    return null;
  }

  if (patientIndex.keys.has(compactQuery)) {
    return 120;
  }

  if (
    compactLettersQuery &&
    patientIndex.fullNameCompact === compactLettersQuery &&
    (!queryBirthDate || patientIndex.birthDate === queryBirthDate)
  ) {
    return 110;
  }

  if (
    compactLettersQuery &&
    patientIndex.fullNameCompact.startsWith(compactLettersQuery) &&
    (!queryBirthDate || patientIndex.birthDate === queryBirthDate)
  ) {
    return 98;
  }

  if (
    compactLettersQuery &&
    patientIndex.fullNameCompact.includes(compactLettersQuery) &&
    (!queryBirthDate || patientIndex.birthDate === queryBirthDate)
  ) {
    return 92;
  }

  if (
    queryTokens.length > 0 &&
    queryTokens.every((token) => patientIndex.fullName.includes(token))
  ) {
    return queryBirthDate ? 90 : 72;
  }

  if (!queryBirthDate && patientIndex.lastName.startsWith(compactQuery)) {
    return 68;
  }

  if (!queryBirthDate && compactQuery.length >= 2 && patientIndex.fullNameCompact.includes(compactQuery)) {
    return 60;
  }

  return null;
}

function searchXRayPatients(query) {
  const trimmedQuery = String(query ?? '').trim();
  if (!trimmedQuery) {
    return [];
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT id, last_name, first_name, patronymic, birth_date, address, rmis_url, created_at
    FROM xray_patients
    ORDER BY created_at DESC, id DESC
  `).all();

  return rows
    .map((row) => {
      const score = scoreXRayPatientMatch(row, trimmedQuery);

      if (score === null) {
        return null;
      }

      return {
        ...mapXRayPatient(row),
        matchLabel: getXRayMatchLabel(row),
        score,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || right.id - left.id)
    .slice(0, 8)
    .map(({ score, ...patient }) => patient);
}

function addXRayPatient({ lastName, firstName, patronymic, birthDate, address, rmisUrl }) {
  const normalizedLastName = normalizeRequiredText(lastName, 'XRAY_LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'XRAY_FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeRequiredText(patronymic, 'XRAY_PATRONYMIC_REQUIRED');
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const normalizedAddress = normalizeRequiredText(address, 'XRAY_ADDRESS_REQUIRED');
  const normalizedRmisUrl = normalizeText(rmisUrl) || null;
  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO xray_patients (
      last_name,
      first_name,
      patronymic,
      birth_date,
      address,
      rmis_url,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate,
    normalizedAddress,
    normalizedRmisUrl,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    lastName: normalizedLastName,
    firstName: normalizedFirstName,
    patronymic: normalizedPatronymic,
    birthDate: normalizedBirthDate,
    address: normalizedAddress,
    rmisUrl: normalizedRmisUrl,
    createdAt,
  };
}

function updateXRayPatient({ id, lastName, firstName, patronymic, birthDate, address, rmisUrl }) {
  const normalizedId = normalizePositiveInteger(id, 'XRAY_PATIENT_ID_INVALID');
  const normalizedLastName = normalizeRequiredText(lastName, 'XRAY_LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'XRAY_FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeRequiredText(patronymic, 'XRAY_PATRONYMIC_REQUIRED');
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const normalizedAddress = normalizeRequiredText(address, 'XRAY_ADDRESS_REQUIRED');
  const normalizedRmisUrl = normalizeText(rmisUrl) || null;
  const db = getDatabase();
  const result = db.prepare(`
    UPDATE xray_patients
    SET
      last_name = ?,
      first_name = ?,
      patronymic = ?,
      birth_date = ?,
      address = ?,
      rmis_url = ?
    WHERE id = ?
  `).run(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate,
    normalizedAddress,
    normalizedRmisUrl,
    normalizedId
  );

  if (result.changes === 0) {
    throw new Error('XRAY_PATIENT_NOT_FOUND');
  }

  const row = db.prepare(`
    SELECT id, last_name, first_name, patronymic, birth_date, address, rmis_url, created_at
    FROM xray_patients
    WHERE id = ?
  `).get(normalizedId);

  return mapXRayPatient(row);
}

function deleteXRayPatient(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('XRAY_PATIENT_ID_INVALID');
  }

  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM xray_patients
    WHERE id = ?
  `).run(numericId);

  return result.changes > 0;
}

async function openXRayLink(url) {
  const normalizedUrl = normalizeRequiredText(url, 'XRAY_LINK_URL_REQUIRED');
  const urlWithProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalizedUrl)
    ? normalizedUrl
    : `https://${normalizedUrl}`;

  let parsedUrl;

  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch {
    throw new Error('XRAY_LINK_URL_INVALID');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('XRAY_LINK_URL_INVALID');
  }

  await shell.openExternal(parsedUrl.toString());
  return true;
}

function listXRayStudies(patientId) {
  const normalizedPatientId = normalizePositiveInteger(
    patientId,
    'XRAY_PATIENT_ID_INVALID'
  );
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT
      id,
      patient_id,
      study_date,
      description,
      referral_diagnosis,
      study_area,
      study_type,
      cassette,
      study_count,
      radiation_dose,
      referred_by,
      created_at
    FROM xray_studies
    WHERE patient_id = ?
    ORDER BY study_date DESC, created_at DESC, id DESC
  `);

  return statement.all(normalizedPatientId).map(mapXRayStudy);
}

function listXRayJournalByDate(studyDate) {
  const normalizedStudyDate = String(studyDate ?? '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedStudyDate)) {
    throw new Error('XRAY_STUDY_DATE_INVALID');
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT
      p.id AS patient_id,
      p.last_name,
      p.first_name,
      p.patronymic,
      p.birth_date,
      p.address,
      p.rmis_url,
      p.created_at AS patient_created_at,
      s.id,
      s.study_date,
      s.description,
      s.referral_diagnosis,
      s.study_area,
      s.study_type,
      s.cassette,
      s.study_count,
      s.radiation_dose,
      s.referred_by,
      s.created_at
    FROM xray_studies s
    JOIN xray_patients p ON p.id = s.patient_id
    WHERE s.study_date = ?
    ORDER BY s.created_at DESC, s.id DESC
  `).all(normalizedStudyDate);

  const itemsMap = new Map();

  rows.forEach((row) => {
    if (!itemsMap.has(row.patient_id)) {
      itemsMap.set(row.patient_id, {
        patient: mapXRayPatient({
          id: row.patient_id,
          last_name: row.last_name,
          first_name: row.first_name,
          patronymic: row.patronymic,
          birth_date: row.birth_date,
          address: row.address,
          rmis_url: row.rmis_url,
          created_at: row.patient_created_at,
        }),
        studies: [],
      });
    }

    itemsMap.get(row.patient_id).studies.push(
      mapXRayStudy({
        id: row.id,
        patient_id: row.patient_id,
        study_date: row.study_date,
        description: row.description,
        referral_diagnosis: row.referral_diagnosis,
        study_area: row.study_area,
        study_type: row.study_type,
        cassette: row.cassette,
        study_count: row.study_count,
        radiation_dose: row.radiation_dose,
        referred_by: row.referred_by,
        created_at: row.created_at,
      }),
    );
  });

  return Array.from(itemsMap.values());
}

const XRAY_STATISTICS_AREA_ORDER = [
  'Органы грудной клетки',
  'Верхние конечности',
  'Нижние конечности',
  'Шейный отдел позвоночника',
  'Грудной отдел позвоночника',
  'Поясничный отдел позвоночника',
  'Тазобедренные суставы',
  'Ребра и грудина',
  'Органы брюшной полости',
  'Череп, гол. мозг, ЧЛО',
  'Почки, мочевыводящая система',
];

const XRAY_FORM30_BONE_MUSCLE_PARTS = [
  'Верхние конечности',
  'Нижние конечности',
  'Шейный отдел позвоночника',
  'Грудной отдел позвоночника',
  'Поясничный отдел позвоночника',
  'Тазобедренные суставы',
];

const XRAY_FORM30_LIMBS_PARTS = ['Верхние конечности', 'Нижние конечности'];

const XRAY_STATISTICS_MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function parseBirthDateDigitsToDate(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getAgeOnIsoDate(birthDateDigits, isoDate) {
  const birthDate = parseBirthDateDigitsToDate(birthDateDigits);

  if (!birthDate) {
    return null;
  }

  const [year, month, day] = String(isoDate ?? '').split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  let age = year - birthDate.getFullYear();
  const hasBirthdayPassed =
    month > birthDate.getMonth() + 1 ||
    (month === birthDate.getMonth() + 1 && day >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function parseXRayDoseValue(value) {
  const normalizedValue = String(value ?? '').replace(',', '.').trim();
  const numericValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getXRayStatisticsCareSetting(referredBy) {
  const normalizedValue = normalizeText(referredBy).toLocaleLowerCase('ru-RU');

  if (normalizedValue.includes('днев')) {
    return 'dayHospital';
  }

  if (normalizedValue.includes('круглосу') || normalizedValue.includes('стационар')) {
    return 'inpatient';
  }

  return 'ambulatory';
}

function formatXRayStatisticsMonthLabel(monthKey) {
  const [year, month] = String(monthKey ?? '').split('-').map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return monthKey;
  }

  return `${XRAY_STATISTICS_MONTH_NAMES[month - 1]} ${year}`;
}

function countWeekdaysInMonthRange(monthKey, startDate, endDate) {
  const [year, month] = monthKey.split('-').map(Number);
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const rangeStart = new Date(startYear, startMonth - 1, startDay);
  const rangeEnd = new Date(endYear, endMonth - 1, endDay);

  const effectiveStart = firstDay > rangeStart ? firstDay : rangeStart;
  const effectiveEnd = lastDay < rangeEnd ? lastDay : rangeEnd;

  if (effectiveStart > effectiveEnd) {
    return 0;
  }

  const cursor = new Date(effectiveStart);
  let weekdays = 0;

  while (cursor <= effectiveEnd) {
    const weekDay = cursor.getDay();

    if (weekDay !== 0 && weekDay !== 6) {
      weekdays += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return weekdays;
}

function createEmptyXRayStatisticsArea(label) {
  return {
    label,
    researchCount: 0,
    procedureCount: 0,
    adultDose: 0,
    childDose: 0,
    totalDose: 0,
  };
}

function createEmptyXRayForm30Row(label) {
  return {
    label,
    researchCount: 0,
    procedureCount: 0,
    ambulatoryCount: 0,
    dayHospitalCount: 0,
    inpatientCount: 0,
  };
}

function roundXRayStatisticsDose(value) {
  return Number(value.toFixed(3));
}

function getXRayStatistics({ startDate, endDate }) {
  const normalizedStartDate = normalizeIsoDate(startDate, 'XRAY_STATISTICS_START_DATE_INVALID');
  const normalizedEndDate = normalizeIsoDate(endDate, 'XRAY_STATISTICS_END_DATE_INVALID');

  if (normalizedStartDate > normalizedEndDate) {
    throw new Error('XRAY_STATISTICS_RANGE_INVALID');
  }

  const db = getDatabase();
  const rows = db.prepare(`
    SELECT
      s.study_date,
      s.study_area,
      s.study_count,
      s.radiation_dose,
      s.referred_by,
      p.id AS patient_id,
      p.birth_date
    FROM xray_studies s
    JOIN xray_patients p ON p.id = s.patient_id
    WHERE s.study_date >= ?
      AND s.study_date <= ?
    ORDER BY s.study_date ASC, s.id ASC
  `).all(normalizedStartDate, normalizedEndDate);
  const fluorographyCountRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM xray_flu_journal
    WHERE shot_date >= ?
      AND shot_date <= ?
  `).get(normalizedStartDate, normalizedEndDate);

  const uniquePatients = new Set();
  const referralsMap = new Map();
  const areaMap = new Map();
  const monthlyMap = new Map();
  let researchCount = 0;
  let procedureCount = 0;
  let totalDose = 0;

  XRAY_STATISTICS_AREA_ORDER.forEach((label) => {
    areaMap.set(label, createEmptyXRayStatisticsArea(label));
  });

  rows.forEach((row) => {
    const studyArea = normalizeText(row.study_area);
    const referredBy = normalizeText(row.referred_by) || 'Не указано';
    const currentResearchCount = 1;
    const currentProcedureCount = Number(row.study_count) || 0;
    const currentDose = parseXRayDoseValue(row.radiation_dose);
    const age = getAgeOnIsoDate(row.birth_date, row.study_date);
    const isChild = age !== null && age < 18;
    const monthKey = String(row.study_date).slice(0, 7);

    uniquePatients.add(Number(row.patient_id));
    researchCount += currentResearchCount;
    procedureCount += currentProcedureCount;
    totalDose += currentDose;

    if (!areaMap.has(studyArea)) {
      areaMap.set(studyArea, createEmptyXRayStatisticsArea(studyArea));
    }

    const areaEntry = areaMap.get(studyArea);
    areaEntry.researchCount += currentResearchCount;
    areaEntry.procedureCount += currentProcedureCount;
    areaEntry.totalDose += currentDose;

    if (isChild) {
      areaEntry.childDose += currentDose;
    } else {
      areaEntry.adultDose += currentDose;
    }

    if (!referralsMap.has(referredBy)) {
      referralsMap.set(referredBy, {
        label: referredBy,
        researchCount: 0,
        procedureCount: 0,
      });
    }

    const referralEntry = referralsMap.get(referredBy);
    referralEntry.researchCount += currentResearchCount;
    referralEntry.procedureCount += currentProcedureCount;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        monthKey,
        patientIds: new Set(),
        studiesCount: 0,
        procedureCount: 0,
      });
    }

    const monthlyEntry = monthlyMap.get(monthKey);
    monthlyEntry.patientIds.add(Number(row.patient_id));
    monthlyEntry.studiesCount += currentResearchCount;
    monthlyEntry.procedureCount += currentProcedureCount;
  });

  const studyAreas = Array.from(areaMap.values()).map((entry) => ({
    ...entry,
    adultDose: roundXRayStatisticsDose(entry.adultDose),
    childDose: roundXRayStatisticsDose(entry.childDose),
    totalDose: roundXRayStatisticsDose(entry.totalDose),
  }));

  const orderedStudyAreas = [
    ...studyAreas.filter((entry) => XRAY_STATISTICS_AREA_ORDER.includes(entry.label)),
    ...studyAreas.filter((entry) => !XRAY_STATISTICS_AREA_ORDER.includes(entry.label)),
  ];

  const monthlyPatients = Array.from(monthlyMap.values())
    .sort((leftValue, rightValue) => leftValue.monthKey.localeCompare(rightValue.monthKey))
    .map((entry) => ({
      monthKey: entry.monthKey,
      monthLabel: formatXRayStatisticsMonthLabel(entry.monthKey),
      uniquePatients: entry.patientIds.size,
      studiesCount: entry.studiesCount,
      procedureCount: entry.procedureCount,
      workingDays: countWeekdaysInMonthRange(
        entry.monthKey,
        normalizedStartDate,
        normalizedEndDate
      ),
    }));

  const form30Map = new Map();

  XRAY_STATISTICS_AREA_ORDER.forEach((label) => {
    form30Map.set(label, createEmptyXRayForm30Row(label));
  });

  rows.forEach((row) => {
    const studyArea = normalizeText(row.study_area);
    const currentProcedureCount = Number(row.study_count) || 0;
    const careSetting = getXRayStatisticsCareSetting(row.referred_by);

    if (!form30Map.has(studyArea)) {
      form30Map.set(studyArea, createEmptyXRayForm30Row(studyArea));
    }

    const form30Entry = form30Map.get(studyArea);
    form30Entry.researchCount += 1;
    form30Entry.procedureCount += currentProcedureCount;

    if (careSetting === 'dayHospital') {
      form30Entry.dayHospitalCount += 1;
    } else if (careSetting === 'inpatient') {
      form30Entry.inpatientCount += 1;
    } else {
      form30Entry.ambulatoryCount += 1;
    }
  });

  function sumForm30Rows(label, labels) {
    return labels.reduce((accumulator, currentLabel) => {
      const row = form30Map.get(currentLabel) ?? createEmptyXRayForm30Row(currentLabel);
      accumulator.researchCount += row.researchCount;
      accumulator.procedureCount += row.procedureCount;
      accumulator.ambulatoryCount += row.ambulatoryCount;
      accumulator.dayHospitalCount += row.dayHospitalCount;
      accumulator.inpatientCount += row.inpatientCount;
      return accumulator;
    }, createEmptyXRayForm30Row(label));
  }

  const form30Rows = [
    form30Map.get('Органы грудной клетки') ?? createEmptyXRayForm30Row('Органы грудной клетки'),
    sumForm30Rows('Костно-мышечная система', XRAY_FORM30_BONE_MUSCLE_PARTS),
    sumForm30Rows('Конечности', XRAY_FORM30_LIMBS_PARTS),
    form30Map.get('Шейный отдел позвоночника') ?? createEmptyXRayForm30Row('Шейный отдел позвоночника'),
    form30Map.get('Грудной отдел позвоночника') ?? createEmptyXRayForm30Row('Грудной отдел позвоночника'),
    form30Map.get('Поясничный отдел позвоночника') ?? createEmptyXRayForm30Row('Поясничный отдел позвоночника'),
    form30Map.get('Тазобедренные суставы') ?? createEmptyXRayForm30Row('Тазобедренные суставы'),
    form30Map.get('Ребра и грудина') ?? createEmptyXRayForm30Row('Ребра и грудина'),
    form30Map.get('Органы брюшной полости') ?? createEmptyXRayForm30Row('Органы брюшной полости'),
    form30Map.get('Череп, гол. мозг, ЧЛО') ?? createEmptyXRayForm30Row('Череп, гол. мозг, ЧЛО'),
    form30Map.get('Почки, мочевыводящая система') ?? createEmptyXRayForm30Row('Почки, мочевыводящая система'),
  ];

  form30Rows.push({
    label: 'Всего',
    researchCount: form30Rows.reduce((sum, row) => sum + row.researchCount, 0),
    procedureCount: form30Rows.reduce((sum, row) => sum + row.procedureCount, 0),
    ambulatoryCount: form30Rows.reduce((sum, row) => sum + row.ambulatoryCount, 0),
    dayHospitalCount: form30Rows.reduce((sum, row) => sum + row.dayHospitalCount, 0),
    inpatientCount: form30Rows.reduce((sum, row) => sum + row.inpatientCount, 0),
  });

  return {
    totals: {
      uniquePatients: uniquePatients.size,
      researchCount,
      fluorographyCount: Number(fluorographyCountRow?.total ?? 0),
      procedureCount,
      totalDose: roundXRayStatisticsDose(totalDose),
    },
    referrals: Array.from(referralsMap.values()).sort(
      (leftValue, rightValue) =>
        rightValue.researchCount - leftValue.researchCount ||
        leftValue.label.localeCompare(rightValue.label, 'ru-RU')
    ),
    studyAreas: orderedStudyAreas,
    monthlyPatients,
    form30Rows,
  };
}

function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value) {
  return decodeHtmlEntities(String(value ?? ''))
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUltrasoundDisplayDate(value, errorCode) {
  const normalizedValue = normalizeText(value).replace(/\u00a0/g, ' ');
  const match = normalizedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    throw new Error(errorCode);
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function splitFullName(fullName) {
  const parts = normalizeText(fullName).split(/\s+/).filter(Boolean);

  return {
    lastName: parts[0] ?? '',
    firstName: parts[1] ?? '',
    patronymic: parts.slice(2).join(' '),
  };
}

function extractDivBlocksByClass(source, className) {
  const blocks = [];
  const marker = `<div class="${className}"`;
  let searchIndex = 0;

  while (searchIndex < source.length) {
    const startIndex = source.indexOf(marker, searchIndex);

    if (startIndex === -1) {
      break;
    }

    let depth = 0;
    let cursor = startIndex;

    while (cursor < source.length) {
      const nextOpenIndex = source.indexOf('<div', cursor);
      const nextCloseIndex = source.indexOf('</div>', cursor);

      if (nextCloseIndex === -1) {
        break;
      }

      if (nextOpenIndex !== -1 && nextOpenIndex < nextCloseIndex) {
        depth += 1;
        const openTagEndIndex = source.indexOf('>', nextOpenIndex);

        if (openTagEndIndex === -1) {
          break;
        }

        cursor = openTagEndIndex + 1;
        continue;
      }

      depth -= 1;
      cursor = nextCloseIndex + '</div>'.length;

      if (depth === 0) {
        blocks.push(source.slice(startIndex, cursor));
        searchIndex = cursor;
        break;
      }
    }

    if (depth !== 0) {
      break;
    }
  }

  return blocks;
}

function parseUltrasoundProtocolBlock(blockHtml, styleCss, sourceFile) {
  const fullNameMatch = blockHtml.match(/ФИО пациента:\s*<span[^>]*>([\s\S]*?)<\/span>/i);
  const studyDateMatch = blockHtml.match(/Дата исследования:\s*<span[^>]*>([\s\S]*?)<\/span>/i);
  const birthDateMatch = blockHtml.match(/Дата рождения:\s*<span[^>]*>([\s\S]*?)<\/span>/i);

  if (!fullNameMatch || !studyDateMatch) {
    return null;
  }

  const patientFullName = stripHtml(fullNameMatch[1]);
  const studyDateDisplay = stripHtml(studyDateMatch[1]);
  const birthDateSource = birthDateMatch ? stripHtml(birthDateMatch[1]) : '';
  const birthDate = normalizeUltrasoundBirthDate(birthDateSource);

  if (!patientFullName || !studyDateDisplay) {
    return null;
  }

  const titleMatches = Array.from(
    blockHtml.matchAll(/<p[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([\s\S]*?)<\/p>/gi),
    (match) => stripHtml(match[1])
  ).filter(Boolean);

  const studyTitle = titleMatches.length > 0 ? titleMatches.join(' + ') : 'УЗИ протокол';
  const doctorMatch = blockHtml.match(/Исследование проводил врач\s*([^<]+)/i);
  const conclusionMatch = blockHtml.match(/Заключение:<\/span>\s*([^<]*)/i);
  const { lastName, firstName, patronymic } = splitFullName(patientFullName);
  const studyDate = normalizeUltrasoundDisplayDate(
    studyDateDisplay,
    'ULTRASOUND_JOURNAL_DATE_INVALID'
  );

  const documentHtml = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${studyTitle}</title>
    <style>
${styleCss}
    </style>
  </head>
  <body>
    <div class="export-shell">${blockHtml}</div>
  </body>
</html>`;

  const contentHash = crypto
    .createHash('sha1')
    .update(documentHtml)
    .digest('hex');

  return {
    studyDate,
    patientFullName,
    lastName,
    firstName,
    patronymic,
    birthDate,
    studyTitle,
    doctorName: doctorMatch ? normalizeText(doctorMatch[1]) : '',
    conclusion: conclusionMatch ? normalizeText(conclusionMatch[1]) : '',
    sourceFile,
    contentHash,
    documentHtml,
  };
}

function parseUltrasoundJournalFile(filePath) {
  const normalizedFilePath = normalizeRequiredText(
    filePath,
    'ULTRASOUND_JOURNAL_FILE_REQUIRED'
  );

  if (!fs.existsSync(normalizedFilePath)) {
    throw new Error('ULTRASOUND_JOURNAL_FILE_NOT_FOUND');
  }

  const source = fs.readFileSync(normalizedFilePath, 'utf8');
  const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/i);
  const styleCss = styleMatch ? styleMatch[1] : '';
  const blocks = extractDivBlocksByClass(source, 'export-protocol');
  const entries = [];

  blocks.forEach((blockHtml) => {
    if (/Протокол исследования\s*#\d+\s*пропущен/i.test(blockHtml)) {
      return;
    }

    const parsedEntry = parseUltrasoundProtocolBlock(
      blockHtml,
      styleCss,
      path.basename(normalizedFilePath)
    );

    if (parsedEntry) {
      entries.push(parsedEntry);
    }
  });

  return {
    sourceFile: path.basename(normalizedFilePath),
    entries,
  };
}

function normalizeFlJournalShotDate(value) {
  const normalizedValue = normalizeText(value).replace(/\u00a0/g, ' ');
  const match = normalizedValue.match(/^(\d{2})\.(\d{2})\.(\d{2,4})$/);

  if (!match) {
    throw new Error('XRAY_FL_JOURNAL_DATE_INVALID');
  }

  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2]}-${match[1]}`;
}

function normalizeFlJournalBirthDate(value) {
  const normalizedValue = normalizeText(value).replace(/\u00a0/g, ' ');
  const match = normalizedValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);

  if (!match) {
    return '';
  }

  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${match[1].padStart(2, '0')}${match[2].padStart(2, '0')}${year}`;
}

function normalizeUltrasoundBirthDate(value) {
  const normalizedValue = normalizeText(value).replace(/\u00a0/g, ' ');
  const digits = normalizedValue.replace(/\D/g, '');

  if (/^\d{8}$/.test(digits)) {
    return digits;
  }

  const dottedMatch = normalizedValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (dottedMatch) {
    const year = dottedMatch[3].length === 2 ? `20${dottedMatch[3]}` : dottedMatch[3];
    return `${dottedMatch[1].padStart(2, '0')}${dottedMatch[2].padStart(2, '0')}${year}`;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[3].padStart(2, '0')}${isoMatch[2].padStart(2, '0')}${isoMatch[1]}`;
  }

  return '';
}

function getBirthDateDigitsSql(fieldName) {
  return `
    CASE
      WHEN ${fieldName} GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' THEN ${fieldName}
      WHEN ${fieldName} GLOB '[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]' THEN substr(${fieldName}, 1, 2) || substr(${fieldName}, 4, 2) || substr(${fieldName}, 7, 4)
      WHEN ${fieldName} GLOB '[0-9].[0-9].[0-9][0-9][0-9][0-9]' THEN '0' || substr(${fieldName}, 1, 1) || '0' || substr(${fieldName}, 3, 1) || substr(${fieldName}, 5, 4)
      WHEN ${fieldName} GLOB '[0-9].[0-9][0-9].[0-9][0-9][0-9][0-9]' THEN '0' || substr(${fieldName}, 1, 1) || substr(${fieldName}, 3, 2) || substr(${fieldName}, 6, 4)
      WHEN ${fieldName} GLOB '[0-9][0-9].[0-9].[0-9][0-9][0-9][0-9]' THEN substr(${fieldName}, 1, 2) || '0' || substr(${fieldName}, 4, 1) || substr(${fieldName}, 6, 4)
      WHEN ${fieldName} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' THEN substr(${fieldName}, 9, 2) || substr(${fieldName}, 6, 2) || substr(${fieldName}, 1, 4)
      ELSE replace(replace(replace(${fieldName}, '.', ''), '-', ''), '/', '')
    END
  `;
}

function parseFlJournalFile(filePath) {
  const normalizedFilePath = normalizeRequiredText(filePath, 'XRAY_FL_JOURNAL_FILE_REQUIRED');

  if (!fs.existsSync(normalizedFilePath)) {
    throw new Error('XRAY_FL_JOURNAL_FILE_NOT_FOUND');
  }

  const source = fs.readFileSync(normalizedFilePath, 'utf8');
  const rowMatches = source.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const entries = [];

  rowMatches.forEach((rowMarkup) => {
    const cells = Array.from(
      rowMarkup.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi),
      (match) => stripHtml(match[1]),
    );

    if (cells.length < 8) {
      return;
    }

    if (cells[0] === 'Дата съёмки' || !/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(cells[0])) {
      return;
    }

    const lastName = normalizeText(cells[1]);
    const nameParts = normalizeText(cells[2]).split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? '';
    const patronymic = nameParts.slice(1).join(' ');
    const birthDate = normalizeFlJournalBirthDate(cells[3]);
    const dose = normalizeText(cells[7]).replace(',', '.');

    if (!lastName || !firstName || !birthDate || !dose) {
      return;
    }

    entries.push({
      shotDate: normalizeFlJournalShotDate(cells[0]),
      lastName,
      firstName,
      patronymic,
      birthDate,
      dose,
    });
  });

  return {
    sourceFile: path.basename(normalizedFilePath),
    entries,
  };
}

function importXRayFlJournalFile(filePath) {
  const { sourceFile, entries } = parseFlJournalFile(filePath);
  const db = getDatabase();
  const createdAt = new Date().toISOString();
  let imported = 0;
  let skipped = 0;

  const statement = db.prepare(`
    INSERT OR IGNORE INTO xray_flu_journal (
      shot_date,
      last_name,
      first_name,
      patronymic,
      birth_date,
      dose,
      source_file,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');

  try {
    entries.forEach((item) => {
      const result = statement.run(
        item.shotDate,
        item.lastName,
        item.firstName,
        item.patronymic,
        item.birthDate,
        item.dose,
        sourceFile,
        createdAt
      );

      if (result.changes > 0) {
        imported += 1;
      } else {
        skipped += 1;
      }
    });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    imported,
    skipped,
  };
}

function importUltrasoundJournalFile(filePath) {
  const { entries } = parseUltrasoundJournalFile(filePath);
  const db = getDatabase();
  const createdAt = new Date().toISOString();
  let imported = 0;
  let skipped = 0;

  const statement = db.prepare(`
    INSERT OR IGNORE INTO ultrasound_journal_entries (
      study_date,
      patient_full_name,
      last_name,
      first_name,
      patronymic,
      birth_date,
      study_title,
      doctor_name,
      conclusion,
      source_file,
      content_hash,
      document_html,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');

  try {
    entries.forEach((entry) => {
      const result = statement.run(
        entry.studyDate,
        entry.patientFullName,
        entry.lastName,
        entry.firstName,
        entry.patronymic,
        entry.birthDate,
        entry.studyTitle,
        entry.doctorName,
        entry.conclusion,
        entry.sourceFile,
        entry.contentHash,
        entry.documentHtml,
        createdAt
      );

      if (result.changes > 0) {
        imported += 1;
      } else {
        skipped += 1;
      }
    });

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    imported,
    skipped,
  };
}

async function selectXRayFlJournalFile() {
  const result = await dialog.showOpenDialog({
    title: 'Выберите файл Фл журнала',
    properties: ['openFile'],
    filters: [
      { name: 'XHTML files', extensions: ['xhtml', 'html', 'htm'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

async function selectUltrasoundJournalFile() {
  const result = await dialog.showOpenDialog({
    title: 'Выберите файл УЗИ журнала',
    properties: ['openFile'],
    filters: [
      { name: 'HTML files', extensions: ['html', 'htm'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

function listXRayFlJournalByDate(shotDate) {
  const normalizedShotDate = normalizeIsoDate(shotDate, 'XRAY_FL_JOURNAL_DATE_INVALID');
  const db = getDatabase();

  return db.prepare(`
    SELECT
      f.id,
      f.shot_date,
      f.last_name,
      f.first_name,
      f.patronymic,
      f.birth_date,
      f.dose,
      (
        SELECT p.rmis_url
        FROM xray_patients p
        WHERE p.last_name = f.last_name
          AND p.first_name = f.first_name
          AND p.patronymic = f.patronymic
          AND p.birth_date = f.birth_date
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
      ) AS rmis_url,
      f.created_at
    FROM xray_flu_journal f
    WHERE f.shot_date = ?
    ORDER BY created_at DESC, id DESC
  `).all(normalizedShotDate).map(mapXRayFlJournalEntry);
}

function listXRayFlJournalByPatient({ lastName, firstName, patronymic, birthDate }) {
  const normalizedLastName = normalizeRequiredText(lastName, 'XRAY_LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'XRAY_FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeText(patronymic);
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const db = getDatabase();

  return db.prepare(`
    SELECT
      f.id,
      f.shot_date,
      f.last_name,
      f.first_name,
      f.patronymic,
      f.birth_date,
      f.dose,
      (
        SELECT p.rmis_url
        FROM xray_patients p
        WHERE p.last_name = f.last_name
          AND p.first_name = f.first_name
          AND p.patronymic = f.patronymic
          AND p.birth_date = f.birth_date
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
      ) AS rmis_url,
      f.created_at
    FROM xray_flu_journal f
    WHERE f.last_name = ?
      AND f.first_name = ?
      AND f.patronymic = ?
      AND f.birth_date = ?
    ORDER BY f.shot_date DESC, f.created_at DESC, f.id DESC
  `).all(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate
  ).map(mapXRayFlJournalEntry);
}

function listUltrasoundJournalByDate(studyDate) {
  const normalizedStudyDate = normalizeIsoDate(
    studyDate,
    'ULTRASOUND_JOURNAL_DATE_INVALID'
  );
  const db = getDatabase();
  const entryBirthDateDigitsSql = getBirthDateDigitsSql('ultrasound_journal_entries.birth_date');
  const patientBirthDateDigitsSql = getBirthDateDigitsSql('p.birth_date');
  const rows = db.prepare(`
    SELECT
      id,
      study_date,
      patient_full_name,
      last_name,
      first_name,
      patronymic,
      birth_date,
      study_title,
      doctor_name,
      conclusion,
      (
        SELECT p.rmis_url
        FROM xray_patients p
        WHERE p.last_name = ultrasound_journal_entries.last_name
          AND p.first_name = ultrasound_journal_entries.first_name
          AND p.patronymic = ultrasound_journal_entries.patronymic
          AND ${patientBirthDateDigitsSql} = ${entryBirthDateDigitsSql}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
      ) AS rmis_url,
      created_at
    FROM ultrasound_journal_entries
    WHERE study_date = ?
    ORDER BY patient_full_name COLLATE NOCASE ASC, created_at DESC, id DESC
  `).all(normalizedStudyDate);

  const groupedEntries = new Map();

  rows.forEach((row) => {
    const key = `${row.patient_full_name}|${row.birth_date}`;

    if (!groupedEntries.has(key)) {
      groupedEntries.set(key, {
        patient: {
          fullName: row.patient_full_name,
          lastName: row.last_name,
          firstName: row.first_name,
          patronymic: row.patronymic,
          birthDate: row.birth_date,
        },
        studies: [],
      });
    }

    groupedEntries.get(key).studies.push(mapUltrasoundJournalStudy(row));
  });

  return Array.from(groupedEntries.values());
}

function listUltrasoundJournalByPatient({ lastName, firstName, patronymic, birthDate }) {
  const normalizedLastName = normalizeRequiredText(lastName, 'XRAY_LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'XRAY_FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeText(patronymic);
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const db = getDatabase();
  const entryBirthDateDigitsSql = getBirthDateDigitsSql('ultrasound_journal_entries.birth_date');
  const patientBirthDateDigitsSql = getBirthDateDigitsSql('p.birth_date');

  return db.prepare(`
    SELECT
      id,
      study_date,
      study_title,
      doctor_name,
      conclusion,
      (
        SELECT p.rmis_url
        FROM xray_patients p
        WHERE p.last_name = ultrasound_journal_entries.last_name
          AND p.first_name = ultrasound_journal_entries.first_name
          AND p.patronymic = ultrasound_journal_entries.patronymic
          AND ${patientBirthDateDigitsSql} = ${entryBirthDateDigitsSql}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
      ) AS rmis_url,
      created_at
    FROM ultrasound_journal_entries
    WHERE last_name = ?
      AND first_name = ?
      AND patronymic = ?
      AND ${entryBirthDateDigitsSql} = ?
    ORDER BY study_date DESC, created_at DESC, id DESC
  `).all(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate
  ).map(mapUltrasoundJournalStudy);
}

function getUltrasoundProtocolEntry(id) {
  const normalizedId = normalizePositiveInteger(
    id,
    'ULTRASOUND_JOURNAL_PROTOCOL_ID_INVALID'
  );
  const db = getDatabase();
  const row = db.prepare(`
    SELECT
      id,
      study_date,
      patient_full_name,
      last_name,
      first_name,
      patronymic,
      birth_date,
      study_title,
      doctor_name,
      conclusion,
      source_file,
      document_html,
      created_at
    FROM ultrasound_journal_entries
    WHERE id = ?
    LIMIT 1
  `).get(normalizedId);

  return mapUltrasoundProtocolEntry(row);
}

function deleteUltrasoundJournalStudy(id) {
  const normalizedId = normalizePositiveInteger(
    id,
    'ULTRASOUND_JOURNAL_PROTOCOL_ID_INVALID'
  );
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM ultrasound_journal_entries
    WHERE id = ?
  `).run(normalizedId);

  return result.changes > 0;
}

function deleteUltrasoundJournalPatient({ lastName, firstName, patronymic, birthDate }) {
  const normalizedLastName = normalizeRequiredText(
    lastName,
    'ULTRASOUND_PATIENT_LAST_NAME_REQUIRED'
  );
  const normalizedFirstName = normalizeRequiredText(
    firstName,
    'ULTRASOUND_PATIENT_FIRST_NAME_REQUIRED'
  );
  const normalizedPatronymic = normalizeText(patronymic);
  const normalizedBirthDate = normalizeRequiredText(
    birthDate,
    'ULTRASOUND_PATIENT_BIRTH_DATE_REQUIRED'
  );
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM ultrasound_journal_entries
    WHERE last_name = ?
      AND first_name = ?
      AND patronymic = ?
      AND birth_date = ?
  `).run(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate
  );

  return Number(result.changes ?? 0);
}

function listXRayDoseReference() {
  const db = getDatabase();

  return db.prepare(`
    SELECT
      id,
      flag,
      title,
      constitution,
      detail,
      adult_kv,
      adult_mas,
      child_kv,
      child_mas,
      sort_order,
      created_at
    FROM xray_dose_reference
    ORDER BY sort_order ASC, id ASC
  `).all().map(mapXRayDoseReference);
}

function addXRayDoseReference(payload) {
  const db = getDatabase();
  const nextFlag = normalizeText(payload?.flag);
  const nextTitle = normalizeText(payload?.title);
  const nextConstitution = normalizeText(payload?.constitution);
  const nextDetail = normalizeText(payload?.detail);
  const nextAdultKv = normalizeText(payload?.adultKv);
  const nextAdultMas = normalizeText(payload?.adultMas);
  const nextChildKv = normalizeText(payload?.childKv);
  const nextChildMas = normalizeText(payload?.childMas);
  const createdAt = new Date().toISOString();
  const nextSortOrder =
    Number(
      db.prepare(`SELECT COALESCE(MAX(sort_order), -1) as max_sort_order FROM xray_dose_reference`).get()
        .max_sort_order
    ) + 1;

  const result = db.prepare(`
    INSERT INTO xray_dose_reference (
      flag,
      title,
      constitution,
      detail,
      adult_kv,
      adult_mas,
      child_kv,
      child_mas,
      sort_order,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nextFlag,
    nextTitle,
    nextConstitution,
    nextDetail,
    nextAdultKv,
    nextAdultMas,
    nextChildKv,
    nextChildMas,
    nextSortOrder,
    createdAt
  );

  const insertedRow = db.prepare(`
    SELECT
      id,
      flag,
      title,
      constitution,
      detail,
      adult_kv,
      adult_mas,
      child_kv,
      child_mas,
      sort_order,
      created_at
    FROM xray_dose_reference
    WHERE id = ?
  `).get(result.lastInsertRowid);

  return mapXRayDoseReference(insertedRow);
}

function updateXRayDoseReference(payload) {
  const db = getDatabase();
  const id = Number(payload?.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('XRAY_DOSE_REFERENCE_ID_INVALID');
  }

  const nextFlag = normalizeText(payload?.flag);
  const nextTitle = normalizeText(payload?.title);
  const nextConstitution = normalizeText(payload?.constitution);
  const nextDetail = normalizeText(payload?.detail);
  const nextAdultKv = normalizeText(payload?.adultKv);
  const nextAdultMas = normalizeText(payload?.adultMas);
  const nextChildKv = normalizeText(payload?.childKv);
  const nextChildMas = normalizeText(payload?.childMas);

  db.prepare(`
    UPDATE xray_dose_reference
    SET
      flag = ?,
      title = ?,
      constitution = ?,
      detail = ?,
      adult_kv = ?,
      adult_mas = ?,
      child_kv = ?,
      child_mas = ?
    WHERE id = ?
  `).run(
    nextFlag,
    nextTitle,
    nextConstitution,
    nextDetail,
    nextAdultKv,
    nextAdultMas,
    nextChildKv,
    nextChildMas,
    id
  );

  const updatedRow = db.prepare(`
    SELECT
      id,
      flag,
      title,
      constitution,
      detail,
      adult_kv,
      adult_mas,
      child_kv,
      child_mas,
      sort_order,
      created_at
    FROM xray_dose_reference
    WHERE id = ?
  `).get(id);

  if (!updatedRow) {
    throw new Error('XRAY_DOSE_REFERENCE_NOT_FOUND');
  }

  return mapXRayDoseReference(updatedRow);
}

function deleteXRayDoseReference(id) {
  const db = getDatabase();
  const normalizedId = Number(id);

  if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
    throw new Error('XRAY_DOSE_REFERENCE_ID_INVALID');
  }

  const result = db.prepare(`DELETE FROM xray_dose_reference WHERE id = ?`).run(normalizedId);
  return result.changes > 0;
}

function updateXRayFlJournalRmisUrl({ lastName, firstName, patronymic, birthDate, rmisUrl }) {
  const normalizedLastName = normalizeRequiredText(lastName, 'XRAY_LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'XRAY_FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeText(patronymic);
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const normalizedRmisUrl = normalizeText(rmisUrl) || null;
  const db = getDatabase();
  const createdAt = new Date().toISOString();

  const updateResult = db.prepare(`
    UPDATE xray_patients
    SET rmis_url = ?
    WHERE last_name = ?
      AND first_name = ?
      AND patronymic = ?
      AND birth_date = ?
  `).run(
    normalizedRmisUrl,
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate
  );

  if (updateResult.changes > 0) {
    return true;
  }

  const insertResult = db.prepare(`
    INSERT INTO xray_patients (
      last_name,
      first_name,
      patronymic,
      birth_date,
      address,
      rmis_url,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate,
    'Адрес не указан',
    normalizedRmisUrl,
    createdAt
  );

  return insertResult.changes > 0;
}

function addXRayStudy(payload) {
  const normalizedPayload = normalizeXRayStudyPayload(payload);
  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO xray_studies (
      patient_id,
      study_date,
      description,
      referral_diagnosis,
      study_area,
      study_type,
      cassette,
      study_count,
      radiation_dose,
      referred_by,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    normalizedPayload.patientId,
    normalizedPayload.studyDate,
    normalizedPayload.description,
    normalizedPayload.referralDiagnosis,
    normalizedPayload.studyArea,
    normalizedPayload.studyType,
    normalizedPayload.cassette,
    normalizedPayload.studyCount,
    normalizedPayload.radiationDose,
    normalizedPayload.referredBy,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    patientId: normalizedPayload.patientId,
    studyDate: normalizedPayload.studyDate,
    description: normalizedPayload.description,
    referralDiagnosis: normalizedPayload.referralDiagnosis,
    studyArea: normalizedPayload.studyArea,
    studyType: normalizedPayload.studyType,
    cassette: normalizedPayload.cassette,
    studyCount: normalizedPayload.studyCount,
    radiationDose: normalizedPayload.radiationDose,
    referredBy: normalizedPayload.referredBy,
    createdAt,
  };
}

function updateXRayStudy(payload) {
  const normalizedStudyId = normalizePositiveInteger(payload.id, 'XRAY_STUDY_ID_INVALID');
  const normalizedPayload = normalizeXRayStudyPayload(payload);
  const db = getDatabase();
  const result = db.prepare(`
    UPDATE xray_studies
    SET
      patient_id = ?,
      study_date = ?,
      description = ?,
      referral_diagnosis = ?,
      study_area = ?,
      study_type = ?,
      cassette = ?,
      study_count = ?,
      radiation_dose = ?,
      referred_by = ?
    WHERE id = ?
  `).run(
    normalizedPayload.patientId,
    normalizedPayload.studyDate,
    normalizedPayload.description,
    normalizedPayload.referralDiagnosis,
    normalizedPayload.studyArea,
    normalizedPayload.studyType,
    normalizedPayload.cassette,
    normalizedPayload.studyCount,
    normalizedPayload.radiationDose,
    normalizedPayload.referredBy,
    normalizedStudyId
  );

  if (result.changes === 0) {
    throw new Error('XRAY_STUDY_NOT_FOUND');
  }

  const row = db.prepare(`
    SELECT
      id,
      patient_id,
      study_date,
      description,
      referral_diagnosis,
      study_area,
      study_type,
      cassette,
      study_count,
      radiation_dose,
      referred_by,
      created_at
    FROM xray_studies
    WHERE id = ?
  `).get(normalizedStudyId);

  return mapXRayStudy(row);
}

function deleteXRayStudy(id) {
  const normalizedStudyId = normalizePositiveInteger(id, 'XRAY_STUDY_ID_INVALID');
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM xray_studies
    WHERE id = ?
  `).run(normalizedStudyId);

  return result.changes > 0;
}

function listMedicalExamPatients(monthKey) {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, full_name, birth_date, month_key, created_at
    FROM medical_exam_patients
    WHERE month_key = ?
    ORDER BY created_at DESC, id DESC
  `);

  return statement.all(monthKey).map((patient) => ({
    id: patient.id,
    fullName: patient.full_name,
    birthDate: patient.birth_date,
    monthKey: patient.month_key,
    createdAt: patient.created_at,
  }));
}

function countMedicalExamPatients(monthKey) {
  const normalizedMonthKey = String(monthKey ?? '').trim();

  if (!/^\d{4}-\d{2}$/.test(normalizedMonthKey)) {
    throw new Error('MONTH_KEY_INVALID');
  }

  const db = getDatabase();
  const statement = db.prepare(`
    SELECT COUNT(*) AS total
    FROM medical_exam_patients
    WHERE month_key = ?
  `);
  const result = statement.get(normalizedMonthKey);

  return Number(result.total ?? 0);
}

function addMedicalExamPatient({ fullName, birthDate, monthKey }) {
  const normalizedName = String(fullName ?? '').trim();
  const normalizedBirthDate = String(birthDate ?? '').trim();
  const normalizedMonthKey = String(monthKey ?? '').trim();

  if (!normalizedName) {
    throw new Error('FULL_NAME_REQUIRED');
  }

  if (!/^\d{8}$/.test(normalizedBirthDate)) {
    throw new Error('BIRTH_DATE_INVALID');
  }

  if (!/^\d{4}-\d{2}$/.test(normalizedMonthKey)) {
    throw new Error('MONTH_KEY_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const insertStatement = db.prepare(`
    INSERT INTO medical_exam_patients (full_name, birth_date, month_key, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = insertStatement.run(
    normalizedName,
    normalizedBirthDate,
    normalizedMonthKey,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    fullName: normalizedName,
    birthDate: normalizedBirthDate,
    monthKey: normalizedMonthKey,
    createdAt,
  };
}

function deleteMedicalExamPatient(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('PATIENT_ID_INVALID');
  }

  const db = getDatabase();
  const deleteStatement = db.prepare(`
    DELETE FROM medical_exam_patients
    WHERE id = ?
  `);
  const result = deleteStatement.run(numericId);

  return result.changes > 0;
}

function getSickLeavePeriods(sickLeaveId) {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, sick_leave_id, start_date, end_date, created_at
    FROM sick_leave_periods
    WHERE sick_leave_id = ?
    ORDER BY created_at ASC, id ASC
  `);

  return statement.all(sickLeaveId).map((period) => ({
    id: period.id,
    sickLeaveId: period.sick_leave_id,
    startDate: period.start_date,
    endDate: period.end_date,
    createdAt: period.created_at,
  }));
}

function mapSickLeave(row) {
  return {
    id: row.id,
    lastName: row.last_name,
    firstName: row.first_name,
    patronymic: row.patronymic,
    birthDate: row.birth_date,
    diagnosis: row.diagnosis,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at ?? null,
    periods: getSickLeavePeriods(row.id),
  };
}

function listSickLeaves() {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, last_name, first_name, patronymic, birth_date, diagnosis, status, created_at, closed_at
    FROM sick_leaves
    ORDER BY
      CASE status WHEN 'open' THEN 0 ELSE 1 END,
      created_at DESC,
      id DESC
  `);

  return statement.all().map(mapSickLeave);
}

function addSickLeave({
  lastName,
  firstName,
  patronymic,
  birthDate,
  diagnosis,
  startDate,
  endDate,
}) {
  const normalizedLastName = normalizeRequiredText(lastName, 'LAST_NAME_REQUIRED');
  const normalizedFirstName = normalizeRequiredText(firstName, 'FIRST_NAME_REQUIRED');
  const normalizedPatronymic = normalizeRequiredText(patronymic, 'PATRONYMIC_REQUIRED');
  const normalizedBirthDate = normalizeDateDigits(birthDate);
  const normalizedDiagnosis = normalizeRequiredText(diagnosis, 'DIAGNOSIS_REQUIRED');
  const normalizedStartDate = normalizeDateDigits(startDate);
  const normalizedEndDate = normalizeDateDigits(endDate);

  assertPeriodRange(normalizedStartDate, normalizedEndDate);

  const db = getDatabase();
  const createdAt = new Date().toISOString();
  const insertLeaveStatement = db.prepare(`
    INSERT INTO sick_leaves (
      last_name,
      first_name,
      patronymic,
      birth_date,
      diagnosis,
      status,
      created_at,
      closed_at
    )
    VALUES (?, ?, ?, ?, ?, 'open', ?, NULL)
  `);
  const leaveResult = insertLeaveStatement.run(
    normalizedLastName,
    normalizedFirstName,
    normalizedPatronymic,
    normalizedBirthDate,
    normalizedDiagnosis,
    createdAt
  );
  const sickLeaveId = Number(leaveResult.lastInsertRowid);

  const insertPeriodStatement = db.prepare(`
    INSERT INTO sick_leave_periods (sick_leave_id, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?)
  `);
  insertPeriodStatement.run(
    sickLeaveId,
    normalizedStartDate,
    normalizedEndDate,
    createdAt
  );

  const selectStatement = db.prepare(`
    SELECT id, last_name, first_name, patronymic, birth_date, diagnosis, status, created_at, closed_at
    FROM sick_leaves
    WHERE id = ?
  `);

  return mapSickLeave(selectStatement.get(sickLeaveId));
}

function addSickLeavePeriod({ sickLeaveId, startDate, endDate }) {
  const normalizedSickLeaveId = Number(sickLeaveId);
  const normalizedStartDate = normalizeDateDigits(startDate);
  const normalizedEndDate = normalizeDateDigits(endDate);

  if (!Number.isInteger(normalizedSickLeaveId) || normalizedSickLeaveId <= 0) {
    throw new Error('SICK_LEAVE_ID_INVALID');
  }

  assertPeriodRange(normalizedStartDate, normalizedEndDate);

  const db = getDatabase();
  const leaveStatement = db.prepare(`
    SELECT id, status
    FROM sick_leaves
    WHERE id = ?
  `);
  const sickLeave = leaveStatement.get(normalizedSickLeaveId);

  if (!sickLeave) {
    throw new Error('SICK_LEAVE_NOT_FOUND');
  }

  if (sickLeave.status !== 'open') {
    throw new Error('SICK_LEAVE_ALREADY_CLOSED');
  }

  const createdAt = new Date().toISOString();
  const insertStatement = db.prepare(`
    INSERT INTO sick_leave_periods (sick_leave_id, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?)
  `);
  const result = insertStatement.run(
    normalizedSickLeaveId,
    normalizedStartDate,
    normalizedEndDate,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    sickLeaveId: normalizedSickLeaveId,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    createdAt,
  };
}

function updateSickLeavePeriod({ id, sickLeaveId, startDate, endDate }) {
  const normalizedPeriodId = Number(id);
  const normalizedSickLeaveId = Number(sickLeaveId);
  const normalizedStartDate = normalizeDateDigits(startDate);
  const normalizedEndDate = normalizeDateDigits(endDate);

  if (!Number.isInteger(normalizedPeriodId) || normalizedPeriodId <= 0) {
    throw new Error('SICK_LEAVE_PERIOD_ID_INVALID');
  }

  if (!Number.isInteger(normalizedSickLeaveId) || normalizedSickLeaveId <= 0) {
    throw new Error('SICK_LEAVE_ID_INVALID');
  }

  assertPeriodRange(normalizedStartDate, normalizedEndDate);

  const db = getDatabase();
  const leaveStatement = db.prepare(`
    SELECT id, status
    FROM sick_leaves
    WHERE id = ?
  `);
  const sickLeave = leaveStatement.get(normalizedSickLeaveId);

  if (!sickLeave) {
    throw new Error('SICK_LEAVE_NOT_FOUND');
  }

  if (sickLeave.status !== 'open') {
    throw new Error('SICK_LEAVE_ALREADY_CLOSED');
  }

  const periodStatement = db.prepare(`
    SELECT id, sick_leave_id, created_at
    FROM sick_leave_periods
    WHERE id = ? AND sick_leave_id = ?
  `);
  const currentPeriod = periodStatement.get(normalizedPeriodId, normalizedSickLeaveId);

  if (!currentPeriod) {
    throw new Error('SICK_LEAVE_PERIOD_NOT_FOUND');
  }

  const updateStatement = db.prepare(`
    UPDATE sick_leave_periods
    SET start_date = ?, end_date = ?
    WHERE id = ? AND sick_leave_id = ?
  `);
  updateStatement.run(
    normalizedStartDate,
    normalizedEndDate,
    normalizedPeriodId,
    normalizedSickLeaveId
  );

  return {
    id: normalizedPeriodId,
    sickLeaveId: normalizedSickLeaveId,
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
    createdAt: currentPeriod.created_at,
  };
}

function closeSickLeave({ id, closeDate }) {
  const numericId = Number(id);
  const normalizedCloseDate = normalizeDateDigits(closeDate);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('SICK_LEAVE_ID_INVALID');
  }

  const db = getDatabase();
  const currentStatement = db.prepare(`
    SELECT id, last_name, first_name, patronymic, birth_date, diagnosis, status, created_at, closed_at
    FROM sick_leaves
    WHERE id = ?
  `);
  const currentSickLeave = currentStatement.get(numericId);

  if (!currentSickLeave) {
    throw new Error('SICK_LEAVE_NOT_FOUND');
  }

  if (currentSickLeave.status === 'closed') {
    return mapSickLeave(currentSickLeave);
  }

  const updateStatement = db.prepare(`
    UPDATE sick_leaves
    SET status = 'closed', closed_at = ?
    WHERE id = ?
  `);
  updateStatement.run(normalizedCloseDate, numericId);

  return mapSickLeave(currentStatement.get(numericId));
}

function deleteSickLeave(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('SICK_LEAVE_ID_INVALID');
  }

  const db = getDatabase();
  const deleteStatement = db.prepare(`
    DELETE FROM sick_leaves
    WHERE id = ?
  `);
  const result = deleteStatement.run(numericId);

  return result.changes > 0;
}

function listReminders() {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, text, reminder_date, recurrence, recurrence_day, created_at
    FROM reminders
    ORDER BY created_at DESC, id DESC
  `);

  return statement.all().map((reminder) => ({
    id: reminder.id,
    text: reminder.text,
    reminderDate: reminder.reminder_date ?? null,
    recurrence:
      reminder.recurrence === 'weekly' ||
      reminder.recurrence === 'monthly' ||
      reminder.recurrence === 'yearly'
        ? reminder.recurrence
        : 'none',
    recurrenceDay:
      reminder.recurrence_day === null || reminder.recurrence_day === undefined
        ? null
        : Number(reminder.recurrence_day),
    createdAt: reminder.created_at,
  }));
}

function addReminder({ text, reminderDate, recurrence, recurrenceDay }) {
  const normalizedText = normalizeRequiredText(text, 'REMINDER_TEXT_REQUIRED');
  const normalizedRecurrence =
    recurrence === 'weekly' ||
    recurrence === 'monthly' ||
    recurrence === 'yearly'
      ? recurrence
      : 'none';
  const normalizedReminderDate = reminderDate
    ? normalizeDateDigits(reminderDate)
    : null;
  const normalizedRecurrenceDay =
    normalizedRecurrence === 'monthly' ? Number(recurrenceDay) : null;

  if (
    normalizedRecurrence === 'monthly' &&
    (!Number.isInteger(normalizedRecurrenceDay) ||
      normalizedRecurrenceDay < 1 ||
      normalizedRecurrenceDay > 31)
  ) {
    throw new Error('RECURRENCE_DAY_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const insertStatement = db.prepare(`
    INSERT INTO reminders (text, reminder_date, recurrence, recurrence_day, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = insertStatement.run(
    normalizedText,
    normalizedReminderDate,
    normalizedRecurrence,
    normalizedRecurrenceDay,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    text: normalizedText,
    reminderDate: normalizedReminderDate,
    recurrence: normalizedRecurrence,
    recurrenceDay: normalizedRecurrenceDay,
    createdAt,
  };
}

function deleteReminder(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('REMINDER_ID_INVALID');
  }

  const db = getDatabase();
  const deleteStatement = db.prepare(`
    DELETE FROM reminders
    WHERE id = ?
  `);
  const result = deleteStatement.run(numericId);

  return result.changes > 0;
}

function getSchoolLinks(studentId) {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, student_id, url, created_at
    FROM school_links
    WHERE student_id = ?
    ORDER BY created_at ASC, id ASC
  `);

  return statement.all(studentId).map((link) => ({
    id: link.id,
    studentId: link.student_id,
    url: link.url,
    createdAt: link.created_at,
  }));
}

function getSchoolStudents(classId) {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, class_id, name, created_at
    FROM school_students
    WHERE class_id = ?
    ORDER BY created_at ASC, id ASC
  `);

  return statement.all(classId).map((student) => ({
    id: student.id,
    classId: student.class_id,
    name: student.name,
    createdAt: student.created_at,
    links: getSchoolLinks(student.id),
  }));
}

function getSchoolClasses(institutionId) {
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, institution_id, name, created_at
    FROM school_classes
    WHERE institution_id = ?
    ORDER BY created_at ASC, id ASC
  `);

  return statement.all(institutionId).map((schoolClass) => ({
    id: schoolClass.id,
    institutionId: schoolClass.institution_id,
    name: schoolClass.name,
    createdAt: schoolClass.created_at,
    students: getSchoolStudents(schoolClass.id),
  }));
}

function mapSchoolInstitution(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    createdAt: row.created_at,
    classes: getSchoolClasses(row.id),
  };
}

function importSchoolsSeedIfNeeded() {
  const db = getDatabase();
  const result = db.prepare(`
    SELECT COUNT(*) AS total
    FROM school_institutions
  `).get();

  if (Number(result.total ?? 0) > 0) {
    return;
  }

  const seedPath = path.join(__dirname, '..', 'schools-seed.json');
  if (!fs.existsSync(seedPath)) {
    return;
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  if (!Array.isArray(seed)) {
    return;
  }

  const insertInstitutionStatement = db.prepare(`
    INSERT INTO school_institutions (name, type, created_at)
    VALUES (?, ?, ?)
  `);
  const insertClassStatement = db.prepare(`
    INSERT INTO school_classes (institution_id, name, created_at)
    VALUES (?, ?, ?)
  `);
  const insertStudentStatement = db.prepare(`
    INSERT INTO school_students (class_id, name, created_at)
    VALUES (?, ?, ?)
  `);
  const insertLinkStatement = db.prepare(`
    INSERT INTO school_links (student_id, url, created_at)
    VALUES (?, ?, ?)
  `);

  for (const institution of seed) {
    const institutionCreatedAt = new Date().toISOString();
    const institutionResult = insertInstitutionStatement.run(
      institution.name,
      institution.type,
      institutionCreatedAt
    );
    const institutionId = Number(institutionResult.lastInsertRowid);

    for (const schoolClass of institution.classes ?? []) {
      const classCreatedAt = new Date().toISOString();
      const classResult = insertClassStatement.run(
        institutionId,
        schoolClass.name,
        classCreatedAt
      );
      const classId = Number(classResult.lastInsertRowid);

      for (const student of schoolClass.students ?? []) {
        const studentCreatedAt = new Date().toISOString();
        const studentResult = insertStudentStatement.run(
          classId,
          student.name,
          studentCreatedAt
        );
        const studentId = Number(studentResult.lastInsertRowid);

        for (const link of student.links ?? []) {
          insertLinkStatement.run(
            studentId,
            link.url,
            new Date().toISOString()
          );
        }
      }
    }
  }
}

function listSchoolInstitutions() {
  importSchoolsSeedIfNeeded();
  const db = getDatabase();
  const statement = db.prepare(`
    SELECT id, name, type, created_at
    FROM school_institutions
    ORDER BY created_at ASC, id ASC
  `);

  return statement.all().map(mapSchoolInstitution);
}

function addSchoolInstitution({ name, type }) {
  const normalizedName = normalizeRequiredText(name, 'INSTITUTION_NAME_REQUIRED');
  const normalizedType = normalizeRequiredText(type, 'INSTITUTION_TYPE_REQUIRED');

  if (!['school', 'kindergarten'].includes(normalizedType)) {
    throw new Error('INSTITUTION_TYPE_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO school_institutions (name, type, created_at)
    VALUES (?, ?, ?)
  `).run(normalizedName, normalizedType, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    name: normalizedName,
    type: normalizedType,
    createdAt,
    classes: [],
  };
}

function addSchoolClass({ institutionId, name }) {
  const normalizedInstitutionId = Number(institutionId);
  const normalizedName = normalizeRequiredText(name, 'CLASS_NAME_REQUIRED');

  if (!Number.isInteger(normalizedInstitutionId) || normalizedInstitutionId <= 0) {
    throw new Error('INSTITUTION_ID_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO school_classes (institution_id, name, created_at)
    VALUES (?, ?, ?)
  `).run(normalizedInstitutionId, normalizedName, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    institutionId: normalizedInstitutionId,
    name: normalizedName,
    createdAt,
    students: [],
  };
}

function addSchoolStudent({ classId, name }) {
  const normalizedClassId = Number(classId);
  const normalizedName = normalizeRequiredText(name, 'STUDENT_NAME_REQUIRED');

  if (!Number.isInteger(normalizedClassId) || normalizedClassId <= 0) {
    throw new Error('CLASS_ID_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO school_students (class_id, name, created_at)
    VALUES (?, ?, ?)
  `).run(normalizedClassId, normalizedName, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    classId: normalizedClassId,
    name: normalizedName,
    createdAt,
    links: [],
  };
}

function addSchoolLink({ studentId, url }) {
  const normalizedStudentId = Number(studentId);
  const normalizedUrl = normalizeRequiredText(url, 'LINK_URL_REQUIRED');

  if (!Number.isInteger(normalizedStudentId) || normalizedStudentId <= 0) {
    throw new Error('STUDENT_ID_INVALID');
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO school_links (student_id, url, created_at)
    VALUES (?, ?, ?)
  `).run(normalizedStudentId, normalizedUrl, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    studentId: normalizedStudentId,
    url: normalizedUrl,
    createdAt,
  };
}

async function openSchoolLink(url) {
  const normalizedUrl = normalizeRequiredText(url, 'LINK_URL_REQUIRED');
  const urlWithProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalizedUrl)
    ? normalizedUrl
    : `https://${normalizedUrl}`;

  let parsedUrl;

  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch {
    throw new Error('LINK_URL_INVALID');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('LINK_URL_INVALID');
  }

  await shell.openExternal(parsedUrl.toString());
  return true;
}

function deleteSchoolInstitution(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('INSTITUTION_ID_INVALID');
  }

  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM school_institutions
    WHERE id = ?
  `).run(numericId);

  return result.changes > 0;
}

function deleteSchoolClass(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('CLASS_ID_INVALID');
  }

  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM school_classes
    WHERE id = ?
  `).run(numericId);

  return result.changes > 0;
}

function deleteSchoolStudent(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('STUDENT_ID_INVALID');
  }

  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM school_students
    WHERE id = ?
  `).run(numericId);

  return result.changes > 0;
}

function deleteSchoolLink(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('LINK_ID_INVALID');
  }

  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM school_links
    WHERE id = ?
  `).run(numericId);

  return result.changes > 0;
}

function listNotes() {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, text, created_at
    FROM notes
    ORDER BY created_at DESC, id DESC
  `).all().map((row) => ({
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
  }));
}

function addNote({ text }) {
  const normalizedText = normalizeRequiredText(text, 'NOTE_TEXT_REQUIRED');
  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO notes (text, created_at)
    VALUES (?, ?)
  `).run(normalizedText, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    text: normalizedText,
    createdAt,
  };
}

function deleteNote(id) {
  const normalizedId = normalizePositiveInteger(id, 'NOTE_ID_INVALID');
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM notes
    WHERE id = ?
  `).run(normalizedId);

  return result.changes > 0;
}

function registerIpcHandlers() {
  ipcMain.handle('medical-exams:list-patients', (_event, monthKey) =>
    listMedicalExamPatients(monthKey)
  );

  ipcMain.handle('medical-exams:add-patient', (_event, payload) =>
    addMedicalExamPatient(payload)
  );

  ipcMain.handle('medical-exams:delete-patient', (_event, id) =>
    deleteMedicalExamPatient(id)
  );

  ipcMain.handle('medical-exams:count-patients', (_event, monthKey) =>
    countMedicalExamPatients(monthKey)
  );

  ipcMain.handle('sick-leaves:list', () => listSickLeaves());

  ipcMain.handle('sick-leaves:add', (_event, payload) => addSickLeave(payload));

  ipcMain.handle('sick-leaves:add-period', (_event, payload) =>
    addSickLeavePeriod(payload)
  );

  ipcMain.handle('sick-leaves:update-period', (_event, payload) =>
    updateSickLeavePeriod(payload)
  );

  ipcMain.handle('sick-leaves:close', (_event, payload) => closeSickLeave(payload));

  ipcMain.handle('sick-leaves:delete', (_event, id) => deleteSickLeave(id));

  ipcMain.handle('reminders:list', () => listReminders());

  ipcMain.handle('reminders:add', (_event, payload) => addReminder(payload));

  ipcMain.handle('reminders:delete', (_event, id) => deleteReminder(id));

  ipcMain.handle('notes:list', () => listNotes());

  ipcMain.handle('notes:add', (_event, payload) => addNote(payload));

  ipcMain.handle('notes:delete', (_event, id) => deleteNote(id));

  ipcMain.handle('schools:list', () => listSchoolInstitutions());

  ipcMain.handle('schools:add-institution', (_event, payload) =>
    addSchoolInstitution(payload)
  );

  ipcMain.handle('schools:add-class', (_event, payload) => addSchoolClass(payload));

  ipcMain.handle('schools:add-student', (_event, payload) =>
    addSchoolStudent(payload)
  );

  ipcMain.handle('schools:add-link', (_event, payload) => addSchoolLink(payload));

  ipcMain.handle('schools:open-link', (_event, url) => openSchoolLink(url));

  ipcMain.handle('schools:delete-institution', (_event, id) =>
    deleteSchoolInstitution(id)
  );

  ipcMain.handle('schools:delete-class', (_event, id) => deleteSchoolClass(id));

  ipcMain.handle('schools:delete-student', (_event, id) =>
    deleteSchoolStudent(id)
  );

  ipcMain.handle('schools:delete-link', (_event, id) => deleteSchoolLink(id));

  ipcMain.handle('xray:search-patients', (_event, query) =>
    searchXRayPatients(query)
  );

  ipcMain.handle('xray:add-patient', (_event, payload) =>
    addXRayPatient(payload)
  );

  ipcMain.handle('xray:update-patient', (_event, payload) =>
    updateXRayPatient(payload)
  );

  ipcMain.handle('xray:delete-patient', (_event, id) =>
    deleteXRayPatient(id)
  );

  ipcMain.handle('xray:open-link', (_event, url) =>
    openXRayLink(url)
  );

  ipcMain.handle('xray:list-journal-by-date', (_event, studyDate) =>
    listXRayJournalByDate(studyDate)
  );

  ipcMain.handle('xray:get-statistics', (_event, payload) =>
    getXRayStatistics(payload)
  );

  ipcMain.handle('xray:list-dose-reference', () =>
    listXRayDoseReference()
  );

  ipcMain.handle('xray:add-dose-reference', (_event, payload) =>
    addXRayDoseReference(payload)
  );

  ipcMain.handle('xray:update-dose-reference', (_event, payload) =>
    updateXRayDoseReference(payload)
  );

  ipcMain.handle('xray:delete-dose-reference', (_event, id) =>
    deleteXRayDoseReference(id)
  );

  ipcMain.handle('xray:list-fl-journal-by-date', (_event, shotDate) =>
    listXRayFlJournalByDate(shotDate)
  );

  ipcMain.handle('xray:list-fl-journal-by-patient', (_event, payload) =>
    listXRayFlJournalByPatient(payload)
  );

  ipcMain.handle('xray:update-fl-journal-rmis-url', (_event, payload) =>
    updateXRayFlJournalRmisUrl(payload)
  );

  ipcMain.handle('xray:select-fl-journal-file', () =>
    selectXRayFlJournalFile()
  );

  ipcMain.handle('xray:import-fl-journal-file', (_event, filePath) =>
    importXRayFlJournalFile(filePath)
  );

  ipcMain.handle('ultrasound-journal:list-by-date', (_event, studyDate) =>
    listUltrasoundJournalByDate(studyDate)
  );

  ipcMain.handle('ultrasound-journal:list-by-patient', (_event, payload) =>
    listUltrasoundJournalByPatient(payload)
  );

  ipcMain.handle('ultrasound-journal:get-protocol', (_event, id) =>
    getUltrasoundProtocolEntry(id)
  );

  ipcMain.handle('ultrasound-journal:delete-study', (_event, id) =>
    deleteUltrasoundJournalStudy(id)
  );

  ipcMain.handle('ultrasound-journal:delete-patient', (_event, payload) =>
    deleteUltrasoundJournalPatient(payload)
  );

  ipcMain.handle('ultrasound-journal:select-file', () =>
    selectUltrasoundJournalFile()
  );

  ipcMain.handle('ultrasound-journal:import-file', (_event, filePath) =>
    importUltrasoundJournalFile(filePath)
  );

  ipcMain.handle('xray:list-studies', (_event, patientId) =>
    listXRayStudies(patientId)
  );

  ipcMain.handle('xray:add-study', (_event, payload) =>
    addXRayStudy(payload)
  );

  ipcMain.handle('xray:update-study', (_event, payload) =>
    updateXRayStudy(payload)
  );

  ipcMain.handle('xray:delete-study', (_event, id) =>
    deleteXRayStudy(id)
  );
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 680,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.webContents.session.clearCache().catch(() => {});
    mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools();
    return;
  }

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  getDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (database) {
    database.close();
    database = undefined;
  }
});
