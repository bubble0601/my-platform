require './app/config'
require './lib/music/mp3'

puts "start convert mp3tag to ID3v2.4/UTF-8...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  begin
    tags = ID3.new(f)
    tags.update_to_v24
    tags.to_utf8
    tags.save
  rescue => e
    puts f
    p e
    puts
  end
end

puts "confirm converted...\n"

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  begin
    tags = ID3.new(f)
    begin
      tit2 = tags.getall('TIT2')
      tpe2 = tags.getall('TPE2')
      raise if tit2.length > 0 and tit2[0].encoding != PyMP3::Encoding.UTF8
      raise if tpe2.length > 0 and tpe2[0].encoding != PyMP3::Encoding.UTF8
    rescue
      puts f
      p tags.get_all(true)
      puts
    end
  rescue => e
    puts f
    p e
    puts
  end
end
