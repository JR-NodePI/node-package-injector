const path = require('path');
const spawnSync = require('child_process').spawnSync;

const [
  ,
  ,
  NODE_PI_KILL_ALL_DEFER_COMMAND,
  NODE_PI_FILE_PREFIX,
  TARGET_PACKAGE_CWD,
  ...DEPENDENCIES_CWD_S
] = process.argv;

const buffer = spawnSync(
  'bash',
  [
    NODE_PI_KILL_ALL_DEFER_COMMAND,
    NODE_PI_FILE_PREFIX,
    TARGET_PACKAGE_CWD,
    ...DEPENDENCIES_CWD_S,
  ],
  {
    cwd: path.join(__dirname),
    env: process.env,
    shell: ['win32'].includes(process.platform) ? 'powershell' : true,
  }
);

// eslint-disable-next-line no-console
console.log('\n>>>----->> node_pi_kill_all_defer.js', {
  NODE_PI_KILL_ALL_DEFER_COMMAND,
  NODE_PI_FILE_PREFIX,
  TARGET_PACKAGE_CWD,
  DEPENDENCIES_CWD_S,
});

if (buffer.error) {
  // eslint-disable-next-line no-console
  console.error(buffer.error);
}

if (buffer.stderr) {
  // eslint-disable-next-line no-console
  console.error(buffer.stderr.toString());
}

if (buffer.stdout) {
  // eslint-disable-next-line no-console
  console.log(buffer.stdout.toString());
}
