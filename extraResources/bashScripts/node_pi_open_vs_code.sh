#!/bin/bash

. "$(dirname "$0")/.nodepirc"

open_vs_code() {
  if [[ "$(uname)" == "Darwin" ]]; then
    $(get_command "code") .
  else
    code .
  fi
}
open_vs_code
