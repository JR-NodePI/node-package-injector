#!/bin/bash

. "$(dirname "$0")/enable_node.sh"

FAKE_PACKAGE_VERSION=$1

cp package.json __mode_pi_package.json
npm version --no-git-tag-version "${FAKE_PACKAGE_VERSION}"
