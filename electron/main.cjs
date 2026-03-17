const { app, BrowserWindow, ipcMain } = require('electron');
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

function getDatabase() {
  if (database) {
    return database;
  }

  const userDataPath = app.getPath('userData');
  fs.mkdirSync(userDataPath, { recursive: true });

  database = new DatabaseSync(path.join(userDataPath, 'myworkspase.sqlite'));
  ensureMedicalExamPatientsSchema(database);

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
