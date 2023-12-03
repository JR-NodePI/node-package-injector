#!/bin/bash

. "$(dirname "$0")/.nodepirc"

get_version() {
  local commandName=$1
  local command=$(get_command "${commandName}")
  if [[ -n "${command}" ]]; then
    eval "$command --version"
  else
    echo ""
  fi
}

NODE_VERSION=$(get_version "node")
NPM_VERSION=$(get_version "npm")
YARN_VERSION=$(get_version "yarn")
PNPM_VERSION=$(get_version "pnpm")
NVM_VERSION=$(get_version "nvm")

if [[ -z "$NODE_VERSION" ]]; then
  echo "Error: node is not installed"
  exit 1
fi

echo "{
  \"cwd\": \"$(pwd)\",
  \"node\": \"$NODE_VERSION\",
  \"npm\":  \"$NPM_VERSION\",
  \"yarn\":  \"$YARN_VERSION\",
  \"pnpm\":  \"$PNPM_VERSION\",
  \"nvm\":  \"$NVM_VERSION\"
}"
