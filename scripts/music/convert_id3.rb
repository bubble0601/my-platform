require './app/config'
require './lib/music/audio'

puts "start convert mp3tag to ID3v2.4/UTF-8...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = MP3.new(f).tags
  tags.update_to_v24
  tags.convert_to_utf8
  tags.save
rescue StandardError => e
  puts f
  p e
  puts
end

puts "confirm converted...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = MP3.new(f).tags
  begin
    tit2 = tags['TIT2']
    tpe2 = tags['TPE2']
    raise if !tit2.length.zero? && tit2[0].encoding != PyMP3::Encoding.UTF8
    raise if !tpe2.length.zero? && tpe2[0].encoding != PyMP3::Encoding.UTF8
  rescue RuntimeError
    puts f
    p tags.to_h
    puts
  end
rescue StandardError => e
  puts f
  p e
  puts
end
