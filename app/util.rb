require 'shellwords' # add String#shellescape method

class String
  def escape_filename
    self.gsub(/[\\\/|:*?"<>]/, ' ').strip
  end
end
