class String
  def escape_filename
    self.gsub(/[\\\/|:*?"<>]/, ' ').strip
  end
  def escape_filename!
    self.replace(self.escape_filename)
  end
end
