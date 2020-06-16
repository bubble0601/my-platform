require_relative 'audio'

module ID3
  include AudioTags
  class << self
    def to_text_frame(tag, value)
      case value
      when Mutagen::Frame
        value.encoding ||= Mutagen::Encoding.UTF8
        value
      when String
        Mutagen::Frames[tag].new(encoding: Mutagen::Encoding.UTF8, text: [value])
      when nil
        nil
      else
        raise ArgumentError
      end
    end

    def define_text_tags(**tags)
      tags.each do |key, tag|
        # get
        define_method(key) do
          self[tag].to_s
        rescue PyCall::PyError
          nil
        end
        # set/del
        define_method(:"#{key}=") do |value|
          frame = ID3.to_text_frame(tag, value)
          if frame
            setall(tag, [frame])
          else
            delall(tag)
          end
        end
      end
    end
  end

  def v2_version
    version[0] == 2 ? version[1] : nil
  end

  def convert_to_utf8
    each do |tag, frame|
      next unless frame.respond_to?(:encoding)
      next if frame.encoding == Mutagen::Encoding.UTF8

      frame.encoding = Mutagen::Encoding.UTF8
      self[tag] = frame
    end
  end

  def delete(key)
    delall(key)
  end

  def type
    case version[0]
    when 1
      'ID3v1'
    when 2
      "ID3v2.#{version[1]}"
    end
  end

  define_text_tags  title: 'TIT2',
                    artist: 'TPE1',
                    artist_sort: 'TSOP',
                    album: 'TALB',
                    album_artist: 'TPE2',
                    album_artist_sort: 'TSO2', # iTunes extension
                    track: 'TRCK',
                    disc: 'TPOS',
                    genre: 'TCON'

  def year_frame_id
    case v2_version
    when 4 then 'TDRC'
    when 3 then 'TYER'
    else raise NotImplementedError
    end
  end

  def year
    begin
      self[year_frame_id].to_s
    rescue PyCall::PyError
      another = year_frame_id == 'TDRC' ? 'TYER' : 'TDRC'
      self[another].to_s
    end
  rescue PyCall::PyError
    nil
  end

  def year=(value)
    frame = ID3.to_text_frame(year_frame_id, value)
    if frame
      setall(year_frame_id, [frame])
    else
      delall(year_frame_id)
    end
  end

  def guess_lang(text)
    return 'jpn' if /[亜-熙ぁ-んァ-ヶ]/.match?(text)

    'eng'
  end

  def lyrics
    getall('USLT')[0].to_s
  rescue PyCall::PyError
    nil
  end

  def lyrics=(value)
    if value.nil?
      delall('USLT')
      return
    end

    case value
    when Mutagen::Frames::USLT
      value.encoding ||= Mutagen::Encoding.UTF8
      frame = value
    when Hash
      lang = value[:lang] || guess_lang(value[:text])
      frame = Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: lang, text: value[:text])
    when String
      lang = guess_lang(value)
      frame = Mutagen::Frames::USLT.new(encoding: Mutagen::Encoding.UTF8, lang: lang, text: value)
    else
      raise ArgumentError
    end
    setall('USLT', [frame])
  end

  def picture
    pic = getall('APIC')[0]
    pyblt = PyCall.builtins
    if pyblt.type(pic.mime) == pyblt.bytes
      pic.mime = pic.mime.decode('utf-8')
    end
    {
      mime: pic.mime,
      data: pic.data,
    }
  rescue PyCall::PyError
    nil
  end

  def picture=(value)
    if value.nil?
      delall('APIC')
      return
    end

    case value
    when Mutagen::Frames::APIC
      value.encoding ||= Mutagen::Encoding.UTF8
      value.type ||= Mutagen::PictureType.COVER_FRONT
      frame = value
    when Hash
      frame = Mutagen::Frames::APIC.new(
        encoding: Mutagen::Encoding.UTF8,
        mime: '' + value[:mime],  # なぜかこうしないとbytes型に変換されてしまう
        type: Mutagen::PictureType.COVER_FRONT,
        desc: 'Cover',
        data: value[:data]
      )
    else
      raise ArgumentError
    end
    setall('APIC', [frame])
  end
end

class MP3 < Audio
  def initialize(path)
    @path = path
    @audio = Mutagen::MP3.new(path)
    @tags = @audio.tags
    return unless @tags

    @tags.extend ID3
    raise NotImplementedError unless @tags.v2_version
  end

  def add_tags
    @audio.add_tags(Mutagen::ID3)
    @tags = @audio.tags
    @tags.extend ID3
  end

  def codec_info
    encode_info = info.bitrate_mode.to_s.split('.')[-1]
    if info.bitrate_mode == Mutagen::BitrateMode.UNKNOWN
      encode_info = 'CBR?'
    end
    # encode_info += ", #{info.encoder_info}" if info.encoder_info
    # encode_info += ", #{info.encoder_settings}" if info.encoder_settings
    "MPEG #{info.version} layer #{info.layer} / #{encode_info}"
  end
end
