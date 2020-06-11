require './app/init'
require 'minitest/autorun'
require 'rack/test'

ENV['RACK_ENV'] = 'test'

class TestBase < Minitest::Test
  include Rack::Test::Methods

  def app
    MainApp
  end

  def post_json(uri, data)
    post(uri, data.to_json, { 'CONTENT_TYPE' => 'application/json' })
  end

  def put_json(uri, data)
    put(uri, data.to_json, { 'CONTENT_TYPE' => 'application/json' })
  end

  def delete_json(uri, data)
    delete(uri, data.to_json, { 'CONTENT_TYPE' => 'application/json' })
  end

  def login
    post '/api/users/new', { username: 'name', password: 'password' }
    post '/api/auth/login', { username: 'name', password: 'password' }
  end

  def parse(response)
    JSON.parse(response.body, symbolize_names: true)
  end

  def run(*args, &block)
    DB.transaction(rollback: :always, auto_savepoint: true){ super }
  end
end
