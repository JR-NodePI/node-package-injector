#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/helpers/check_command.sh"

echo $(get_command "kevint")
eval "$1"
