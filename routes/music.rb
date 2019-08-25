class MainApp < Sinatra::Base
  namespace '/api/music/songs' do
    helpers do
      def to_data(song)
        {
          id: song.id,
          title: song.title,
          artist: song.artist_name,
          album: song.album.title,
          time: song.length,
          hash: song.hash,
          filename: File.basename(song.filename),
          year: song.album.year,
          rate: song.rate,
        }
      end
    end

    get %r(/?) do
      Song.eager(:album).all.map(&method(:to_data))
    end

    post '/new' do
      case params[:file]
      when Array
        params[:file].each do |f|
          Song.create_from_file(f[:tempfile].path, f[:filename])
        end
      else
        f = params[:file]
        Song.create_from_file(f[:tempfile].path, f[:filename])
      end
      status 204
    end

    get '/:id' do
      song = Song[params[:id].to_i]
      halt 404, 'The requested resource not found' if song.nil?
      to_data(song)
    end

    put '/:id' do
      song = Song[params[:id].to_i]
      halt 404, 'The requested resource not found' if song.nil?
      song.update(@json)
      status 204
    end

    delete '/:id' do
      song = Song[params[:id].to_i]
      halt 404, 'The requested resource not found' if song.nil?
      song.delete
      status 204
    end
  end

  namespace '/static/music' do
    get '/:hash/:name' do
      path = Song.get_path(params[:hash], params[:name])
      halt 404 if path.nil?
      send_file path
    end
  end
end
