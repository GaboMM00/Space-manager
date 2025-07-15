import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  lanzarEspacio: (data: any) => ipcRenderer.send('espacio-lanzado', data),
});
