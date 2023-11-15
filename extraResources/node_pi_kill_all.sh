#!/bin/bash
. "$(dirname "$0")/helpers/global.sh"

EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift

echo ">>------------ KILL ALL START ------------<<"

NODE_PI_PIDS_INC="node-package-injector.*$NODE_PI_FILE_PREFIX"
NODE_PI_PIDS_EXC="grep|node_pi_reset_all|node_pi_kill_all"

if [[ "$(uname)" == "Darwin" ]]; then
  NODE_PI_PIDS=$(ps -A | grep -E -i $NODE_PI_PIDS_INC | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $1 }')
else
  NODE_PI_PIDS=$(ps aux | grep -E -i $NODE_PI_PIDS_INC | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $2 }')
fi

if [[ -n "$NODE_PI_PIDS" ]]; then
  echo ">> NodePI direct PIDs ----"
  for pid in $NODE_PI_PIDS; do
    echo "kill PID: $pid"
    kill -SIGKILL $pid
    kill $pid
  done
fi

ALL_NODE_PIDS=()
getCommandPid() {
  if [[ "$(uname)" == "Darwin" ]]; then
    echo $(ps -A | grep -E -i "node.*$1" | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $1 }')
  else
    echo $(ps aux | grep -E -i "node.*$1" | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $2 }')
  fi
}

setScriptPids() {
  local scriptLine=$1
  INITIAL_IFS=$IFS
  IFS="&"
  local scripts=()
  read -a scripts <<<$scriptLine
  for script in ${scripts[@]}; do
    if [[ -n "$script" ]]; then
      cleanScript=$(echo -e $script | sed -e 's/^[[:space:]]*//' | tr -d '"' | tr -d "'")
      PIDS=$(getCommandPid "$cleanScript")
      if [[ -n "$PIDS" ]]; then
        echo "$cleanScript - PIDS: $PIDS"
        ALL_NODE_PIDS+=$PIDS
      fi
    fi
  done
  IFS=$INITIAL_IFS
}

for scriptLine in "$@"; do
  setScriptPids "$scriptLine"
done

if [[ -n "$ALL_NODE_PIDS" ]]; then
  echo ">> NodeJS scripts PIDs ----"
  for pid in $ALL_NODE_PIDS; do
    echo "kill PID: $pid"
    kill -SIGKILL $pid
    kill $pid
  done
fi

echo ">>------------ KILL ALL FINISHED ---------<<"
echo ""
