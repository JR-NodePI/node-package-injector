#!/bin/bash
. "$(dirname "$0")/helpers/global.sh"

EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift
TARGET_PACKAGE_CWD=$1
shift

echo ">>------------ RESET ALL START ------------<<"
echo "EXTRA_RESOURCES_DIR:  $EXTRA_RESOURCES_DIR"
echo "NODE_PI_FILE_PREFIX:  $NODE_PI_FILE_PREFIX"
echo "TARGET_PACKAGE_CWD:   $TARGET_PACKAGE_CWD"

cd $TARGET_PACKAGE_CWD &>/dev/null
bash ${EXTRA_RESOURCES_DIR}/node_pi_fake_pkg_version_restore.sh ${NODE_PI_FILE_PREFIX}
bash ${EXTRA_RESOURCES_DIR}/node_pi_vite_config_restore.sh ${NODE_PI_FILE_PREFIX}
bash ${EXTRA_RESOURCES_DIR}/node_pi_rsync_restore.sh ${NODE_PI_FILE_PREFIX}
bash ${EXTRA_RESOURCES_DIR}/node_pi_gitignore_reset.sh ${NODE_PI_FILE_PREFIX}
cd - &>/dev/null

for dependencyDir in "$@"; do
  cd $dependencyDir &>/dev/null
  echo "> Fake pkg version restore: $dependencyDir"
  bash ${EXTRA_RESOURCES_DIR}/node_pi_fake_pkg_version_restore.sh ${NODE_PI_FILE_PREFIX}
  cd - &>/dev/null
done

## kill all ----------------
NODE_PI_PIDS_INC='node-package-injector.*node_pi_'
NODE_PI_PIDS_EXC='grep|node_pi_reset_all'

if [[ "$(uname)" == "Darwin" ]]; then
  NODE_PI_PIDS=$(ps -A | grep -E -i $NODE_PI_PIDS_INC | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $1 }')
else
  NODE_PI_PIDS=$(ps aux | grep -E -i $NODE_PI_PIDS_INC | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $2 }')
fi

if [[ -n "$NODE_PI_PIDS" ]]; then
  NODE_PI_PIDS_LINE=$(echo "$NODE_PI_PIDS" | tr '\n' ' ')
  echo "kill NodePi PIDs: $NODE_PI_PIDS_LINE"
  kill -SIGKILL $NODE_PI_PIDS_LINE
  kill $NODE_PI_PIDS_LINE
fi

echo ">>------------ RESET ALL FINISHED ---------<<"
echo ""
