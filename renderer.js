const { ipcRenderer } = require('electron');

const downloadBtn = document.getElementById('downloadBtn');
const urlInput = document.getElementById('url');
const savePathInput = document.getElementById('savePath');
const browseBtn = document.getElementById('browseBtn');
const statusDiv = document.getElementById('status');

ipcRenderer.on('download-progress', (event, progressText) => {
    const cleanText = progressText.replace(/\r?\n/g, ' ').trim();
    if (cleanText) {
        updateStatus(cleanText, 'info');
    }
});

function updateStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = '';
    if (type) {
        statusDiv.classList.add(type);
    }
}

async function openFolderDialog() {
    try {
        const result = await ipcRenderer.invoke('open-folder-dialog');
        if (result && !result.canceled && result.filePaths.length > 0) {
            savePathInput.value = result.filePaths[0];
            checkValidationStatus();
        }
    } catch (error) {
        updateStatus('Error selecting folder', 'error');
        console.error('Folder selection error:', error);
    }
}

browseBtn.addEventListener('click', openFolderDialog);
savePathInput.addEventListener('click', openFolderDialog);

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const savePath = savePathInput.value.trim();

    if (!url) {
        updateStatus('Please enter a YouTube URL', 'error');
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        updateStatus('Please enter a valid YouTube URL', 'error');
        return;
    }

    if (!savePath) {
        updateStatus('Please select a folder to save the file', 'error');
        return;
    }

    downloadBtn.disabled = true;
    updateStatus('Starting download...', 'info');

    try {
        const result = await ipcRenderer.invoke('download-video', url, savePath);
        updateStatus('Download completed successfully!', 'success');
    } catch (error) {
        updateStatus(`Download failed: ${error.message}`, 'error');
        console.error('Download error:', error);
    } finally {
        downloadBtn.disabled = false;
    }
});

function isValidYouTubeUrl(url) {
    const patterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^(https?:\/\/)?youtu\.be\/[\w-]+/
    ];

    return patterns.some(pattern => pattern.test(url));
}

function checkValidationStatus() {
    const url = urlInput.value.trim();
    const savePath = savePathInput.value.trim();

    if (!url) {
        updateStatus('Please enter a YouTube URL', 'error');
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        updateStatus('Please enter a valid YouTube URL', 'error');
        return;
    }

    if (!savePath) {
        updateStatus('Please select a save location', 'error');
        return;
    }

    updateStatus('Ready to download', 'success');
}

urlInput.addEventListener('input', checkValidationStatus);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        downloadBtn.click();
    }
});

savePathInput.addEventListener('input', checkValidationStatus);

// Initial validation check when page loads
checkValidationStatus();

console.log('Renderer process loaded');
console.log('Node.js version:', process.versions.node);
console.log('Electron version:', process.versions.electron);