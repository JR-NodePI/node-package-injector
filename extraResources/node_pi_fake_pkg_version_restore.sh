#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

NODE_PI_FILE_PREFIX=$1
NODE_PI_FILE_NAME=${NODE_PI_FILE_PREFIX}package.json

if [ -f "$NODE_PI_FILE_NAME" ]; then
  mv -f $NODE_PI_FILE_NAME package.json
fi
