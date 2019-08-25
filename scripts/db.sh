#!/bin/bash
function usage() {
  cat <<EOF
USAGE:
  $(basename $0) COMMAND [<options>]

COMMANDS:
  migrate           execute migration
  schema            dump schema
EOF
  exit 1
}

if [ $# -eq 0 ]; then
  usage
fi

readonly ROOT_PATH=$(cd $(dirname $0)/.. && pwd)

COMMAND=$1

case $COMMAND in
migrate)
  shift
  bundle exec sequel -e db $ROOT_PATH/conf.yml -m $ROOT_PATH/db/migrate -E "$@"
  ;;
schema) #dump schema
  shift
  bundle exec sequel -e db $ROOT_PATH/conf.yml -d "$@"
  ;;
*)
  usage
  ;;
esac
