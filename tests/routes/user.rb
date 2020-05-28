require_relative '../init'
require 'bcrypt'

class UserTest < TestBase
  def test_init
    get '/api/auth/init'
    assert last_response.ok?
    assert parse(last_response)[:token]
  end

  def test_register_and_login
    post_json '/api/users/new', { username: 'name', password: 'password' }
    assert last_response.status == 204
    user = User.first(name: 'name')
    assert user && user.created_at
    assert BCrypt::Password.new(user.password) == 'password'
    prev_cookie = rack_mock_session.cookie_jar.to_hash

    post_json '/api/auth/login', { username: 'name', password: 'password' }
    assert last_response.ok?
    assert parse(last_response)[:user][:name] == 'name'
    assert prev_cookie[CONF.session.name] != rack_mock_session.cookie_jar.to_hash[CONF.session.name]
  end
end
