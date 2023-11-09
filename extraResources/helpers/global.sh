#!/bin/bash

set -e

if [[ "$(uname)" == "Darwin" ]]; then
  export TERM="xterm-256color"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

process_id=$$
echo "<<PID:$process_id>>"
