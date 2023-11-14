#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/node_pi_vite_config_restore.sh"

if [ -z "$VITE_CONFIG_FILE_NAME" ]; then
  echo "there is no vite config file"
  exit 1
fi
if [ -z "$VITE_CONFIG_FILE_EXT" ]; then
  echo "there is no vite config file extension"
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
echo "VITE_CONFIG_FILE_EXT:     $VITE_CONFIG_FILE_EXT"
echo ">>------------------------------------------<<"
echo ""

mv -f "$VITE_CONFIG_FILE_NAME" ".node-pi__vite.config.$VITE_CONFIG_FILE_EXT"

echo "
/* eslint-disable */
import path from 'path';
import config from './.node-pi__vite.config';
const nodePiSyncModules = [$NODE_PI_DEPENDENCY_NAMES];
const syncAlias = nodePiSyncModules.map(dep => ({
  find: new RegExp(\`^"\$"{dep}([^/]+\\\\/index(.js)?)?(.*)\`),
  replacement: path.resolve(__dirname, \`$NODE_PI_FILE_PREFIX"\$"{dep}"\$"3\`),
}));
config.resolve = {
  ...(config?.resolve ?? {}),
  alias: [...syncAlias, ...(config.resolve?.alias ?? [])],
};
export default config;
" >$VITE_CONFIG_FILE_NAME
