#!/bin/bash

check_command() {
  local commandName=$1
  if ! command -v "${commandName}" &>/dev/null; then
    exitcode=$?
    printf '%s\n' "Error: ${commandName} command not found: " 1>&2
    if [[ "$(uname)" == "Darwin" ]]; then
      echo "brew install ${commandName}"
    else
      echo "sudo apt-get install -y ${commandName}"
    fi
    exit $exitcode
  fi
}
