#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

VITE_CONFIG_FILE_NAME=""

if [ -f "vite.config.js" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.js"
elif [ -f "vite.config.mjs" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.mjs"
elif [ -f "vite.config.cjs" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.cjs"
fi

VITE_CONFIG_FILE_EXT="${VITE_CONFIG_FILE_NAME##*.}"

export NODE_PI_FILE_PREFIX=$1
shift

NODE_PI_FILE_NAME=".node-pi__vite.config.$VITE_CONFIG_FILE_EXT"

if [ -f "$NODE_PI_FILE_NAME" ]; then
  mv -f $NODE_PI_FILE_NAME $VITE_CONFIG_FILE_NAME
fi
