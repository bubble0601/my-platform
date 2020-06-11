class MainApp < Sinatra::Base
  namespace '/api/setting' do
    get '/init' do
      {
        is_local: CONF.local.enabled,
      }
    end
  end
end
