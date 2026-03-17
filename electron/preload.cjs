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
});
