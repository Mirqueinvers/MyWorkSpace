const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  medicalExams: {
    listPatients(monthKey) {
      return ipcRenderer.invoke('medical-exams:list-patients', monthKey);
    },
    addPatient(payload) {
      return ipcRenderer.invoke('medical-exams:add-patient', payload);
    },
    deletePatient(id) {
      return ipcRenderer.invoke('medical-exams:delete-patient', id);
    },
    countPatients(monthKey) {
      return ipcRenderer.invoke('medical-exams:count-patients', monthKey);
    },
  },
  sickLeaves: {
    list() {
      return ipcRenderer.invoke('sick-leaves:list');
    },
    add(payload) {
      return ipcRenderer.invoke('sick-leaves:add', payload);
    },
    addPeriod(payload) {
      return ipcRenderer.invoke('sick-leaves:add-period', payload);
    },
    close(payload) {
      return ipcRenderer.invoke('sick-leaves:close', payload);
    },
    delete(id) {
      return ipcRenderer.invoke('sick-leaves:delete', id);
    },
  },
  reminders: {
    list() {
      return ipcRenderer.invoke('reminders:list');
    },
    add(payload) {
      return ipcRenderer.invoke('reminders:add', payload);
    },
    delete(id) {
      return ipcRenderer.invoke('reminders:delete', id);
    },
  },
  notes: {
    list() {
      return ipcRenderer.invoke('notes:list');
    },
    add(payload) {
      return ipcRenderer.invoke('notes:add', payload);
    },
    delete(id) {
      return ipcRenderer.invoke('notes:delete', id);
    },
  },
  schools: {
    list() {
      return ipcRenderer.invoke('schools:list');
    },
    addInstitution(payload) {
      return ipcRenderer.invoke('schools:add-institution', payload);
    },
    addClass(payload) {
      return ipcRenderer.invoke('schools:add-class', payload);
    },
    addStudent(payload) {
      return ipcRenderer.invoke('schools:add-student', payload);
    },
    addLink(payload) {
      return ipcRenderer.invoke('schools:add-link', payload);
    },
    openLink(url) {
      return ipcRenderer.invoke('schools:open-link', url);
    },
    deleteInstitution(id) {
      return ipcRenderer.invoke('schools:delete-institution', id);
    },
    deleteClass(id) {
      return ipcRenderer.invoke('schools:delete-class', id);
    },
    deleteStudent(id) {
      return ipcRenderer.invoke('schools:delete-student', id);
    },
    deleteLink(id) {
      return ipcRenderer.invoke('schools:delete-link', id);
    },
  },
  xray: {
    searchPatients(query) {
      return ipcRenderer.invoke('xray:search-patients', query);
    },
    addPatient(payload) {
      return ipcRenderer.invoke('xray:add-patient', payload);
    },
    updatePatient(payload) {
      return ipcRenderer.invoke('xray:update-patient', payload);
    },
    deletePatient(id) {
      return ipcRenderer.invoke('xray:delete-patient', id);
    },
    openLink(url) {
      return ipcRenderer.invoke('xray:open-link', url);
    },
    listJournalByDate(studyDate) {
      return ipcRenderer.invoke('xray:list-journal-by-date', studyDate);
    },
    getStatistics(payload) {
      return ipcRenderer.invoke('xray:get-statistics', payload);
    },
    listDoseReference() {
      return ipcRenderer.invoke('xray:list-dose-reference');
    },
    addDoseReference(payload) {
      return ipcRenderer.invoke('xray:add-dose-reference', payload);
    },
    updateDoseReference(payload) {
      return ipcRenderer.invoke('xray:update-dose-reference', payload);
    },
    deleteDoseReference(id) {
      return ipcRenderer.invoke('xray:delete-dose-reference', id);
    },
    listFlJournalByDate(shotDate) {
      return ipcRenderer.invoke('xray:list-fl-journal-by-date', shotDate);
    },
    listFlJournalByPatient(payload) {
      return ipcRenderer.invoke('xray:list-fl-journal-by-patient', payload);
    },
    updateFlJournalRmisUrl(payload) {
      return ipcRenderer.invoke('xray:update-fl-journal-rmis-url', payload);
    },
    selectFlJournalFile() {
      return ipcRenderer.invoke('xray:select-fl-journal-file');
    },
    importFlJournalFile(filePath) {
      return ipcRenderer.invoke('xray:import-fl-journal-file', filePath);
    },
    listStudies(patientId) {
      return ipcRenderer.invoke('xray:list-studies', patientId);
    },
    addStudy(payload) {
      return ipcRenderer.invoke('xray:add-study', payload);
    },
    updateStudy(payload) {
      return ipcRenderer.invoke('xray:update-study', payload);
    },
    deleteStudy(id) {
      return ipcRenderer.invoke('xray:delete-study', id);
    },
  },
});
