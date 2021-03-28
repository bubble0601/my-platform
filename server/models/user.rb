require 'bcrypt'

# Columns
#   id:         bigint, PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at: datetime
#   updated_at: datetime
#   name:       varchar(255), NOT NULL
#   password:   varchar(255), NOT NULL
class User < Sequel::Model(:users)
  def self.authenticate(username, password)
    user = self[name: username]
    return user if user && BCrypt::Password.new(user.password) == password
  end

  def initialize(username, password)
    super(name: username, password: password)
  end

  # passwordは72文字まで
  # https://qiita.com/fursich/items/54f8cba74ede96d0b689
  def validate
    super
    validates_presence %i[name password]
    validates_unique :name
    validates_length_range 8..72, :password
  end

  def after_validation
    super
    self.password = BCrypt::Password.create(password)
  end
end
