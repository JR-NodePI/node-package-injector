#!/bin/bash

. "$(dirname "$0")/.nodepirc"
. "$(dirname "$0")/helpers/package_json_back.sh"

DEPENDENCY_NAME=$2
DEPENDENCY_DIST_DIR=$3
TARGET_PACKAGE_DIR=$4
TARGET_PACKAGE_MANAGER=$5

echo "> DEPENDENCY_NAME:          "$DEPENDENCY_NAME
echo "> DEPENDENCY_DIST_DIR:      "$DEPENDENCY_DIST_DIR
echo "> TARGET_PACKAGE_DIR:       "$TARGET_PACKAGE_DIR
echo "> TARGET_PACKAGE_MANAGER:   "$TARGET_PACKAGE_MANAGER

cd ${TARGET_PACKAGE_DIR}

npm pkg delete "dependencies.${DEPENDENCY_NAME}"
npm pkg delete "devDependencies.${DEPENDENCY_NAME}"
npm pkg delete "peerDependencies.${DEPENDENCY_NAME}"

if [[ "${TARGET_PACKAGE_MANAGER}" == "yarn" ]]; then
  yarn add "${DEPENDENCY_NAME}@file:${DEPENDENCY_DIST_DIR}"
elif [[ "${TARGET_PACKAGE_MANAGER}" == "pnpm" ]]; then
  pnpm add "${DEPENDENCY_NAME}@file:${DEPENDENCY_DIST_DIR}"
elif [[ "${TARGET_PACKAGE_MANAGER}" == "npm" ]]; then
  npm install --save "${DEPENDENCY_NAME}@file:${DEPENDENCY_DIST_DIR}"
fi
