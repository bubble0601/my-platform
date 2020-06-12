require 'English'
require 'date'
require 'fileutils'
require 'json'
require 'net/http'
require 'nokogiri'

module UtilityHelpers
  def get_response(url, headers = nil, limit = 10)
    raise ArgumentError, 'HTTP redirect too deep' if limit.zero?

    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    begin
      response = http.request_get(uri, headers || {})
      case response
      when Net::HTTPSuccess
        response
      when Net::HTTPRedirection
        location = response['location']
        warn "redirected to #{location}"
        get_response(location, limit - 1)
      else
        logger.warn('http'){ [uri.to_s, response.value].join("\n") }
        raise Net::HTTPFatalError
      end
    rescue StandardError => e
      logger.warn('http'){ [uri.to_s, e.class, e].join("\n") }
      raise e
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

    Thread.new{ yield }
  end

  def exec_command(cmd)
    cmd = cmd.map(&:shellescape).join(' ') if cmd.is_a?(Array)
    out = `#{cmd}`
    unless $CHILD_STATUS.success?
      logger.error "An error ocurred when execute `#{cmd}`"
      logger.error out
      raise "An error ocurred when execute `#{cmd}`"
    end
    out
  end

  def child_path?(parent, path)
    parent = File.absolute_path(parent)
    File.absolute_path(path).start_with?(parent)
  end
end
