#!/bin/bash
. "$(dirname "$0")/helpers/global.sh"

EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift
TARGET_PACKAGE_CWD=$1

echo "--------------------"
echo "extraResources/node_pi_kill_all.sh"
echo "EXTRA_RESOURCES_DIR:  $EXTRA_RESOURCES_DIR"
echo "NODE_PI_FILE_PREFIX:  $NODE_PI_FILE_PREFIX"
echo "TARGET_PACKAGE_CWD:   $TARGET_PACKAGE_CWD"

cd $TARGET_PACKAGE_CWD
bash ${EXTRA_RESOURCES_DIR}/node_pi_rsync_restore.sh ${NODE_PI_FILE_PREFIX}
cd -

for dir in "$@"; do
  echo "DEPENDENCY_PACKAGE_CWD: $dir"
  cd $dir &>/dev/null
  bash ${EXTRA_RESOURCES_DIR}/node_pi_fake_pkg_version_restore.sh ${NODE_PI_FILE_PREFIX} &>/dev/null
  cd - &>/dev/null
done
echo "--------------------"

## kill all ----------------

PIDS=$(ps -A | grep -E -i 'node-package-injector.*node_pi_' | grep -v grep | awk '{ print $1 }')

if [[ -n "$PIDS" ]]; then
  PIDS_LINE=$(echo "$PIDS" | tr '\n' ' ')
  echo "kill NodePi PIDs: $PIDS_LINE"
  kill -SIGKILL $PIDS_LINE
  kill $PIDS_LINE
  echo "--------------------"
fi
