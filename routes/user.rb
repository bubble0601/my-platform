class MainApp
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
      halt 401, 'Invalid username or password' if @user.nil?
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
    head '' do
      conditions = {}
      conditions[:name] = params[:username] if params[:username]
      user = User.select('id').where(conditions).first
      halt 404 if user.nil?
      status 200
    end

    post '' do
      validates_presence @json, :username, :password
      user = User.new(@json[:username], @json[:password])
      if user.valid?
        user.save
      else
        halt 400, { errors: user.errors }
      end
      status 201
    end
  end
end
