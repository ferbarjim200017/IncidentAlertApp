const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openOutlook: (data) => ipcRenderer.invoke('open-outlook', data)
});
