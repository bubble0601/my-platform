require 'json'
require 'net/http'
require 'nokogiri'

module UtilityHelpers
  def get_response(url, headers = nil, limit = 10)
    raise ArgumentError, 'HTTP redirect too deep' if limit == 0
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    begin
      response = http.request_get(uri, headers || {})
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

  def get_doc(url, headers = nil)
    html = get_response(url, headers).body
    doc = Nokogiri::HTML.parse(html, nil, 'utf-8')
    doc
  end

  def get_json(url, headers = nil)
    JSON.parse(get_response(url, headers).body)
  end

  def async_exec
    raise ArgumentError unless block_given?
    begin
      Thread.new { yield }
    rescue => e
      p e
    end
  end

  def exec_command(cmd)
    cmd = cmd.map{|s| String === s ? s.shellescape : s[:no_escape] }.join(' ') if Array === cmd
    out = `#{cmd}`
    unless $?.success?
      logger.error "An error ocurred when execute `#{cmd}`"
      logger.error out
      # raise RuntimeError, "An error ocurred when execute `#{cmd}`"
      halt 500, 'An error ocurred when executing command'
    end
    return out
  end
end
