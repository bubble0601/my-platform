require 'json'

class MainApp < Sinatra::Base
  helpers ValidationHelpers

  namespace '/api' do
    helpers APIHelpers
    before do
      content_type :json
      cache_control :no_cache
      if request.content_type
        ctype = request.content_type.split(';')[0].downcase
        if ['json', 'javascript'].any?{|x| ctype.include?(x)}
          @json = JSON.parse(request.body.read, symbolize_names: true)
        end
      end
    end
    after do
      response.body = response.body.to_json
    end
  end

  # Sinatra will check if a static file exists in public folder and serve it before checking for a matching route.
  not_found do
    if @is_api
      halt 404, 'Not found'
    else
      send_file './static/index.html'
    end
  end
end
