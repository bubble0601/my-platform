readonly ROOT_PATH=$(cd $(dirname $0)/.. && pwd)

mysql.server start
memcached -d
bundle install
