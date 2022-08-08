require 'rbconfig'

module EnvironmentHelpers
  def os
    @os ||= begin
      host_os = RbConfig::CONFIG['host_os'].downcase
      case host_os
      when /mswin|msys|mingw|cygwin|bccwin|wince|emc/
        :windows
      when /darwin|mac os/
        :mac
      when /linux/
        :linux
      when /solaris|bsd/
        :unix
      else
        :unknown
      end
    end
  end
end
