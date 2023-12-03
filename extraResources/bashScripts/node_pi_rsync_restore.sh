#!/bin/bash

. "$(dirname "$0")/.nodepirc"

NODE_PI_FILE_PREFIX=$1

rm -rf ${NODE_PI_FILE_PREFIX}*/
