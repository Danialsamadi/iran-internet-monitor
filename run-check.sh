#!/bin/bash
# Run the API checker (Go, parallel).
set -e
cd "$(dirname "$0")"
if [ -f ./checker ] && [ -x ./checker ]; then
  ./checker
elif command -v go &>/dev/null && [ -d ./check ]; then
  (cd check && go build -o ../checker .) && ./checker
else
  echo "Error: need Go (go build) or a pre-built ./checker" >&2
  exit 1
fi
