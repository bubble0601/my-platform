require './app/config'
require './lib/music/audio'

Sequel.extension :symbol_aref

def load_from_tags(path)
  tags = Audio.load(path).tags
  res = {}
  if tags
    res[:year] = tags.year.to_i
    res[:sort] = tags.album_artist_sort
  end
  res
rescue StandardError
  nil
end

Sequel.migration do
  up do
    rename_column :songs, :rate, :rating
    rename_column :songs, :has_lyric, :has_lyrics
    rename_column :songs, :has_artwork, :has_cover_art
    add_column :songs, :enabled, TrueClass, default: true, null: false
    add_column :songs, :year, Integer
    add_column :songs, :played_count, Integer, defalut: 0, null: false
    add_column :songs, :synced_played_count, Integer, defalut: 0, null: false
    add_column :songs, :played_at, DateTime
    songs = DB[:songs].left_join(:albums, id: :album_id)
                      .select(:songs[:id], :filename, :songs[:artist_id], :albums[:year])
                      .all
    songs.each do |song|
      res = load_from_tags("#{CONF.storage.music}/#{song[:filename]}")
      next unless res

      year = res[:year] || song[:year]
      ruby = res[:sort]
      DB[:songs].where(id: song[:id]).update(year: year) if year && year > 0
      DB[:artists].where(id: song[:artist_id]).update(ruby: ruby) if ruby
    end

    rename_column :albums, :num_tracks, :track_count
    rename_column :albums, :num_discs, :disc_count
  end
  down do
    rename_column :songs, :rating, :rate
    rename_column :songs, :has_lyrics, :has_lyric
    rename_column :songs, :has_cover_art, :has_artwork
    drop_column :songs, :enabled
    drop_column :songs, :year
    drop_column :songs, :played_count
    drop_column :songs, :synced_played_count
    drop_column :songs, :played_at

    rename_column :albums, :track_count, :num_tracks
    rename_column :albums, :disc_count, :num_discs
  end
end
