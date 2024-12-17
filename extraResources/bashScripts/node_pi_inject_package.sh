#!/bin/bash

. "$(dirname "$0")/.nodepirc"
. "$(dirname "$0")/helpers/package_json_bak.sh"

DEPENDENCY_NAME=$2
DEPENDENCY_DIST_DIR=$3
TARGET_PACKAGE_DIR=$4

echo "> DEPENDENCY_NAME:          "$DEPENDENCY_NAME
echo "> DEPENDENCY_DIST_DIR:      "$DEPENDENCY_DIST_DIR
echo "> TARGET_PACKAGE_DIR:       "$TARGET_PACKAGE_DIR

cd ${TARGET_PACKAGE_DIR}

yarn add "${DEPENDENCY_NAME}@file:${DEPENDENCY_DIST_DIR}"

# rm -r -f ${TMP_DEPENDENCY_DIR}

# mkdir ${TMP_DEPENDENCY_DIR}
#
# tar -xzf ${DEPENDENCY_DIST_DIR} -C ${TMP_DEPENDENCY_DIR}
#
# rm -r -f ${TARGET_PACKAGE_DIR}
#
# mkdir ${TARGET_PACKAGE_DIR}
#
# mv ${TMP_DEPENDENCY_DIR}/package/* ${TARGET_PACKAGE_DIR}
#
# rm -r -f ${TMP_DEPENDENCY_DIR}
