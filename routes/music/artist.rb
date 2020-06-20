class MainApp
  namespace '/api/music/artists' do
    helpers do
      def filtered_json
        @json.slice(:name, :ruby)
      end
    end

    get '' do
      artists = Song.eager_graph(:artist)
                    .exclude(artist_id: nil)
                    .group_and_count(:artist_id, :name)
                    .having{ count.function.* > 0 }
                    .order(:ruby, :name)
                    .map{ |s| { id: s[:artist_id], name: s[:name] } }
      artists.push({ id: 0, name: 'Unknown Artist' }) if Song.first(artist_id: nil)
      artists
    end

    get '/:id/songs' do
      aid = params[:id]
      aid = nil if params[:id] == '0'
      Song.eager_graph(:album, :artist)
          .where(Sequel[:songs][:artist_id] => aid)
          .default_order
          .map(&method(:song_to_hash))
    end

    put '/:id' do
      aid = params[:id].to_i
      artist = Artist[aid]
      halt 404 unless artist
      halt 400 if @json.nil?
      artist.update(filtered_json)
      status 204
    end
  end
end
