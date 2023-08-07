#!/bin/bash

. "$(dirname "$0")/enable_node.sh"

args=$(getopt -o p:q:r: --long npm_command: -- "$@")
eval set -- "$args"

while true; do
  case "$1" in
  --npm_command)
    npm_command="$2"
    shift 2
    ;;
  --)
    shift
    break
    ;;
  *)
    echo "Error: invalid argument" >&2
    exit 1
    ;;
  esac
done

eval "$npm_command"
