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
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}${match[2]}${match[1]}` : '01011900';
}

function formatStudyDate(value, fallback) {
  const source = String(value || fallback || '');
  const match = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function formatImportedCreatedAt(value, fallback) {
  const source = value || fallback || new Date();
  const date = source instanceof Date ? source : new Date(source);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
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
  `);

  const [researches] = await mysqlConn.query(`
    SELECT
      r.patient_id,
      r.dsnapr,
      r.research_region,
      r.research_type,
      r.cassete_size,
      r.numb_of_proc,
      r.dose,
      r.sent,
      r.description,
      r.created_at,
      v.visit_date,
      p.full_name,
      p.adress
    FROM research r
    JOIN patients p ON p.id = r.patient_id
    LEFT JOIN visits v ON v.id = r.visit_id
  `);

  await mysqlConn.end();

  const db = new DatabaseSync(SQLITE_PATH);

  const findPatientCandidatesStmt = db.prepare(`
    SELECT id, birth_date
    FROM xray_patients
    WHERE last_name = ?
      AND first_name = ?
      AND patronymic = ?
      AND address = ?
  `);

  const updatePatientBirthDateStmt = db.prepare(`
    UPDATE xray_patients
    SET birth_date = ?
    WHERE id = ?
  `);

  const findStudyCandidatesStmt = db.prepare(`
    SELECT id, study_date
    FROM xray_studies
    WHERE patient_id = ?
      AND created_at = ?
      AND referral_diagnosis = ?
      AND study_area = ?
      AND study_type = ?
      AND cassette = ?
      AND study_count = ?
      AND radiation_dose = ?
      AND referred_by = ?
      AND description = ?
  `);

  const updateStudyDateStmt = db.prepare(`
    UPDATE xray_studies
    SET study_date = ?
    WHERE id = ?
  `);

  const mysqlPatientToSqliteIds = new Map();
  let fixedPatients = 0;

  for (const patient of patients) {
    const fio = splitFullName(patient.full_name);
    const exactBirthDate = formatBirthDate(patient.birth_date);
    const address = normalizeText(patient.adress) || '-';
    const candidates = findPatientCandidatesStmt.all(
      fio.lastName,
      fio.firstName,
      fio.patronymic,
      address,
    );

    const matchedIds = [];

    for (const candidate of candidates) {
      matchedIds.push(Number(candidate.id));
      if (candidate.birth_date !== exactBirthDate) {
        updatePatientBirthDateStmt.run(exactBirthDate, candidate.id);
        fixedPatients += 1;
      }
    }

    if (matchedIds.length > 0) {
      mysqlPatientToSqliteIds.set(patient.id, matchedIds);
    }
  }

  let fixedStudies = 0;

  for (const research of researches) {
    const patientIds = mysqlPatientToSqliteIds.get(research.patient_id) || [];
    if (patientIds.length === 0) continue;

    const exactStudyDate = formatStudyDate(research.visit_date, research.created_at);
    if (!exactStudyDate) continue;

    const createdAt = formatImportedCreatedAt(research.created_at, research.visit_date);
    const referralDiagnosis = normalizeText(research.dsnapr);
    const studyArea = normalizeText(research.research_region);
    const studyType = normalizeText(research.research_type) || 'Рентген';
    const cassette = normalizeText(research.cassete_size);
    const studyCountRaw = Number.parseInt(String(research.numb_of_proc ?? '').trim(), 10);
    const studyCount = Number.isNaN(studyCountRaw) || studyCountRaw <= 0 ? 1 : studyCountRaw;
    const radiationDose = research.dose == null ? '' : String(research.dose);
    const referredBy = normalizeText(research.sent);
    const description = normalizeText(research.description);

    for (const patientId of patientIds) {
      const candidates = findStudyCandidatesStmt.all(
        patientId,
        createdAt,
        referralDiagnosis,
        studyArea,
        studyType,
        cassette,
        studyCount,
        radiationDose,
        referredBy,
        description,
      );

      for (const candidate of candidates) {
        if (candidate.study_date !== exactStudyDate) {
          updateStudyDateStmt.run(exactStudyDate, candidate.id);
          fixedStudies += 1;
        }
      }
    }
  }

  db.close();

  console.log(JSON.stringify({
    sqlitePath: SQLITE_PATH,
    fixedPatients,
    fixedStudies,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
