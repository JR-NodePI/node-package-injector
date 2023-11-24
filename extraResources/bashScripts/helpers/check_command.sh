#!/bin/bash

get_command() {
  local commandName=$1
  local commandAlias=$(command -v "${commandName}")
  local commandLocalPath=$(command -v "/usr/local/bin/${commandName}")

  if [[ -n "${commandAlias}" ]]; then
    echo "${commandAlias}"
  elif [[ -n "${commandLocalPath}" ]]; then
    echo "${commandLocalPath}"
  else
    echo ""
  fi
}

require_command() {
  local commandName=$1

  local command=$(get_command "${commandName}")

  if [[ -z "${command}" ]]; then

    local exitcode=$?
    local installation="sudo apt-get install -y ${commandName}"

    if [[ "$(uname)" == "Darwin" ]]; then
      installation="brew install ${commandName}"
    fi

    echo "fatal: ${commandName} command not found -> ${installation}" 1>&2

    exit $exitcode
  fi
}
