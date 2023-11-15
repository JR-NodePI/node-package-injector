#!/bin/bash

set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if [[ "$(uname)" == "Darwin" ]]; then
  export TERM="xterm-256color"
fi

echo "<<BASH_PID:$$>>"
