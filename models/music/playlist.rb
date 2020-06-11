class Playlist < Sequel::Model(:playlists)
  many_to_many :songs
end

class PlaylistSong < Sequel::Model(:playlists_songs)
  many_to_one :playlists
  many_to_one :songs
end
