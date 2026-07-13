const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Add main entry
pkg.main = 'dist-electron/main.js';

// Add scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts['dev:desktop'] = 'cross-env ELECTRON=true vite';
pkg.scripts['build:desktop'] = 'cross-env ELECTRON=true vite build && electron-builder';

// Add electron-builder configuration
pkg.build = {
  appId: 'com.dukapro.app',
  productName: 'DukaPro',
  directories: {
    output: 'release/${version}'
  },
  files: [
    'dist',
    'dist-electron'
  ],
  mac: {
    target: ['dmg'],
    icon: 'public/favicon.ico'
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'public/favicon.ico'
  },
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'public/favicon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('package.json updated successfully.');
