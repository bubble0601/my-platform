# mimeがbytesリテラルになっていたのを修正

require 'pycall/import'
require './app/config'

extend PyCall::Import
pyfrom 'mutagen.id3', import: :ID3

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  t = ID3.new(f)
  pics = t.getall('APIC')
  next if pics.length == 0
  puts "multiple coverart: #{f}" if pics.length > 1

  pic = pics[0]
  if pic.mime.start_with?('image')
    if pic.mime != 'image/png' and pic.mime != 'image/jpeg'
      puts("#{f} #{pic.mime}")
    end
    next
  end
  if pic.mime.end_with?('png\'')
    puts("#{f} #{pic.mime} => image/png")
    pic.mime = 'image/png'
  elsif pic.mime.end_with?('jpeg\'')
    puts("#{f} #{pic.mime} => image/jpeg")
    pic.mime = 'image/jpeg'
  else
    puts("#{f} #{pic.mime}")
  end
  if ARGV[0] == 'run'
    t.setall('APIC', [pic])
    t.save(f)
  end
rescue => e
  p e
  next
end

puts 'completed'
