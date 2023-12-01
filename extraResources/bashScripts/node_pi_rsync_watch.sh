#!/bin/bash

. "$(dirname "$0")/.nodepirc"

NODE_PI_FILE_PREFIX=$1
TARGET_PACKAGE_DIR=$2
SRC_DEPENDENCY_DIR=$3

trap "echo -e \"\nExited!\"; exit;" SIGINT SIGTERM SIGKILL

if [[ -z "$SRC_DEPENDENCY_DIR" ]]; then
  echo "Error: missing \$1 <src-dir>"
  exit 1
fi

if [[ -z "$TARGET_PACKAGE_DIR" ]]; then
  echo "Error: missing \$2 <target-dir>"
  exit 1
fi

TARGET_SYNC_DEPENDENCY_DIR=$(echo "$TARGET_PACKAGE_DIR" | sed -e "s/\/\//\//g")

echo ">>----------- SYNCING ----------<<"
echo "SRC_DEPENDENCY_DIR: $SRC_DEPENDENCY_DIR"
echo "TARGET_SYNC_DEPENDENCY_DIR: $TARGET_SYNC_DEPENDENCY_DIR"

mkdir -p "$TARGET_SYNC_DEPENDENCY_DIR"

require_command "rsync"
require_command "watch"
require_command "shasum"

sync_dir() {
  $(get_command "rsync") -avuh --exclude="node_modules" --exclude=".git" --delete "$SRC_DEPENDENCY_DIR" "$TARGET_SYNC_DEPENDENCY_DIR"
}

watch_dir() {
  $(get_command "watch") --chgexit -n 1 "find ${SRC_DEPENDENCY_DIR} -ls -path '${SRC_DEPENDENCY_DIR}/.git' -prune -o -path '${SRC_DEPENDENCY_DIR}/node_modules' -prune | $(get_command "shasum") -a 256" &>/dev/null
}

sync_dir

echo -e "\nWatching... ${SRC_DEPENDENCY_DIR}\n"

while true; do
  watch_dir && sync_dir
  sleep 1
done
