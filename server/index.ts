// Minimal server that just runs vite for our static chemistry quiz app
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('Starting Chemistry Quiz static site with Vite...');

// Start vite dev server
const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: rootDir,
  stdio: 'inherit'
});

vite.on('error', (error) => {
  console.error('Failed to start vite:', error);
  process.exit(1);
});

vite.on('exit', (code) => {
  console.log(`Vite exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  vite.kill('SIGTERM');
});