#!/bin/bash

. "$(dirname "$0")/.nodepirc"

save_initial_PIDs

eval "$1"
