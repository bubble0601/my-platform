require 'pycall/import'

module PyMP3
  extend PyCall::Import
  pyfrom 'mutagen.id3', import: %i[ID3 Encoding Frame Frames PictureType ID3FileType]
  pyfrom 'mutagen.mp3', import: [:MP3]
end

class MP3
  def initialize(filename)
    @filename = filename
    @mp3 = PyMP3::MP3.new(filename)
  end

  def tags
    @tags ||= ID3.new(@filename)
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
  @keys = {}
  @tags = {}

  def self.register_key(key, tag, getter, setter, deleter = nil)
    deleter ||= proc do |id3|
      id3.delall(tag)
    end
    @keys[key] = tag
    @tags[tag] = {
      get: getter,
      set: setter,
      del: deleter,
    }
  end

  def self.register_text_key(key, tag)
    get = proc do |id3|
      values = id3.getall(tag)
      if values.empty?
        nil
      elsif values.length == 1
        values[0].text[0].to_s
      else
        raise
      end
    end
    set = proc do |id3, value|
      if value.is_a?(PyMP3::Frame)
        value.encoding = PyMP3::Encoding.UTF8
        id3.setall(tag, [value])
      else
        id3.setall(tag, [PyMP3::Frames[tag].new(encoding: PyMP3::Encoding.UTF8, text: [value])])
      end
    end
    del = proc do |id3|
      id3.delall(tag)
    end
    @keys[key] = tag
    @tags[tag] = {
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

    @id3.items.to_h.transform_keys{ |k| k[0...4] }.map{ |k, v| @tags[k] ? [k, @tags[k][:get].call(@id3)] : [k, v] }.to_h
  end

  def each
    get_all(true).to_enum.each{ |*args| yield(*args) } if block_given?
    get_all(true).to_enum
  end

  def delete_tag(tag)
    @id3.delall(tag)
  end

  def to_utf8
    get_all.each do |key, value|
      next if !value.respond_to?('encoding') || value.encoding == PyMP3::Encoding.UTF8

      tag = key[0...4]
      if @tags[tag]
        @tags[tag][:set].call(@id3, value)
      else
        values = @id3.getall(tag)
        values = values.map{ |v| v.encoding = PyMP3::Encoding.UTF8; v }
        @id3.setall(tag, values)
      end
    rescue StandardError => e
      p key, value
      raise e
    end
    @id3
  end

  def [](key)
    if @tags[key]
      @tags[key][:get].call(@id3)
    else
      method_missing(:[], key)
    end
  end

  def []=(key, value)
    if @tags[key]
      if value
        @tags[key][:set].call(@id3, value)
      else
        @tags[key][:del].call(@id3)
      end
    elsif key.length == 4 && value.nil?
      @id3.delall(key)
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
    if (tag = @keys[key])
      @tags[tag][mode].call(@id3, *args)
    elsif @id3.respond_to?(name)
      @id3.method(name).call(*args)
    else
      super
    end
  end

  def respond_to_missing?(name)
    key = name.to_sym
    key = name[0...-1].to_sym if name[-1] == '='

    return true unless @keys[key].nil?
    return true if @id3.respond_to?(name)

    super
  end
end

{
  title: 'TIT2',
  album: 'TALB',
  artist: 'TPE1',
  album_artist: 'TPE2',
  album_artist_sort: 'TSO2', # iTunes extension
  track: 'TRCK',
  disc: 'TPOS',
  year: 'TDRC',
}.each do |key, tag|
  ID3.register_text_key(key, tag)
end

def lyrics_set(id3, value)
  if value.is_a?(PyMP3::Frame)
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
      lang = 'jpn' if /[亜-熙ぁ-んァ-ヶ]/.match?(text)
    end
    id3.setall('USLT', [PyMP3::Frames['USLT'].new(encoding: PyMP3::Encoding.UTF8, lang: lang, text: text)])
  end
end

ID3.register_key(:lyrics, 'USLT', ->(id3){ id3.getall('USLT')[0].text }, method(:lyrics_set))

def picture_get(id3)
  id3.getall('APIC').map do |apic|
    def apic.inspect
      "APIC(encoding=#{encoding.__repr__}, mime='#{mime}', type=#{type.__repr__}, desc='#{desc}', data=<#{data.length} bytes>)"
    end
    apic
  end
end

def picture_set(id3, value)
  if value.is_a?(PyMP3::Frames['APIC'])
    value.encoding = PyMP3::Encoding.UTF8
    value.type = PyMP3::PictureType.COVER_FRONT
    id3.setall('APIC', [value])
  else
    apic = PyMP3::Frames['APIC'].new(
      encoding: PyMP3::Encoding.UTF8,
      mime: value[:mime],
      type: PyMP3::PictureType.COVER_FRONT,
      data: value[:data]
    )
    id3.setall('APIC', [apic])
  end
end

ID3.register_key(:picture, 'APIC', method(:picture_get), method(:picture_set))
