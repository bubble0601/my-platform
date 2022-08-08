require 'json'
require 'net/http'
require 'nokogiri'

module NetworkHelpers
  def get_response(uri, headers = nil, limit = 10)
    raise ArgumentError, 'HTTP redirect too deep' if limit.zero?

    uri = URI.parse(uri) if uri.is_a?(String)
    raise ArgumentError unless uri.is_a?(URI)

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    begin
      response = http.request_get(uri, headers || {})
      case response
      when Net::HTTPSuccess
        response
      when Net::HTTPRedirection
        location = response['location']
        logger.warn "redirected to #{location}"
        get_response(location, limit - 1)
      else
        logger.warn [uri.to_s, response.value].join("\n")
        raise Net::HTTPFatalError
      end
    rescue StandardError => e
      logger.warn [uri.to_s, e.class, e].join("\n")
      raise e
    end
  end

  def get_html(uri, headers = nil)
    html = get_response(uri, headers).body
    Nokogiri::HTML.parse(html, nil, 'utf-8')
  end

  def get_json(uri, headers = nil)
    JSON.parse(get_response(uri, headers).body)
  end
end
