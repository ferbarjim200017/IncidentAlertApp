const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');
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
      devTools: isDev,
      preload: path.join(__dirname, 'preload.js')
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

// Handler para abrir Outlook con HTML
ipcMain.handle('open-outlook', async (event, { to, subject, htmlBody }) => {
  try {
    if (process.platform === 'win32') {
      // En Windows, usar PowerShell para crear correo con Outlook COM
      const psScript = `
        $outlook = New-Object -ComObject Outlook.Application
        $mail = $outlook.CreateItem(0)
        $mail.To = "${to}"
        $mail.Subject = "${subject}"
        $mail.HTMLBody = @"
${htmlBody}
"@
        $mail.Display()
      `;
      
      const command = `powershell.exe -Command "${psScript.replace(/"/g, '\\"')}"`;
      exec(command, (error) => {
        if (error) {
          console.error('Error al abrir Outlook:', error);
        }
      });
      
      return { success: true };
    } else {
      // Fallback para otros sistemas
      shell.openExternal(`mailto:${to}?subject=${encodeURIComponent(subject)}`);
      return { success: false, message: 'Solo soportado en Windows con Outlook' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
});
