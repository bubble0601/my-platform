# iTunesでエクスポートしたxmlを元にデータベースのrateを更新するスクリプト
require 'rexml/document'
require './server/app/config'
require './server/models/init'

songs = []

f = File.new(ARGV[0])
doc = REXML::Document.new(f, { ignore_whitespace_nodes: :all })
doc.elements.each('plist/dict/key') do |e|
  next unless e.text == 'Tracks'

  e.next_element.each_element('dict') do |el|
    s = {}
    el.each_element('key') do |elm|
      t = elm.text
      nt = elm.next_element.text
      case t
      when 'Name'
        s[:title] = nt
      when 'Artist'
        s[:artist] = nt
      when 'Rating'
        s[:rate] = nt.to_i / 20
      end
    end
    songs.push s
  end
end

rc = 0
uc = 0
songs.each do |s|
  next unless s[:rate]

  rc += 1
  result = Song.select(:id).where({ title: s[:title], artist_name: s[:artist] }).update(rate: s[:rate])
  if result == 0
    puts "#{s[:artist]} #{s[:title]} #{s[:rate]}"
    next
  end
  uc += 1
end

puts "Updated : #{uc}"
puts "Rated   : #{rc}"
puts "Total   : #{songs.length}"
