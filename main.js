const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Track active child processes
const activeProcesses = new Set();

// Fix paths for packaged app (asar)
const fixAsarPath = (p) => {
  return app.isPackaged ? p.replace('app.asar', 'app.asar.unpacked') : p;
};

// Use bundled binaries from bin/ directory
const ffmpegBinary = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
const ffmpegPath = fixAsarPath(path.join(__dirname, 'bin', ffmpegBinary));

// Use the bundled standalone yt-dlp binary to avoid Python version issues
const ytDlpBinary = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const ytDlpPath = fixAsarPath(path.join(__dirname, 'bin', ytDlpBinary));
const youtubedl = require('yt-dlp-exec').create(ytDlpPath);

let mainWindow;
let downloadPath = app.getPath('downloads');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    downloadPath = result.filePaths[0];
    return downloadPath;
  }
  return null;
});

ipcMain.handle('get-default-path', () => {
  return downloadPath;
});

ipcMain.on('add-task', async (event, { url, quality }) => {
  const taskId = uuidv4();
  
  // Notify frontend that task is added
  event.reply('task-added', { taskId, url });

  try {
    // 1. Get info first (optional, to get title)
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
    });

    const title = info.title || 'video';
    event.reply('task-info', { taskId, title });

    // 2. Start download and conversion
    // For M4A (AAC), we can pass bitrate strings directly to audioQuality
    const audioBitrate = quality === 'high' ? '256K' : '128K';
    
    // Clean title more thoroughly for filenames
    const safeTitle = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9.-]/g, '_').substring(0, 100);
    const outputTemplate = path.join(downloadPath, `${safeTitle}.m4a`);

    const child = youtubedl.exec(url, {
      extractAudio: true,
      audioFormat: 'm4a',
      audioQuality: audioBitrate, // yt-dlp accepts bitrate strings here
      output: outputTemplate,
      ffmpegLocation: ffmpegPath,
      newline: true,
    });

    activeProcesses.add(child);

    child.stdout.on('data', (data) => {
      const line = data.toString();
      // Parse progress: [download]  10.0% of 10.00MiB at  1.00MiB/s ETA 00:00
      const progressMatch = line.match(/(\d+\.\d+)%/);
      if (progressMatch) {
        event.reply('task-progress', { taskId, progress: parseFloat(progressMatch[1]), status: 'Downloading' });
      }
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
      activeProcesses.delete(child);
      if (code === 0) {
        event.reply('task-progress', { taskId, progress: 100, status: 'Completed' });
      } else {
        event.reply('task-error', { taskId, error: `Process exited with code ${code}` });
      }
    });

  } catch (error) {
    event.reply('task-error', { taskId, error: error.message });
  }
});

// Ensure all processes are killed when app quits
app.on('before-quit', () => {
  activeProcesses.forEach(child => {
    if (child.kill) child.kill();
  });
});
