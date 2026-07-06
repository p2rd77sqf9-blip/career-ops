#!/usr/bin/env node
// Zero-install desktop launcher: serves index.html on localhost and opens it
// in a chromeless Chrome/Edge "app window" (falls back to default browser).
// Usage: node serve.mjs [extra chromium flags...]
// Override browser binary with CHROME_PATH=/path/to/chrome

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(dir, 'index.html'));

const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
});

server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  console.log(`datamosher running at ${url}  (Ctrl+C to quit)`);
  openAppWindow(url);
});

function findChromium() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  let candidates;
  if (process.platform === 'darwin') {
    candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ];
  } else if (process.platform === 'win32') {
    const roots = [
      process.env['PROGRAMFILES'],
      process.env['PROGRAMFILES(X86)'],
      process.env['LOCALAPPDATA'],
    ].filter(Boolean);
    candidates = roots.flatMap(r => [
      path.join(r, 'Google/Chrome/Application/chrome.exe'),
      path.join(r, 'Microsoft/Edge/Application/msedge.exe'),
      path.join(r, 'BraveSoftware/Brave-Browser/Application/brave.exe'),
    ]);
  } else {
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'brave-browser', 'microsoft-edge']) {
      try {
        return execFileSync('which', [name], { encoding: 'utf8' }).trim();
      } catch {}
    }
    return null;
  }
  return candidates.find(existsSync) || null;
}

function openAppWindow(url) {
  const chrome = findChromium();
  const extraFlags = process.argv.slice(2);
  if (chrome) {
    // --app gives a chromeless window that behaves like a desktop app
    const child = spawn(chrome, [`--app=${url}`, '--new-window', ...extraFlags], {
      stdio: 'ignore',
      detached: false,
    });
    child.on('exit', () => process.exit(0)); // closing the window quits the server
    child.on('error', () => openDefaultBrowser(url));
  } else {
    openDefaultBrowser(url);
  }
}

function openDefaultBrowser(url) {
  const cmd = process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : ['xdg-open', [url]];
  spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true }).on('error', () => {
    console.log('Could not open a browser automatically — open the URL above manually.');
  });
}
