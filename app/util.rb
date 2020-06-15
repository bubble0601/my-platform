require 'json'
require 'shellwords' # add String#shellescape method
require 'fileutils'

class String
  def numeric?
    self =~ /\A[-+]?[0-9]*\.?[0-9]+\Z/
  end

  def no_shellescape
    @no_shellescape = true
    self
  end

  def shellescape
    @no_shellescape ? self : Shellwords.shellescape(self)
  end

  def escape_filename(escape_char = '_')
    reserved_words_windows = %w[
      CON PRN AUX NUL
      COM1 COM2 COM3 COM4 COM5 COM6 COM7 COM8 COM9
      LPT1 LPT2 LPT3 LPT4 LPT5 LPT6 LPT7 LPT8 LPT9
    ]
    if reserved_words_windows.include?(File.basename(self, '.*').upcase)
      escaped = "#{escape_char}#{self}"
    else
      escaped = gsub(%r{[/\\?%*:|"<>]}, escape_char)
    end
    escaped.unicode_normalize(:nfc)
  end

  def escape_like
    gsub(/[\\%_]/){ |m| "\\#{m}" }
  end

  def parse_json
    JSON.parse(self, symbolize_names: true)
  end
end

module FileUtils
  module_function

  def mkdir_and_move(src, dist)
    dir = File.dirname(dist)
    FileUtils.makedirs(dir) unless Dir.exist?(dir)
    File.rename(src, dist)
  end
end
