require_relative 'audio'

# aac has promblems with duration detection in browser(both audio element and music-metadata-browser)

class AAC < Audio
  include AudioTags
  def initialize(path)
    @path = path
    @audio = Mutagen::AAC.new(path)
    begin
      @tags = Mutagen::ID3.new(path)
    rescue PyCall::PyError
      @tags = nil
    end
    return unless @tags

    @tags.extend ID3
  end

  def add_tags
    @tags = Mutagen::ID3.new
    @tags.extend ID3
    orig_save = @tags.method(:save)
    @tags.define_singleton_method(:save) do |path|
      orig_save.call(path)
    end
  end

  def codec_info
    "AAC (#{info._type})"
  end
end
