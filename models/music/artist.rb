# Artist
# id
class Artist < Sequel::Model(:artists)
  one_to_many :songs
  one_to_many :albums
end
