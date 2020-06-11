class Album < Sequel::Model(:albums)
  one_to_many :songs
  many_to_one :artist
end
