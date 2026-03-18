const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

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
  ensureSchoolsSchema(database);

  return database;
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
    SELECT id, text, reminder_date, created_at
    FROM reminders
    ORDER BY created_at DESC, id DESC
  `);

  return statement.all().map((reminder) => ({
    id: reminder.id,
    text: reminder.text,
    reminderDate: reminder.reminder_date ?? null,
    createdAt: reminder.created_at,
  }));
}

function addReminder({ text, reminderDate }) {
  const normalizedText = normalizeRequiredText(text, 'REMINDER_TEXT_REQUIRED');
  const normalizedReminderDate = reminderDate
    ? normalizeDateDigits(reminderDate)
    : null;
  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const insertStatement = db.prepare(`
    INSERT INTO reminders (text, reminder_date, created_at)
    VALUES (?, ?, ?)
  `);
  const result = insertStatement.run(
    normalizedText,
    normalizedReminderDate,
    createdAt
  );

  return {
    id: Number(result.lastInsertRowid),
    text: normalizedText,
    reminderDate: normalizedReminderDate,
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

  ipcMain.handle('sick-leaves:close', (_event, payload) => closeSickLeave(payload));

  ipcMain.handle('sick-leaves:delete', (_event, id) => deleteSickLeave(id));

  ipcMain.handle('reminders:list', () => listReminders());

  ipcMain.handle('reminders:add', (_event, payload) => addReminder(payload));

  ipcMain.handle('reminders:delete', (_event, id) => deleteReminder(id));

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
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 680,
    autoHideMenuBar: true,
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
