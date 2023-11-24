#!/bin/bash

. "$(dirname "$0")/.nodepirc"

open_vs_code() {
  $(get_command "code") .
}
open_vs_code
