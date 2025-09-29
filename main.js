const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select folder to save downloads'
    });
    return result;
});

function getYoutubeDlPath() {
    const isWindows = os.platform() === 'win32';
    const binaryName = isWindows ? 'youtube-dl.exe' : 'youtube-dl';
    return path.join(__dirname, 'ytdl', binaryName);
}

ipcMain.handle('download-video', async (event, url, savePath) => {
    return new Promise((resolve, reject) => {
        const youtubeDlPath = getYoutubeDlPath();

        if (!fs.existsSync(youtubeDlPath)) {
            reject(new Error('youtube-dl binary not found'));
            return;
        }

        // Create timestamp-based filename: YYYYMMDDHHMMSS.mp4
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/-/g, '')
            .replace(/T/, '')
            .replace(/:/g, '')
            .split('.')[0]; // Remove milliseconds

        const filename = `${timestamp}.mp4`;
        const outputTemplate = path.join(savePath, filename);

        const args = [
            '-o', outputTemplate,
            '-f', 'best[ext=mp4]/best',
            url
        ];

        const ytdlProcess = spawn(youtubeDlPath, args);
        let output = '';
        let errorOutput = '';

        ytdlProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            event.sender.send('download-progress', text);
        });

        ytdlProcess.stderr.on('data', (data) => {
            const text = data.toString();
            errorOutput += text;
            event.sender.send('download-progress', text);
        });

        ytdlProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output });
            } else {
                reject(new Error(`Download failed with code ${code}: ${errorOutput}`));
            }
        });

        ytdlProcess.on('error', (error) => {
            reject(error);
        });
    });
});