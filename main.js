// Cardapio (cliente) - app de PC
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); }

function criar() {
  Menu.setApplicationMenu(null);
  const w = new BrowserWindow({
    width: 1280, height: 820, minWidth: 380, minHeight: 600,
    title: 'Lanchonete - Cardápio',
    icon: path.join(__dirname, 'icone.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  w.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(criar);
app.on('second-instance', () => { const [w] = BrowserWindow.getAllWindows(); if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
