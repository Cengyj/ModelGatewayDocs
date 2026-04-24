import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const docusaurusCli = require.resolve('@docusaurus/core/bin/docusaurus.mjs');
const port = process.env.PORT || '3000';

const child = spawn(
  process.execPath,
  [docusaurusCli, 'serve', '--host', '0.0.0.0', '--port', port, '--no-open'],
  {
    stdio: 'inherit',
    shell: false,
  },
);

child.on('exit', code => {
  process.exit(code ?? 0);
});
