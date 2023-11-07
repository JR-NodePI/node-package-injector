#!/bin/bash

. "$(dirname "$0")/helpers/print_pid.sh"

NODE_PI_FILE_PREFIX=$1

mv -f ${NODE_PI_FILE_PREFIX}package.json package.json
