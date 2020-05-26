require 'nokogiri'
require 'net/http'

module UtilityHelpers
  def get_doc(url)
    uri = URI.parse(url)
    html = Net::HTTP.get_response(uri).body
    doc = Nokogiri::HTML.parse(html, nil, 'utf-8')
    doc
  end
end
