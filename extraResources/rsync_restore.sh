#!/bin/sh

. "$(dirname "$0")/get_pid.sh"

NODE_PI_FILE_PREFIX=$1

rm -rf ${NODE_PI_FILE_PREFIX}*/
