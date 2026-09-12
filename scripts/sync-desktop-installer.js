import { existsSync, readdirSync, copyFileSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const releaseDir = resolve('release');
const publicDir = resolve('public');
const targetFile = join(publicDir, 'Jenga-Setup-Latest.exe');

if (!existsSync(releaseDir)) {
  console.log('[sync-installer] No release directory found.');
  process.exit(0);
}

// Find version directories in release/
const versions = readdirSync(releaseDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d+\.\d+\.\d+/.test(d.name))
  .map(d => d.name)
  .sort((a, b) => {
    const pA = a.split('.').map(Number);
    const pB = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pB[i] || 0) !== (pA[i] || 0)) return (pB[i] || 0) - (pA[i] || 0);
    }
    return 0;
  });

if (versions.length === 0) {
  console.log('[sync-installer] No release versions found.');
  process.exit(0);
}

const latestVersion = versions[0];
const versionDir = join(releaseDir, latestVersion);
const exeFiles = readdirSync(versionDir).filter(f => f.endsWith('.exe') && !f.includes('unpacked'));

if (exeFiles.length === 0) {
  console.log(`[sync-installer] No installer .exe found in ${versionDir}`);
  process.exit(0);
}

const sourceExe = join(versionDir, exeFiles[0]);
console.log(`[sync-installer] Syncing ${sourceExe} -> ${targetFile}`);
copyFileSync(sourceExe, targetFile);
const sizeMB = (statSync(targetFile).size / (1024 * 1024)).toFixed(2);
console.log(`[sync-installer] Jenga-Setup-Latest.exe ready (${sizeMB} MB)`);

// Keep public/version.json synchronized with the newly built version
const versionJsonPath = join(publicDir, 'version.json');
try {
  let manifest = {
    version: latestVersion,
    downloadUrl: '/Jenga-Setup-Latest.exe',
    releaseNotes: `Jenga POS v${latestVersion} release`,
    releaseDate: new Date().toISOString().split('T')[0]
  };

  if (existsSync(versionJsonPath)) {
    const raw = readFileSync(versionJsonPath, 'utf-8');
    manifest = {
      ...JSON.parse(raw),
      version: latestVersion,
      releaseDate: new Date().toISOString().split('T')[0]
    };
  }

  writeFileSync(versionJsonPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`[sync-installer] Synchronized public/version.json to version ${latestVersion}`);
} catch (vErr) {
  console.warn('[sync-installer] Could not update public/version.json:', vErr.message);
}
