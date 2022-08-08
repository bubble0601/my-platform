require 'date'
require 'fileutils'

require 'tempfile'

module UtilityHelpers
  def async_exec(&block)
    raise ArgumentError unless block_given?

    Thread.new(&block)
  end

  def exec_command(cmd)
    raise ArgumentError unless cmd.is_a?(String)

    logger.info("Execute command: #{cmd}")
    out = `#{cmd}`
    unless $CHILD_STATUS.success?
      logger.error "An error ocurred when executing `#{cmd}`"
      logger.error out
      raise "An error ocurred when executing `#{cmd}`"
    end
    out
  end

  def child_path?(parent, path)
    parent = File.absolute_path(parent)
    File.absolute_path(path).start_with?(parent)
  end
end
