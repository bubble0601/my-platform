class MainApp
  namespace '/api/music/artists' do
    get '' do
      artists = Song.eager_graph(:artist)
                    .exclude(artist_id: nil)
                    .group_and_count(:artist_id, :name)
                    .having{ count.function.* > 0 }
                    .map{ |s| { id: s[:artist_id], name: s[:name] } }
      artists.push({ id: 0, name: 'Unknown Artist' }) if Song.first(artist_id: nil)
      artists
    end

    get '/:id/songs' do
      aid = params[:id]
      aid = nil if params[:id] == '0'
      Song.eager_graph(:album, :artist)
          .where(Sequel[:songs][:artist_id] =~ aid)
          .order{ album[:year] }
          .order_append{ album[:title] }
          .order_append(:track_num, :title)
          .map(&method(:to_song_data))
    end
  end
end
