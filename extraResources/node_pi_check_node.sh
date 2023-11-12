#!/bin/bash

. "$(dirname "$0")/helpers/global.sh"
. "$(dirname "$0")/helpers/check_command.sh"

check_command "rsync"
check_command "shasum"
check_command "watch"

get_version() {
  local commandName=$1
  local commandAlias=$(command -v "${commandName}")
  if [[ -n "${commandAlias}" ]]; then
    eval "$commandName -v"
  else
    echo ""
  fi
}

NODE_VERSION=$(get_version "node")
NPM_VERSION=$(get_version "npm")
YARN_VERSION=$(get_version "yarn")
PNPM_VERSION=$(get_version "pnpm")
NVM_VERSION=$(get_version "nvm")

echo "{
  \"cwd\": \"$(pwd)\",
  \"node\": \"$NODE_VERSION\",
  \"npm\":  \"$NPM_VERSION\",
  \"yarn\":  \"$YARN_VERSION\",
  \"pnpm\":  \"$PNPM_VERSION\",
  \"nvm\":  \"$NVM_VERSION\"
}"
