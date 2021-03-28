require 'pycall/import'

module Mutagen
  extend PyCall::Import
  pyfrom 'mutagen', import: :File
  pyfrom 'mutagen.mp3', import: %i[MP3]
  pyfrom 'mutagen.id3', import: %i[ID3 APIC USLT]
  pyfrom 'mutagen.apev2', import: :APEv2
end

module Sample
  include Mutagen

  mp3 = MP3.new('./storage/tests/sample.mp3')
  p mp3.tags
  puts mp3.info.pprint
  mp3.add_tags
  p mp3.tags

  tags = mp3.tags
  apic1 = APIC.new(mime: 'image/jpeg', desc: '1', data: Random.new.bytes(100))
  apic2 = APIC.new(mime: 'image/jpeg', desc: '2', data: Random.new.bytes(100))
  tags.setall('APIC', [apic1, apic2])
  uslt1 = USLT.new(text: 'abc', lang: 'eng')
  uslt2 = USLT.new(text: 'def', lang: 'jpn')
  tags.setall('USLT', [uslt1, uslt2])
  tags.items.to_h.each do |k, v|
    p k, v
  end
end
