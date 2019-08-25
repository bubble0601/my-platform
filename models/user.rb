require 'bcrypt'

# passwordは72文字まで
# https://qiita.com/fursich/items/54f8cba74ede96d0b689
class User < Sequel::Model(:users)
  def self.authenticate(username, password)
    user = self[name: username]
    if user && BCrypt::Password.new(user.password) == password
      user
    else
      nil
    end
  end

  def self.create_user(username, password)
    raise 'Invalid password length' if password.length < 8 or password.length > 72
    create(name: username, password: BCrypt::Password.create(password))
  end

  def update_password(password)
    update(password: BCrypt::Password.create(password))
  end
end
