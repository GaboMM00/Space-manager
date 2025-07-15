"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  lanzarEspacio: (data) => electron.ipcRenderer.send("espacio-lanzado", data)
});
