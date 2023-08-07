#!/bin/bash

. "$(dirname "$0")/enable_node.sh"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
YAR_VERSION=$(yarn -v)

echo "{
  \"cwd\": \"$(pwd)\",
  \"node\": \"$NODE_VERSION\",
  \"npm\":  \"$NPM_VERSION\",
  \"yarn\":  \"$YAR_VERSION\"
}"
