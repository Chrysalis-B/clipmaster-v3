import { join } from 'node:path';
import {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  globalShortcut,
  Notification,
  Tray,
  Menu,
} from 'electron';

let tray: Tray | null = null;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minHeight: 600,
    minWidth: 300,
    maxHeight: 800,
    maxWidth: 450,
    maximizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  return mainWindow;
};

app.on('ready', () => {
  const browserWindow = createWindow();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        app.focus();
        browserWindow.show();
        browserWindow.focus();
      },
    },
    {
      label: 'Quit',
      role: 'quit',
    },
  ]);

  tray = new Tray('./src/icons/trayTemplate.png');
  tray.setContextMenu(contextMenu);

  globalShortcut.register('CommandOrControl+Shift+V', () => {
    app.focus();
    browserWindow.show();
    browserWindow.focus();
  });

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    const content = clipboard.readText().toUpperCase();
    clipboard.writeText(content);
    new Notification({
      body: content,
      title: 'Capitalized Clipboard',
      subtitle: 'Copied to clipboard',
    }).show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('write-to-clipboard', (_, content: string) => {
  clipboard.writeText(content);
});

ipcMain.handle('read-from-clipboard', () => {
  return clipboard.readText();
});
