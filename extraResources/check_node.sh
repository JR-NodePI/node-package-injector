#!/bin/bash

. "$(dirname "$0")/enable_node.sh"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
YARN_VERSION=$(yarn -v)
PNPM_VERSION=$(pnpm -v)
NVM_VERSION=$(nvm -v)

echo "{
  \"cwd\": \"$(pwd)\",
  \"node\": \"$NODE_VERSION\",
  \"npm\":  \"$NPM_VERSION\",
  \"yarn\":  \"$YARN_VERSION\",
  \"pnpm\":  \"$PNPM_VERSION\",
  \"nvm\":  \"$NVM_VERSION\"
}"
