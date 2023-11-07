#!/bin/bash

check_command() {
  local commandName=$1
  if ! command -v "${commandName}" &>/dev/null; then

    local exitcode=$?
    local installation="sudo apt-get install -y ${commandName}"

    if [[ "$(uname)" == "Darwin" ]]; then
      installation="brew install ${commandName}"
    fi

    printf '%s\n' "Error: ${commandName} command not found: ${installation}" 1>&2

    exit $exitcode
  fi
}
