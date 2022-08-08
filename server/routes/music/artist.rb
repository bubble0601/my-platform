using Sequel::SymbolAref

class MainApp
  namespace '/api/music/artists' do
    helpers do
      def filtered_json
        @json.slice(:name, :ruby)
      end

      def unknown_artist
        { id: 0, name: 'Unknown Artist', ruby: '' }
      end
    end

    get '' do
      artists = Artist.eager_graph(:songs)
                      .where(:songs[:user_id] => @user.id)
                      .group(:artists[:id])
                      .select(:artists[:id], :name, :ruby)
                      .order(:ruby, :name)
                      .map{ |artist| { id: artist[:id], name: artist[:name], ruby: artist[:ruby] } }
      artists.push(unknown_artist) unless Song.where(user_id: @user.id, artist_id: nil).empty?
      artists
    end

    get '/:id' do
      aid = params[:id].to_i
      artist = Artist[aid]
      return unknown_artist unless artist
      halt 403 if artist.user_id != @user.id

      artist.slice(:id, :name, :ruby)
    end

    get '/:id/songs' do
      aid = params[:id]
      aid = nil if params[:id] == '0'
      Song.eager_graph(:album, :artist)
          .where(:songs[:user_id] => @user.id)
          .where(:songs[:artist_id] => aid)
          .map(&method(:song_to_hash))
          .sort_by{ |song| song[:year] }
    end

    put '/:id' do
      aid = params[:id].to_i
      artist = Artist[aid]
      halt 404 unless artist
      halt 403 if artist.user_id != @user.id
      halt 400 if @json.nil?

      artist.update(filtered_json)
      status 204
    end
  end
end
