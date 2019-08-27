require 'shellwords'

class String
  def escape_filename
    self.gsub(/[\\\/|:*?"<>]/, ' ').strip
  end
  def escape_shell
    Shellwords.escape(self)
  end
end
