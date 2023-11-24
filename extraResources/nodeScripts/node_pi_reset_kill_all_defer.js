const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });

// new logs file -----
const logBuffer = [];
const logFile = path.join(logsDir, `node_pi_reset_kill_all_defer.logs`);

const spawnSync = require('child_process').spawnSync;

const [
  ,
  ,
  NODE_PI_RESET_KILL_ALL_BASH_FILE,
  NODE_PI_FILE_PREFIX,
  TARGET_PACKAGE_CWD,
  ...DEPENDENCIES_CWD_S
] = process.argv;

logBuffer.push(new Date(Date.now()).toLocaleString());
logBuffer.push('\n>>>----->> node_pi_reset_kill_all_defer.js');
logBuffer.push(
  JSON.stringify(
    {
      NODE_PI_RESET_KILL_ALL_BASH_FILE,
      NODE_PI_FILE_PREFIX,
      TARGET_PACKAGE_CWD,
      DEPENDENCIES_CWD_S,
    },
    null,
    2
  )
);

const buffer = spawnSync(
  'bash',
  [
    NODE_PI_RESET_KILL_ALL_BASH_FILE,
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

if (buffer.error) {
  logBuffer.push(JSON.stringify(buffer.error));
}

if (buffer.stderr) {
  logBuffer.push(buffer.stderr.toString());
}

if (buffer.stdout) {
  logBuffer.push(buffer.stdout.toString());
}

fs.writeFileSync(logFile, logBuffer.join('\n'), 'utf8');
