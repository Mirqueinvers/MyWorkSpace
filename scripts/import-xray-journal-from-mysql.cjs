const path = require('node:path');
const os = require('node:os');
const { DatabaseSync } = require('node:sqlite');
const mysql = require('C:/React/x_ray_journal/Backend/node_modules/mysql2/promise');

const SQLITE_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'myworkspase', 'myworkspase.sqlite');

function normalizeText(value) {
  return String(value ?? '').trim();
}

function splitFullName(fullName) {
  const parts = normalizeText(fullName).split(/\s+/).filter(Boolean);
  return {
    lastName: parts[0] || '-',
    firstName: parts[1] || '-',
    patronymic: parts[2] || '-',
  };
}

function formatBirthDate(value) {
  if (!value) return '01011900';
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}${match[2]}${match[1]}`;
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '01011900';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear());
  return `${day}${month}${year}`;
}

function formatIsoDate(value, fallback) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  const source = value || fallback || new Date();
  const date = source instanceof Date ? source : new Date(source);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatCreatedAt(value, fallback) {
  const source = value || fallback || new Date();
  const date = source instanceof Date ? source : new Date(source);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function runTransaction(db, fn) {
  db.exec('BEGIN;');
  try {
    fn();
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'userpass',
    database: 'x_ray_journal',
    dateStrings: true,
  });

  const [patients] = await mysqlConn.query(`
    SELECT id, full_name, birth_date, adress
    FROM patients
    ORDER BY id ASC
  `);

  const [researches] = await mysqlConn.query(`
    SELECT
      r.id,
      r.patient_id,
      r.visit_id,
      r.dsnapr,
      r.research_region,
      r.research_type,
      r.cassete_size,
      r.numb_of_proc,
      r.dose,
      r.sent,
      r.created_at,
      r.description,
      v.visit_date
    FROM research r
    LEFT JOIN visits v ON v.id = r.visit_id
    ORDER BY r.id ASC
  `);

  await mysqlConn.end();

  const db = new DatabaseSync(SQLITE_PATH);
  db.exec('PRAGMA foreign_keys = ON;');

  const findPatientStmt = db.prepare(`
    SELECT id
    FROM xray_patients
    WHERE last_name = ?
      AND first_name = ?
      AND patronymic = ?
      AND birth_date = ?
      AND address = ?
    LIMIT 1
  `);

  const insertPatientStmt = db.prepare(`
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
  `);

  const findStudyStmt = db.prepare(`
    SELECT id
    FROM xray_studies
    WHERE patient_id = ?
      AND study_date = ?
      AND description = ?
      AND referral_diagnosis = ?
      AND study_area = ?
      AND study_type = ?
      AND cassette = ?
      AND study_count = ?
      AND radiation_dose = ?
      AND referred_by = ?
    LIMIT 1
  `);

  const insertStudyStmt = db.prepare(`
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
  `);

  const patientIdMap = new Map();
  let insertedPatients = 0;
  let matchedPatients = 0;

  runTransaction(db, () => {
    for (const patient of patients) {
      const fio = splitFullName(patient.full_name);
      const birthDate = formatBirthDate(patient.birth_date);
      const address = normalizeText(patient.adress) || '-';
      const createdAt = formatCreatedAt(patient.birth_date);

      const existing = findPatientStmt.get(
        fio.lastName,
        fio.firstName,
        fio.patronymic,
        birthDate,
        address,
      );

      if (existing) {
        patientIdMap.set(patient.id, Number(existing.id));
        matchedPatients += 1;
        continue;
      }

      const result = insertPatientStmt.run(
        fio.lastName,
        fio.firstName,
        fio.patronymic,
        birthDate,
        address,
        null,
        createdAt,
      );

      patientIdMap.set(patient.id, Number(result.lastInsertRowid));
      insertedPatients += 1;
    }
  });

  let insertedStudies = 0;
  let matchedStudies = 0;

  runTransaction(db, () => {
    for (const research of researches) {
      const newPatientId = patientIdMap.get(research.patient_id);
      if (!newPatientId) continue;

      const studyDate = formatIsoDate(research.visit_date, research.created_at);
      const createdAt = formatCreatedAt(research.created_at, research.visit_date);
      const description = normalizeText(research.description);
      const referralDiagnosis = normalizeText(research.dsnapr);
      const studyArea = normalizeText(research.research_region);
      const studyType = normalizeText(research.research_type) || 'Рентген';
      const cassette = normalizeText(research.cassete_size);
      const studyCountRaw = Number.parseInt(String(research.numb_of_proc ?? '').trim(), 10);
      const studyCount = Number.isNaN(studyCountRaw) || studyCountRaw <= 0 ? 1 : studyCountRaw;
      const radiationDose = research.dose == null ? '' : String(research.dose);
      const referredBy = normalizeText(research.sent);

      const existing = findStudyStmt.get(
        newPatientId,
        studyDate,
        description,
        referralDiagnosis,
        studyArea,
        studyType,
        cassette,
        studyCount,
        radiationDose,
        referredBy,
      );

      if (existing) {
        matchedStudies += 1;
        continue;
      }

      insertStudyStmt.run(
        newPatientId,
        studyDate,
        description,
        referralDiagnosis,
        studyArea,
        studyType,
        cassette,
        studyCount,
        radiationDose,
        referredBy,
        createdAt,
      );
      insertedStudies += 1;
    }
  });

  db.close();

  console.log(JSON.stringify({
    sqlitePath: SQLITE_PATH,
    mysqlPatients: patients.length,
    mysqlResearches: researches.length,
    insertedPatients,
    matchedPatients,
    insertedStudies,
    matchedStudies,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
