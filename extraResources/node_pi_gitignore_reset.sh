#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"

NODE_PI_GIT_IGNORE_DELIMITER_INI="# >>>------ NodePi sync ------>>>"
NODE_PI_GIT_IGNORE_DELIMITER_END="# <<<------ NodePi sync ------<<<"

if [[ "$(uname)" == "Darwin" ]]; then
  sed -i.bak "/$NODE_PI_GIT_IGNORE_DELIMITER_INI/,/$NODE_PI_GIT_IGNORE_DELIMITER_END/d" .gitignore
  rm -f .gitignore.bak
else
  sed -i "/$NODE_PI_GIT_IGNORE_DELIMITER_INI/,/$NODE_PI_GIT_IGNORE_DELIMITER_END/d" .gitignore
fi
