require 'json'
require 'shellwords' # add String#shellescape method

class String
  def numeric?
    self =~ /\A[-+]?[0-9]*\.?[0-9]+\Z/
  end

  def no_shellescape
    @no_shellescape = true
  end

  def shellescape
    @no_shellescape ? self : Shellwords.shellescape(self)
  end

  def escape_filename
    gsub(%r{[\\/|:*?"<>]}, ' ').strip
  end

  def escape_like
    gsub(/[\\%_]/){ |m| "\\#{m}" }
  end

  def parse_json
    JSON.parse(self, symbolize_names: true)
  end
end
