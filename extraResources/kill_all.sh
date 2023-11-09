#!/bin/sh

# kill -9  $(ps -A | grep rsync_watch | grep -v grep | awk '{ print $1 }')

. "$(dirname "$0")/helpers/global.sh"

get_pids() {
  local commandId=$1
  ps -A | grep "node-package-injector" | grep $commandId | grep -v 'grep' | awk '{ print $1 }'
}

SYNC_PID=$(get_pids 'rsync_watch.sh')
if [[ -n "$SYNC_PID" ]]; then
  echo rsync_watch PIDs: $SYNC_PID
  kill -SIGKILL "$SYNC_PID"
  kill "$SYNC_PID"
fi
