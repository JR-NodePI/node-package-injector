#!/bin/bash

. "$(dirname "$0")/.nodepirc"
. "$(dirname "$0")/helpers/package_json_bak.sh"

export NODE_PI_FILE_PREFIX=$1
shift

if [ ! -f "package.json" ]; then
  echo "there is no package.json" >&2
  exit 1
fi

CRACO_CONFIG_FILE_NAME=""

if [ -f "craco.config.js" ]; then
  CRACO_CONFIG_FILE_NAME="craco.config.js"
elif [ -f "craco.config.ts" ]; then
  CRACO_CONFIG_FILE_NAME="craco.config.ts"
elif [ -f "craco.config.mjs" ]; then
  CRACO_CONFIG_FILE_NAME="craco.config.mjs"
elif [ -f "craco.config.cjs" ]; then
  CRACO_CONFIG_FILE_NAME="craco.config.cjs"
fi

if [ -z "$CRACO_CONFIG_FILE_NAME" ]; then
  echo "there is no craco config file" >&2
  exit 1
fi

export NODE_PI_DEPENDENCY_NAMES=""
for dependency in "$@"; do
  NODE_PI_DEPENDENCY_NAMES+="'$dependency', "
done

echo ">>----------- ADD CRACO SYNC ALIAS ----------<<"
echo "NODE_PI_FILE_PREFIX:      $NODE_PI_FILE_PREFIX"
echo "NODE_PI_DEPENDENCY_NAMES: $NODE_PI_DEPENDENCY_NAMES"
echo "CRACO_CONFIG_FILE_NAME:    $CRACO_CONFIG_FILE_NAME"
echo ">>------------------------------------------<<"
echo ""

mkdir -p "${NODE_PI_FILE_PREFIX}"

create_vite_config_for_sync_dependencies() {
  echo "
/* eslint-disable */
const path = require('path');
const craco = require('@craco/craco');
const config = require('../$CRACO_CONFIG_FILE_NAME');
const nodePiSyncModules = [$NODE_PI_DEPENDENCY_NAMES];


const packages = nodePiSyncModules.map(dep => path.resolve(__dirname, dep));

config.webpack = {
  ...(config?.webpack ?? {}),
  alias: {
    ...(config?.webpack?.alias ?? {}),
    ...Object.fromEntries(
      nodePiSyncModules.map(dep => [dep, path.resolve(__dirname, dep)])
    ),
  },
  configure: webpackConfig => {
    const { isFound, match } = craco.getLoader(
      webpackConfig,
      craco.loaderByName('babel-loader')
    );

    if (isFound) {
      const include = Array.isArray(match.loader.include)
        ? match.loader.include
        : [match.loader.include];
      match.loader.include = include.concat(packages);
    }

    return webpackConfig;
  },
};

module.exports = config;


" >"${NODE_PI_FILE_PREFIX}/${CRACO_CONFIG_FILE_NAME}"
}

replace_vite_config_file_in_package_json() {
  local PATTERN_SEC_1='(:.*craco.*start)'                                                   # find the vite section inside a package.json script
  local PATTERN_SEC_2="((.*)--config.*\.(js|ts|cjs) *'?)?"                                  # find the optional --config inside the vite section
  local PATTERN_SEC_3='(([^&]+&&)?[^"]*")'                                                  # find the end of the package.json script line
  local REPLACEMENT="\1 --config .\/${NODE_PI_FILE_PREFIX}\/${CRACO_CONFIG_FILE_NAME} \3\5" # replacement for the vite section with the new vite config file
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' -E "s/${PATTERN_SEC_1}${PATTERN_SEC_2}${PATTERN_SEC_3}/${REPLACEMENT}/g" 'package.json'
  else
    sed -E -i "s/${PATTERN_SEC_1}${PATTERN_SEC_2}${PATTERN_SEC_3}/${REPLACEMENT}/g" 'package.json'
  fi
}

export default config

create_vite_config_for_sync_dependencies
replace_vite_config_file_in_package_json
