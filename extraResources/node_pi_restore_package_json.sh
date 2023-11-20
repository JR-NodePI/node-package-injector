#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/helpers/package_json_bak.sh"

if [ -f "$PACKAGE_JSON_BACKUP_FILE" ]; then
  mv -f $PACKAGE_JSON_BACKUP_FILE package.json
fi
