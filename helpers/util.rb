require 'net/http'
require 'nokogiri'

module UtilityHelpers
  def get_response(url, limit = 10)
    raise ArgumentError, 'HTTP redirect too deep' if limit == 0
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    begin
      response = http.request_get(uri, { 'User-Agent' => "#{CONF.app.name rescue 'xxx'}/1.0.0" })
      case response
      when Net::HTTPSuccess
        return response
      when Net::HTTPRedirection
        location = response['location']
        warn "redirected to #{location}"
        return get_response(location, limit - 1)
      else
        puts [uri.to_s, response.value].join("\n")
      end
    rescue => e
      puts [uri.to_s, e.class, e].join("\n")
    end
  end

  def get_doc(url)
    html = get_response(url).body
    doc = Nokogiri::HTML.parse(html, nil, 'utf-8')
    doc
  end

  def get_json(url)
    JSON.parse(get_response(url).body)
  end
end
