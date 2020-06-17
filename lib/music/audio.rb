require 'pycall/import'

module Mutagen
  extend PyCall::Import
  pyfrom 'mutagen.mp3', import: %i[MP3 BitrateMode]
  pyfrom 'mutagen.id3', import: %i[ID3 Frame Encoding PictureType]
  pyfrom 'mutagen.mp4', import: %i[MP4 MP4Tags MP4Cover]
  pyfrom 'mutagen.aac', import: %i[AAC]
  pyfrom 'mutagen.flac', import: %i[FLAC Picture]

  module Frames
    extend PyCall::Import
    pyfrom 'mutagen.id3', import: %i[Frames]

    def self.[](key)
      Frames[key]
    end

    Frames.each do |key, frame|
      const_set(key, frame)
    end
  end
end

class Audio
  attr_reader :tags

  @formats = {}

  def self.load(path)
    ext = File.extname(path)[1..]
    @formats[ext]&.new(path)
  end

  def self.register_formats(exts, klass)
    exts.each do |ext|
      @formats[ext] = klass
    end
  end

  def self.supported_formats
    @formats.keys
  end

  def initialize(path)
    @path = path
  end

  def info
    @audio&.info
  end

  def codec_info
    raise NotImplementedError
  end

  def add_tags
    @audio.add_tags
  end

  def save_tags
    @tags.save(@path)
  end

  def delete_tags
    @audio.delete
  end
end

module AudioTags
  def key?(key)
    to_h.keys.include?(key)
  end

  def to_h
    items.to_h
  end

  def each
    if block_given?
      to_h.each{ |*args| yield(*args) }
    else
      to_h.each
    end
  end

  def type
    raise NotImplementedError
  end

  def delete(key)
    raise NotImplementedError
  end

  %i[title artist album album_artist album_artist_sort track disc year genre lyrics picture].each do |name|
    define_method(name) do
      raise NotImplementedError
    end
    define_method(:"#{name}=") do
      raise NotImplementedError
    end
  end
end

require_relative 'mp3'
require_relative 'mp4'

Audio.register_formats(%w[mp3], MP3)
Audio.register_formats(%w[m4a], MP4)
