#!/bin/bash

. "$(dirname "$0")/helpers/enable_nvm_node.sh"
. "$(dirname "$0")/helpers/check_command.sh"

check_command "rsync"
check_command "shasum"
check_command "watch"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
YARN_VERSION=$(yarn -v)
PNPM_VERSION=$(pnpm -v)
NVM_VERSION=$(nvm -v)

echo "{
  \"nvm-bin\": \"$(command -v nvm)\",
  \"node-bin\": \"$(command -v node)\",
  \"npm-bin\": \"$(command -v npm)\",
  \"cwd\": \"$(pwd)\",
  \"node\": \"$NODE_VERSION\",
  \"npm\":  \"$NPM_VERSION\",
  \"yarn\":  \"$YARN_VERSION\",
  \"pnpm\":  \"$PNPM_VERSION\",
  \"nvm\":  \"$NVM_VERSION\"
}"
