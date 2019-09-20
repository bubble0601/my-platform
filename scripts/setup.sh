readonly ROOT_PATH=$(cd $(dirname $0)/.. && pwd)

mysql.server start
memcached -d
bundle install

# mysql user
# create user ibubble@'%' identified by 'password';
# grant all on ibubble.* to ibubble@'%';
