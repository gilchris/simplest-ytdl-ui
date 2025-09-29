# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Run the Electron app in production mode
- `npm run dev` - Run the Electron app with developer tools enabled (opens DevTools automatically)

## Project Architecture

This is a simple Electron-based YouTube downloader UI with the following structure:

### Core Components
- **main.js**: Electron main process that creates the BrowserWindow and handles IPC for folder selection dialogs
- **index.html**: Single-page UI with form inputs for URL and save path, plus download button
- **renderer.js**: Frontend logic handling user interactions, form validation, and YouTube URL pattern matching

### Key Architecture Details
- Uses older Electron security model with `nodeIntegration: true` and `contextIsolation: false`
- IPC communication between main and renderer processes for folder dialog (`open-folder-dialog`)
- YouTube URL validation supports multiple patterns: youtube.com/watch, youtu.be, etc.
- Status feedback system with CSS classes for success/error/info states
- Currently has placeholder download functionality (setTimeout mock) - actual youtube-dl integration not yet implemented

### External Dependencies
- **ytdl/** directory contains youtube-dl binaries (Linux and Windows versions)
- Node.js version pinned to 22.18.0 (specified in .tool-versions and package.json engines)
- Only production dependency is Electron

### Development Notes
- The download functionality currently shows a mock success message after 1 second delay
- YouTube URL validation is implemented client-side with regex patterns
- No build process, linting, or test commands configured
- Uses modern CSS with flexbox and gradients for UI styling