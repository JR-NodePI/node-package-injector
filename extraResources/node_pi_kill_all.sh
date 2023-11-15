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

getCommandPid() {
  if [[ "$(uname)" == "Darwin" ]]; then
    echo $(ps -A | grep -E -i "node.*$1" | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $1 }')
  else
    echo $(ps aux | grep -E -i "node.*$1" | grep -E -i -v $NODE_PI_PIDS_EXC | awk '{ print $2 }')
  fi
}

setScriptPids() {
  local scriptLine=$1
  echo -e "$scriptLine" | tr '&' '\n' | while read -r script; do
    if [[ -n "$script" ]]; then
      cleanScript=$(echo -e $script | sed -e 's/^[[:space:]]*//' | tr -d '"' | tr -d "'")
      PIDS=$(getCommandPid "$cleanScript")
      if [[ -n "$PIDS" ]]; then
        echo "$PIDS"
      fi
    fi
  done
}

for scriptLine in "$@"; do
  NODE_PIDS=$(setScriptPids "$scriptLine")
  if [[ -n "$NODE_PIDS" ]]; then
    echo ">> NodeJS scripts PIDs ----"
    for pid in $NODE_PIDS; do
      echo "kill PID: $pid"
      kill -SIGKILL $pid
      kill $pid
    done
  fi
done

echo ">>------------ KILL ALL FINISHED ---------<<"
echo ""
