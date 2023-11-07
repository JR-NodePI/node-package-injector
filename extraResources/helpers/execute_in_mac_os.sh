#!/bin/bash

execute_in_mac_os() {
  if [[ "$(uname)" == "Darwin" ]]; then
    eval "$1"
  else
    eval "$2"
  fi
}
