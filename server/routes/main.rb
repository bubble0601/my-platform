require 'rack/utils'
require 'json'

class MainApp
  helpers EnvironmentHelpers
  helpers NetworkHelpers
  helpers UtilityHelpers
  helpers ValidationHelpers

  namespace '/api' do
    helpers APIHelpers

    before do
      if request.content_type
        ctype = request.content_type.split(';')[0].downcase
        if %w[json javascript].any?{ |x| ctype.include?(x) }
          @json = request.body.read.parse_json
        end
      end

      content_type :json
      cache_control :no_cache
    end

    after do
      body body.to_json if content_type == mime_type(:json)
    end

    error 400...600 do
      if body.respond_to?(:empty?) && body.empty?
        message = Rack::Utils::HTTP_STATUS_CODES[status]
        { message: message }
      end
    end

    # CORS
    options '*' do
      200
    end
    after do
      if request.env['HTTP_ORIGIN']
        response.headers['Access-Control-Allow-Origin'] = request.env['HTTP_ORIGIN']
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRF-TOKEN'
        response.headers['Vary'] = 'Origin'
      end
    end
  end

  # Sinatra will check if a static file exists in public folder and serve it before checking for a matching route.
  not_found do
    return if request.path.start_with?('/api') || request.path.start_with?('/static')

    send_file './static/index.html'
  end

  error 500 do
    logger.error env['sinatra.error']&.message || '500 Internal server error'
    logger.error env.inspect
  end
end
