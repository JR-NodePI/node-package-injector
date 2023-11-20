#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

export NODE_PI_FILE_PREFIX=$1
shift

if [ ! -f "package.json" ]; then
  echo "there is no package.json" >&2
  exit 1
fi

VITE_CONFIG_FILE_NAME=""

if [ -f "vite.config.js" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.js"
elif [ -f "vite.config.mjs" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.mjs"
elif [ -f "vite.config.cjs" ]; then
  VITE_CONFIG_FILE_NAME="vite.config.cjs"
fi

if [ -z "$VITE_CONFIG_FILE_NAME" ]; then
  echo "there is no vite config file" >&2
  exit 1
fi

NODE_PI_VITE_FILE_NAME="${NODE_PI_FILE_PREFIX}${VITE_CONFIG_FILE_NAME}"

# && vite --open --host='portal.ipr.dev.redpoints.com' --port='8000'
# vite --config my-config.js

sed -E "s/(: *\"([^&]+&&)?.*vite.*)(--config[^.]+\.(js|ts|cjs)'?)([^&\"]+[&\"])/\1--config='.\/${NODE_PI_VITE_FILE_NAME}'\5/g" 'package.json'
sed -E "s/(: *\"([^&]+&&)?.*vite.*)([^&\"]+[&\"])/\1--config='.\/${NODE_PI_VITE_FILE_NAME}'\3/g" 'package.json'

exit 0
