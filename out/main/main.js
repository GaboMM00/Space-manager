"use strict";
const electron = require("electron");
const path = require("path");
console.log("🟢 Electron Main Process is running...");
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true
    }
  });
  win.loadURL("http://localhost:5173");
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.ipcMain.on("espacio-lanzado", (_event, data) => {
    console.log("Espacio lanzado:", data);
  });
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
