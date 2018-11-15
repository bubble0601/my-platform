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
