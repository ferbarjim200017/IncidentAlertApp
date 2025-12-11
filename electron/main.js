const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: isDev
    },
    backgroundColor: '#1a1a2e',
    show: false,
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // Esperar a que la ventana esté lista para mostrarla
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    // En desarrollo, cargar desde el servidor de Vite
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar el build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Manejar la creación de nuevas ventanas
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

// Crear ventana cuando la app esté lista
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
