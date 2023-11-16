#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

EXTRA_RESOURCES_DIR=$(dirname "$0")
NODE_PI_FILE_PREFIX=$1
shift

echo ">>------------ KILL ALL START ------------<<"

## ---- kill node open processes ----

getCleanScriptChunk() {
  echo -e $1 | sed -e 's/^[[:space:]]*//' | tr -d '"' | tr -d "'"
}

getNodeScriptChunkPids() {
  if [[ "$(uname)" == "Darwin" ]]; then
    ps -A | grep -E -i "node.*$1" | grep -v "grep" | grep -v "&&" | awk "{ print \$1 }"
  else
    ps aux | grep -E -i "node.*$1" | grep -v "grep" | grep -v "&&" | awk "{ print \$2 }"
  fi
}

getNodeScriptPids() {
  local script=$1
  echo -e "$script" | tr '&&' '\n' | while read -r scriptChunk; do
    if [[ -n "$scriptChunk" ]]; then
      cleanScriptChunk=$(getCleanScriptChunk "$scriptChunk")
      pids=$(getNodeScriptChunkPids "$cleanScriptChunk")
      if [[ -n "$pids" ]]; then
        echo -e "$pids"
      fi
    fi
  done
}

for script in "$@"; do
  nodePids=$(getNodeScriptPids "$script")
  if [[ -n "$nodePids" ]]; then
    echo ">> NodeJS script PIDs ---- $script"
    for pid in $nodePids; do
      echo "kill PID: $pid"
      kill -SIGKILL $pid &>/dev/null
      kill $pid &>/dev/null
    done
  fi
done

## ---- kill bash open processes ----

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
    kill -SIGKILL $pid &>/dev/null
    kill $pid &>/dev/null
  done
fi

echo ">>------------ KILL ALL FINISHED ---------<<"
echo ""
