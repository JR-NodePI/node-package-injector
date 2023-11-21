#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/helpers/package_json_bak.sh"

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

export NODE_PI_DEPENDENCY_NAMES=""
for dependency in "$@"; do
  NODE_PI_DEPENDENCY_NAMES+="'$dependency', "
done

echo ">>----------- ADD VITE SYNC ALIAS ----------<<"
echo "NODE_PI_FILE_PREFIX:      $NODE_PI_FILE_PREFIX"
echo "NODE_PI_DEPENDENCY_NAMES: $NODE_PI_DEPENDENCY_NAMES"
echo "VITE_CONFIG_FILE_NAME:    $VITE_CONFIG_FILE_NAME"
echo ">>------------------------------------------<<"
echo ""

mkdir -p "${NODE_PI_FILE_PREFIX}"

create_vite_config_for_sync_dependencies() {
  echo "
/* eslint-disable */
import path from 'path';
import config from '../$VITE_CONFIG_FILE_NAME';
const nodePiSyncModules = [$NODE_PI_DEPENDENCY_NAMES];
const syncAlias = nodePiSyncModules.map(dep => ({
  find: new RegExp(\`^"\$"{dep}([^/]+\\\\/index(.js|.ts)?)?(.*)\`),
  replacement: path.resolve(__dirname, \`"\$"{dep}"\$"3\`),
}));
config.resolve = {
  ...(config?.resolve ?? {}),
  alias: [...syncAlias, ...(config.resolve?.alias ?? [])],
};
export default config;
" >"${NODE_PI_FILE_PREFIX}/${VITE_CONFIG_FILE_NAME}"
}

replace_vite_config_file_in_package_json() {
  local PATTERN_SEC_1='(: *"([^&]+&&)? *vite)'                                               # find the vite section inside a package.json script
  local PATTERN_SEC_2='((.*)--config.*\.(js|ts|cjs))?'                                       # find the optional --config inside the vite section
  local PATTERN_SEC_3='(([^&]+&&)?[^"]*")'                                                   # find the end of the package.json script line
  local REPLACEMENT="\1 --config='.\/${NODE_PI_FILE_PREFIX}\/${VITE_CONFIG_FILE_NAME}' \4\6" # replacement for the vite section with the new vite config file
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' -E "s/${PATTERN_SEC_1}${PATTERN_SEC_2}${PATTERN_SEC_3}/${REPLACEMENT}/g" 'package.json'
  else
    sed -E -i "s/${PATTERN_SEC_1}${PATTERN_SEC_2}${PATTERN_SEC_3}/${REPLACEMENT}/g" 'package.json'
  fi
}

create_vite_config_for_sync_dependencies
replace_vite_config_file_in_package_json
