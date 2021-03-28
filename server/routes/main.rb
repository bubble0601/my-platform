require 'json'

class MainApp
  helpers UtilityHelpers
  helpers ValidationHelpers

  namespace '/api' do
    helpers APIHelpers
    before do
      content_type :json
      cache_control :no_cache
      if request.content_type
        ctype = request.content_type.split(';')[0].downcase
        if %w[json javascript].any?{ |x| ctype.include?(x) }
          @json = request.body.read.parse_json
        end
      end
    end
    after do
      response.body = response.body.to_json
    end
    # options '*' do
    #   # CORS
    #   200
    # end
    # after do
    #   response.body = response.body.to_json

    #   # CORS
    #   response.headers['Access-Control-Allow-Origin'] = '*'
    #   response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    #   response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    # end
  end

  # Sinatra will check if a static file exists in public folder and serve it before checking for a matching route.
  not_found do
    if @is_api
      return
    elsif request.path.start_with?('/static')
      halt 404
    else
      send_file './static/index.html'
    end
  end

  error 500 do
    logger.info env.inspect
    logger.error env['sinatra.error']&.message || '500 Internal server error'
  end
end
