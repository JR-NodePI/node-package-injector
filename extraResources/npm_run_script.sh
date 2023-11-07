#!/bin/bash

. "$(dirname "$0")/enable_node.sh"
. "$(dirname "$0")/get_pid.sh"
. "$(dirname "$0")/helpers/execute_string_command.sh"

eval "$1"
