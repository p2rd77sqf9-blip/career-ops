const { app, BrowserWindow, session, systemPreferences } = require('electron');
const path = require('path');

async function createWindow() {
  // macOS: trigger the system camera-permission prompt up front
  if (process.platform === 'darwin') {
    try { await systemPreferences.askForMediaAccess('camera'); } catch {}
  }

  // allow only camera/mic requests from our own page, deny everything else
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => {
    cb(permission === 'media');
  });

  const win = new BrowserWindow({
    width: 1280,
    height: 780,
    backgroundColor: '#0b0b0e',
    autoHideMenuBar: true,
    title: 'Datamosher',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
