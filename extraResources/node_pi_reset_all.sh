#!/bin/bash
. "$(dirname "$0")/helpers/global.sh"

EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift
TARGET_PACKAGE_CWD=$1

echo ">>------------ RESET ALL START ------------<<"
echo "EXTRA_RESOURCES_DIR:  $EXTRA_RESOURCES_DIR"
echo "NODE_PI_FILE_PREFIX:  $NODE_PI_FILE_PREFIX"
echo "TARGET_PACKAGE_CWD:   $TARGET_PACKAGE_CWD"

cd $TARGET_PACKAGE_CWD &>/dev/null
echo "> Rsync restore: $TARGET_PACKAGE_CWD"
bash ${EXTRA_RESOURCES_DIR}/node_pi_rsync_restore.sh ${NODE_PI_FILE_PREFIX}
echo "----"
cd - &>/dev/null

for dir in "$@"; do
  cd $dir &>/dev/null
  echo "> Fake pkg version restore: $dir"
  bash ${EXTRA_RESOURCES_DIR}/node_pi_fake_pkg_version_restore.sh ${NODE_PI_FILE_PREFIX}
  echo "----"
  cd - &>/dev/null
done

## kill all ----------------
if [[ "$(uname)" == "Darwin" ]]; then
  PIDS=$(ps -A | grep -E -i 'node-package-injector.*node_pi_' | grep -v grep | awk '{ print $1 }')
else
  PIDS=$(ps aux | grep -E -i 'node-package-injector.*node_pi_' | grep -v grep | awk '{ print $2 }')
fi

if [[ -n "$PIDS" ]]; then
  PIDS_LINE=$(echo "$PIDS" | tr '\n' ' ')
  echo "kill NodePi PIDs: $PIDS_LINE"
  echo "----"
  kill -SIGKILL $PIDS_LINE
  kill $PIDS_LINE
fi

echo ">>------------ RESET ALL FINISHED ---------<<"
echo ""
