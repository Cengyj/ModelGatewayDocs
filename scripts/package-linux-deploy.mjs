import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const projectName = path.basename(projectRoot);
const parentDir = path.dirname(projectRoot);

const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('') + '-' + [
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0'),
].join('');

const archiveName = `${projectName}-linux-deploy-${timestamp}.tar.gz`;
const archivePath = path.join(projectRoot, archiveName);

const requiredPaths = [
  'package.json',
  'pnpm-lock.yaml',
  'Dockerfile',
  'compose.yaml',
  'nginx.conf',
  'docs',
  'src',
  'static',
  'scripts',
];

for (const relativePath of requiredPaths) {
  if (!existsSync(path.join(projectRoot, relativePath))) {
    console.error(`Missing required path: ${relativePath}`);
    process.exit(1);
  }
}

const tarArgs = [
  '-czf',
  archivePath,
  `--exclude=${projectName}/node_modules`,
  `--exclude=${projectName}/build`,
  `--exclude=${projectName}/.docusaurus`,
  `--exclude=${projectName}/.sisyphus`,
  `--exclude=${projectName}/.git`,
  `--exclude=${projectName}/serve.log`,
  `--exclude=${projectName}/*.log`,
  '-C',
  parentDir,
  projectName,
];

const result = spawnSync('tar', tarArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error('Failed to run tar. Please ensure tar is installed and available in PATH.');
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Created deploy archive: ${archivePath}`);
