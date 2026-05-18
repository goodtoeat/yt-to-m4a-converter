const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path'),
  addTask: (data) => ipcRenderer.send('add-task', data),
  onTaskAdded: (callback) => ipcRenderer.on('task-added', (event, data) => callback(data)),
  onTaskInfo: (callback) => ipcRenderer.on('task-info', (event, data) => callback(data)),
  onTaskProgress: (callback) => ipcRenderer.on('task-progress', (event, data) => callback(data)),
  onTaskError: (callback) => ipcRenderer.on('task-error', (event, data) => callback(data)),
});
