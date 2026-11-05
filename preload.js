const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('lanchonete', { plataforma: process.platform, versao: process.versions.electron });
