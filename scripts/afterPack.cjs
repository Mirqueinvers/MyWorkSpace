const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const projectDir = path.resolve(__dirname, '..');
  const appOutDir = context.appOutDir;
  const exePath = path.join(appOutDir, 'MyWorkSpace.exe');
  const iconPath = path.join(projectDir, 'build', 'icon.ico');
  const rceditPath = path.join(
    projectDir,
    'node_modules',
    'electron-winstaller',
    'vendor',
    'rcedit.exe'
  );

  if (!fs.existsSync(exePath)) {
    throw new Error(`MyWorkSpace.exe not found at ${exePath}`);
  }

  if (!fs.existsSync(iconPath)) {
    throw new Error(`Icon file not found at ${iconPath}`);
  }

  if (!fs.existsSync(rceditPath)) {
    throw new Error(`rcedit not found at ${rceditPath}`);
  }

  const result = spawnSync(rceditPath, [exePath, '--set-icon', iconPath], {
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(
      `rcedit failed for ${exePath} with exit code ${result.status ?? 'unknown'}`
    );
  }
};
