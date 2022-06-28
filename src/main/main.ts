import * as path from 'path';
import * as url from 'url';
import { BrowserWindow, app } from 'electron';

require('@electron/remote/main').initialize();

let mainWindow: Electron.BrowserWindow | null;

const isDevelopment = process.env.NODE_ENV === 'development';

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      webSecurity: true,
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDevelopment,
    },
  });

  // and load the index.html of the app.
  mainWindow
    .loadURL(
      isDevelopment
        ? 'http://localhost:3000'
        : url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true,
          }),
    )
    .finally(() => {
      /* no action */
    });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  require('@electron/remote/main').enable(mainWindow.webContents);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.