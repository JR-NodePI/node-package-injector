#!/bin/bash

. "$(dirname "$0")/.nodepirc"
. "$(dirname "$0")/node_pi_gitignore_reset.sh"

echo $NODE_PI_GIT_IGNORE_DELIMITER_INI >>".gitignore"
for path in "$@"; do
  echo $path >>".gitignore"
done
echo $NODE_PI_GIT_IGNORE_DELIMITER_END >>".gitignore"
