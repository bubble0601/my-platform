class MainApp < Sinatra::Base
  namespace '/api/auth' do
    helpers do
      # regenerate session for session fixation protection
      def regenerate_session
        data = session.to_hash
        session.destroy
        session.update(data)
      end
    end

    get '/init' do
      token = { token: session[:csrf] }
      if @user.nil?
        token
      else
        { user: @user.slice(:name) }.merge(token)
      end
    end

    post '/login' do
      # check if cookie is enabled
      halt 401, 'Please enable cookies' unless request.cookies.key?(CONF.session.name)
      @user = User.authenticate(@json[:username], @json[:password])
      halt 403, 'Invalid username or password' if @user.nil?
      regenerate_session
      session[:uid] = @user.id
      { user: @user.slice(:name) }
    end

    get '/logout' do
      session.delete :uid
      regenerate_session
      status 204
    end
  end
  namespace '/api/users' do
    post '' do
      # register
      validates @json, :username, :password
      begin
        @user = User.create_user(@json[:username], @json[:password])
      rescue RuntimeError
        halt 401, 'Invalid username or password'
      end
      status 204
    end
  end
end
