#!/bin/bash
function usage() {
  cat <<EOF
USAGE:
  $(basename $0) COMMAND [<options>]

COMMANDS:
  migrate [-M version]    execute migration
  schema                  dump schema
  pp <table name>         pp schema and copy to clipboard
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
pp)
  shift
  ruby $ROOT_PATH/scripts/pp_schema.rb "$@" | ghead -c -1 | pbcopy
  ;;
*)
  usage
  ;;
esac
