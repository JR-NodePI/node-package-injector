#!/bin/bash

NODE_PI_FILE_PREFIX=$1
PACKAGE_JSON_BACKUP_FILE="${NODE_PI_FILE_PREFIX}package.json.bak"

if [ -f "package.json" ] && [ ! -f "${PACKAGE_JSON_BACKUP_FILE}" ]; then
  cp "package.json" "${PACKAGE_JSON_BACKUP_FILE}"
fi
