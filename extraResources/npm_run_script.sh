#!/bin/bash

. "$(dirname "$0")/helpers/enable_nvm_node.sh"
. "$(dirname "$0")/helpers/print_pid.sh"

eval "$1"
