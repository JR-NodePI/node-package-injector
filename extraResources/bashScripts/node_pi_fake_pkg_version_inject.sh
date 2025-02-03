#!/bin/bash

. "$(dirname "$0")/.nodepirc"
. "$(dirname "$0")/helpers/package_json_back.sh"

NODE_PI_FILE_PREFIX=$1
FAKE_PACKAGE_VERSION=$2

npm version --no-git-tag-version "${FAKE_PACKAGE_VERSION}"
