#!/bin/bash

. "$(dirname "$0")/helpers/enable_nvm_node.sh"
. "$(dirname "$0")/helpers/print_pid.sh"
. "$(dirname "$0")/helpers/check_command.sh"
. "$(dirname "$0")/helpers/execute_in_mac_os.sh"

SRC_DIR=$1
TARGET_DIR=$2

trap "echo -e \"\nExited!\"; exit;" SIGINT SIGTERM SIGKILL

if [[ -z "$SRC_DIR" ]]; then
  echo "Error: missing \$1 <src-dir>"
  exit 1
fi

if [[ -z "$TARGET_DIR" ]]; then
  echo "Error: missing \$2 <target-dir>"
  exit 1
fi

echo "Syncing:"
echo "SRC_DIR: $SRC_DIR"
echo "TARGET_DIR: $TARGET_DIR"

check_command "rsync"
check_command "watch"
check_command "shasum"

sync_dir() {
  $(get_command "rsync") -avuh --exclude="node_modules" --exclude=".git" --delete "$SRC_DIR" "$TARGET_DIR"
}

watch_dir() {
  # local macOsLs="ls -alR -T ${SRC_DIR} | grep -v \"node_modules\" | grep -v \".git\""
  # local linuxLs="ls --all -l --recursive --full-time ${SRC_DIR}"
  # $(get_command "watch") --chgexit -n 1 "execute_in_mac_os "$macOsLs" "$linuxLs" | $(get_command "shasum") -a 256" &>/dev/null

  $(get_command "watch") --chgexit -n 1 "find ${SRC_DIR} -ls -path '${SRC_DIR}/.git' -prune -o -path '${SRC_DIR}/node_modules' -prune | $(get_command "shasum") -a 256" &>/dev/null
}

sync_dir

echo -e "\nWatching... ${SRC_DIR}\n"

while true; do
  watch_dir && sync_dir
  sleep 1
done
