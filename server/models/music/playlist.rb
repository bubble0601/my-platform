# Columns
#   id:         bigint, PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at: datetime
#   updated_at: datetime
#   name:       varchar(255), NOT NULL
#   user_id:    bigint, NOT NULL
class Playlist < Sequel::Model(:playlists)
  many_to_one :user
  many_to_many :songs
end

# Columns
#   playlist_id:  bigint, PRIMARY KEY, NOT NULL
#   song_id:      bigint, PRIMARY KEY, NOT NULL
#   weight:       int, NOT NULL, DEFAULT 1
class PlaylistSong < Sequel::Model(:playlists_songs)
  many_to_one :playlist
  many_to_one :song
end
