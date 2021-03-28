# サーバセットアップ
## サーバについて
AmazonのLightsailを使用

## sshの設定
### /etc/ssh/sshd_configを編集
* PermitRootLogin, PasswordAuthenticationをnoに
* Port番号の変更

### SELinuxの設定
```
# semanage port -a -t ssh_port_t -p tcp <Port Number>
```

### 適用
```
# systemctl restart sshd
```
Lightsailのファイアウォールも設定を変える

## Timezoneの設定
```
# timedatectl set-timezone Asia/Tokyo
```

## swap領域の設定
デフォルトではスワップ領域は0になっているのでスワップ領域を確保する.
```
(1GBをスワップ領域として設定する)
# dd if=/dev/zero of=/swapfile bs=1M count=1024
# chmod 600 /swapfile
# mkswap /swapfile
# swapon /swapfile

(再起動時に自動設定する)
# vi /etc/fstab
(以下の行を追加)
/swapfile  swap   swap    defaults   0 0
```

## install
```
$ sudo yum install -y git
```

## pyenv
```
$ sudo yum install -y gcc zlib-devel bzip2 bzip2-devel readline readline-devel sqlite sqlite-devel openssl openssl-devel libffi-devel
$ git clone https://github.com/pyenv/pyenv.git ~/.pyenv
$ echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bash_profile
$ echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bash_profile
$ echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bash_profile
$ source ~/.bash_profile
$ pyenv install 3.*.*
$ pyenv global 3.*.*
```
