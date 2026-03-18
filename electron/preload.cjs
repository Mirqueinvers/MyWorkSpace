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
});
