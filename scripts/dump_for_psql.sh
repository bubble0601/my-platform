mysqldump -u DB_USER -p DB_NAME -t -c --skip-quote-names --skip-extended-insert --skip-add-locks --skip-comments --skip-disable-keys --skip-set-charset --skip-tz-utc --default-character-set=utf8 users artists albums songs playlists playlists_songs | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){16})0/\1false/g" | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){16})1/\1true/g" | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){12})0/\1false/g" | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){12})1/\1true/g" | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){11})0/\1false/g" | sed -E "s/^(INSERT INTO songs.*VALUES \((('([^']|\\\\')*'|[^,^']+),){11})1/\1true/g" | sed "s/\\\'/\'\'/g" > pg.sql