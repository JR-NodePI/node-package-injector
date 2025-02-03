#!/bin/bash

. "$(dirname "$0")/.nodepirc"

CURRENT_PID=$$
EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift
PACKAGES_CWD=("$@")

echo ">>>----->> node_pi_reset_kill_all.sh"
echo "CURRENT_PID:         $CURRENT_PID"
echo "EXTRA_RESOURCES_DIR: $EXTRA_RESOURCES_DIR"
echo "NODE_PI_FILE_PREFIX: $NODE_PI_FILE_PREFIX"

## ----------------------- reset all -----------------------
resetAll() {
  echo ""
  echo ">>------------ RESET ALL START ------------<<"

  echo "EXTRA_RESOURCES_DIR:  $EXTRA_RESOURCES_DIR"

  for dependencyDir in "${PACKAGES_CWD[@]}"; do
    cd $dependencyDir &>/dev/null
    echo "> Fake pkg version restore: $dependencyDir"
    bash ${EXTRA_RESOURCES_DIR}/node_pi_restore_package_json.sh ${NODE_PI_FILE_PREFIX}
    bash ${EXTRA_RESOURCES_DIR}/node_pi_rsync_restore.sh ${NODE_PI_FILE_PREFIX}
    bash ${EXTRA_RESOURCES_DIR}/node_pi_gitignore_reset.sh ${NODE_PI_FILE_PREFIX}
    cd - &>/dev/null
  done

  echo ">>------------ RESET ALL FINISHED ---------<<"
  echo ""
}
resetAll

## ----------------------- kill all -----------------------

killAll() {
  echo ""
  echo ">>------------- KILL ALL START ------------<<"

  local INITIAL_PIDS=$(read_initial_PIDs)
  local NODE_PI_PIDS_INC="NodePI|vite|craco|node|yarn|npm|pnpm|node-package-injector|$NODE_PI_FILE_PREFIX"
  local NODE_PI_PIDS_EXC_PARTS=(
    "grep"
    "node_pi_reset_kill_all"
    " ${CURRENT_PID} "
    ".vscode-server"
  )
  if [[ -n "$INITIAL_PIDS" ]]; then
    NODE_PI_PIDS_EXC_PARTS+=(" ${INITIAL_PIDS} ")
  fi

  local NODE_PI_PIDS_EXC=$(
    IFS='|'
    echo "${NODE_PI_PIDS_EXC_PARTS[*]}"
  )

  if [[ "$(uname)" == "Darwin" ]]; then
    local NODE_PI_PIDS=$(ps -A | grep -E -i "$NODE_PI_PIDS_INC" | grep -E -i -v "$NODE_PI_PIDS_EXC" | awk "{ print \$1 }")
  else
    local NODE_PI_PIDS=$(ps aux | grep -E -i "$NODE_PI_PIDS_INC" | grep -E -i -v "$NODE_PI_PIDS_EXC" | awk "{ print \$2 }")
  fi

  if [[ -n "$NODE_PI_PIDS" ]]; then
    for pid in $NODE_PI_PIDS; do
      echo ">>>> kill PID: $pid"
      kill -SIGKILL $pid &>/dev/null
      kill $pid &>/dev/null
    done
  fi

  echo ">>------------ KILL ALL FINISHED ----------<<"
  echo ""
}
killAll
