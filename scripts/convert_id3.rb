require_relative '../app/config'
require_relative '../models/utils/mp3'

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = ID3.new(f)
  tags.update_to_v24
  tags.to_utf8
  tags.save
end

Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
  tags = ID3.new(f)
  begin
    raise if tags.getall('TIT2')[0].encoding != PyMP3::Encoding.UTF8
    raise if tags.getall('TPE2')[0].encoding != PyMP3::Encoding.UTF8
  rescue
    puts f
  end
end
