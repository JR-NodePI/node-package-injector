#!/bin/bash

set -e

SRC_DIR=$1
TARGET_DIR=$2

trap "echo -e \"\nExited!\"; exit;" SIGINT SIGTERM

if [[ -z "$SRC_DIR" ]]; then
  echo "missing \$1 <src-dir>"
  exit 1
fi

if [[ -z "$TARGET_DIR" ]]; then
  echo "missing \$2 <target-dir>"
  exit 1
fi

echo "Sincing:"
echo "SRC_DIR: $SRC_DIR"
echo "TARGET_DIR: $TARGET_DIR"

sync_dir() {
  rsync -avuh --delete "$SRC_DIR" "$TARGET_DIR"
}

watch_dir() {
  watch --chgexit -n 1 "ls --all -l --recursive --full-time ${SRC_DIR} | sha256sum" &>/dev/null
}

sync_dir

echo -e "\nWatching... ${SRC_DIR}\n"

while true; do
  watch_dir && sync_dir
  sleep 0.5
done
