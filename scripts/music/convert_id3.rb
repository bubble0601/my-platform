require './app/config'
require './lib/music/mp3'

puts "start convert mp3tag to ID3v2.4/UTF-8...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = ID3.new(f)
  tags.update_to_v24
  tags.to_utf8
  tags.save
rescue StandardError => e
  puts f
  p e
  puts
end

puts "confirm converted...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = ID3.new(f)
  begin
    tit2 = tags.getall('TIT2')
    tpe2 = tags.getall('TPE2')
    raise if !tit2.empty? && tit2[0].encoding != PyMP3::Encoding.UTF8
    raise if !tpe2.empty? && tpe2[0].encoding != PyMP3::Encoding.UTF8
  rescue RuntimeError
    puts f
    p tags.get_all(true)
    puts
  end
rescue StandardError => e
  puts f
  p e
  puts
end
