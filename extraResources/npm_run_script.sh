#!/bin/bash

. "$(dirname "$0")/enable_node.sh"
. "$(dirname "$0")/get_pid.sh"

eval "$1"
