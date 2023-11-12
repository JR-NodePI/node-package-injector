#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

NODE_PI_FILE_PREFIX=$1
FAKE_PACKAGE_VERSION=$2

cp package.json ${NODE_PI_FILE_PREFIX}package.json
npm version --no-git-tag-version "${FAKE_PACKAGE_VERSION}"
