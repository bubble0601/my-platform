require 'pycall/import'
include PyCall::Import
module PyMP3
  pyfrom 'mutagen.id3', import: [:ID3, :Encoding, :Frame, :Frames, :PictureType]
  pyfrom 'mutagen.mp3', import: [:MP3]
end

class MP3
  def initialize(filename)
    @filename = filename
    @mp3 = PyMP3::MP3.new(filename)
  end

  def tags
    @tags = ID3.new(@filename) unless @tags
    @tags
  end

  def length
    @mp3.info.length
  end

  def methods_missing(name, *args)
    @mp3.method(name).call(*args)
  end
end

class ID3
  KEYS = {}
  TAGS = {}

  def self.registerKey(key, tag, getter, setter, deleter = nil)
    unless deleter
      deleter = Proc.new do |id3|
        id3.delall(tag)
      end
    end
    KEYS[key] = tag
    TAGS[tag] = {
      get: getter,
      set: setter,
      del: deleter,
    }
  end

  def self.registerTextKey(key, tag)
    get = Proc.new do |id3|
      values = id3.getall(tag)
      if values.length == 0
        nil
      elsif values.length == 1
        values[0].text[0].to_s
      else
        raise
      end
    end
    set = Proc.new do |id3, value|
      if value.kind_of?(PyMP3::Frame)
        value.encoding = PyMP3::Encoding.UTF8
        id3.setall(tag, [value])
      else
        id3.setall(tag, [PyMP3::Frames[tag].new(encoding: PyMP3::Encoding.UTF8, text: [value])])
      end
    end
    del = Proc.new do |id3|
      id3.delall(tag)
    end
    KEYS[key] = tag
    TAGS[tag] = {
      get: get,
      set: set,
      del: del,
    }
  end

  def initialize(filename)
    @id3 = PyMP3::ID3.new(filename)
  end

  def get_all(convert = false)
    return @id3.items.to_h unless convert
    @id3.items.to_h.transform_keys{|k| k[0...4]}.map{|k, v| TAGS[k] ? [k, TAGS[k][:get].call(@id3)] : [k, v]}.to_h
  end

  def each
    if block_given?
      get_all(true).to_enum.each{|*args| yield(*args)}
    end
    get_all(true).to_enum
  end

  def delete_tag(tag)
    @id3.delall(tag)
  end

  def to_utf8
    get_all.each do |key, value|
      begin
        next if (not value.respond_to?('encoding')) || value.encoding == PyMP3::Encoding.UTF8
        tag = key[0...4]
        if TAGS[tag]
          TAGS[tag][:set].call(@id3, value)
        else
          values = @id3.getall(tag)
          values =  values.map{ |v| v.encoding = PyMP3::Encoding.UTF8; v }
          @id3.setall(tag, values)
        end
      rescue => e
        p key, value
        raise e
      end
    end
    @id3
  end

  def [](key)
    if TAGS[key]
      TAGS[key][:get].call(@id3)
    else
      method_missing(:[], key)
    end
  end

  def []=(key, value)
    p key, value
    if TAGS[key]
      if value
        TAGS[key][:set].call(@id3, value)
      else
        TAGS[key][:del].call(@id3)
      end
    elsif key.length === 4 && value == nil
      p @id3
      @id3.delall(key)
      p @id3
    else
      method_missing(:[]=, key, value)
    end
  end

  def method_missing(name, *args)
    mode = :get
    key = name.to_sym
    if name[-1] == '='
      mode = :set
      mode = :del unless args[0]
      key = name[0...-1].to_sym
    end
    if tag = KEYS[key]
      TAGS[tag][mode].call(@id3, *args)
    else
      @id3.method(name).call(*args)
    end
  end
end

{
  title: 'TIT2',
  album: 'TALB',
  artist: 'TPE1',
  album_artist: 'TPE2',
  album_artist_sort: 'TSO2',  # iTunes extension
  track: 'TRCK',
  disc: 'TPOS',
  year: 'TDRC',
}.each do |key, tag|
  ID3.registerTextKey(key, tag)
end

def lyrics_set(id3, value)
  if value.kind_of?(PyMP3::Frame)
    value.encoding = PyMP3::Encoding.UTF8
    id3.setall('USLT', [value])
  else
    lang = nil
    text = value
    if value.is_a?(Hash)
      lang = value[:lang]
      text = value[:text]
    end
    unless lang
      lang = 'eng'
      lang = 'jpn' if /[亜-熙ぁ-んァ-ヶ]/.match?(value)
    end
    id3.setall('USLT', [PyMP3::Frames['USLT'].new(encoding: PyMP3::Encoding.UTF8, lang: lang, text: value)])
  end
end

ID3.registerKey(:lyrics, 'USLT', ->(id3){id3.getall('USLT')[0].text}, method(:lyrics_set))

def picture_get(id3)
  id3.getall('APIC').map do |apic|
    def apic.inspect
      "APIC(encoding=#{self.encoding.__repr__}, mime='#{self.mime}', type=#{self.type.__repr__}, desc='#{self.desc}', data=<#{self.data.length} bytes>)"
    end
    apic
  end
end

def picture_set(id3, value)
  if value.kind_of?(PyMP3::Frames['APIC'])
    value.encoding = PyMP3::Encoding.UTF8
    value.type = PyMP3::PictureType.COVER_FRONT
    id3.setall('APIC', [value])
  else
    apic = PyMP3::Frames['APIC'].new(encoding: PyMP3::Encoding.UTF8, mime: value[:mime], type: PyMP3::PictureType.COVER_FRONT, data: value[:data])
    id3.setall('APIC', [apic])
  end
end

ID3.registerKey(:picture, 'APIC', method(:picture_get), method(:picture_set))
