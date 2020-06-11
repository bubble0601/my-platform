Sequel.migration do
  change do
    create_table(:playlists) do
      primary_key :id, type: :Bignum
      DateTime :created_at
      DateTime :updated_at
      String :name, size: 255, null: false
    end

    create_table(:playlists_songs) do
      foreign_key :playlist_id, :playlists, type: :Bignum, null: false
      foreign_key :song_id, :songs, type: :Bignum, null: false
      Integer :weight, default: 1, null: false
      primary_key %i[playlist_id song_id]
      index %i[playlist_id song_id]
    end
  end
end
