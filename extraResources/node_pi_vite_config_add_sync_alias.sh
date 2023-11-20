#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/node_pi_vite_config_restore.sh"

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

echo "
/* eslint-disable */
import path from 'path';
import config from './$VITE_CONFIG_FILE_NAME';
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
" >$NODE_PI_VITE_FILE_NAME
