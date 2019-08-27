require 'date'

class MainApp < Sinatra::Base
  namespace '/api/music/songs' do
    helpers do
      def to_data(song)
        {
          id: song.id,
          title: song.title,
          artist: song.artist_name || 'Unknown Artist',
          album: song.album&.title || 'Unknown Album',
          time: song.length,
          digest: song.digest,
          filename: File.basename(song.filename),
          year: song.album&.year,
          rate: song.rate,
        }
      end
    end

    get %r(/?) do
      Song.eager(:album).all.map(&method(:to_data))
    end

    post '/new' do
      if @json # from media url
        now = DateTime.now.strftime('%Y%m%d_%H%M%S%L')
        path = "#{ROOT}/#{CONF.storage.temp}/temp#{now}"
        output = "#{path}.%(ext)s".escape_shell
        out = `youtube-dl -f bestaudio -x --audio-format 'mp3' -o #{output} #{@json[:url].escape_shell} 1>/dev/null 2>&1`
        path += '.mp3'
        if $?.success?
          p `ffprobe -i #{path}`
          Song.set_tags(path, @json[:metadata])
          p `ffprobe -i #{path}`
          Song.create_from_file(path)
        else
          logger.error('youtube-dl'){out}
          halt 400, 'Failed to download from the url'
        end
      else # upload file
        metadata = if params[:data] then JSON.parse(params[:data], symbolize_names: true) else nil end
        case params[:file]
        when Array
          params[:file].each do |f|
            Song.set_tags(f[:tempfile].path, metadata)
            Song.create_from_file(f[:tempfile].path, f[:filename])
          end
        else
          f = params[:file]
          Song.set_tags(f[:tempfile].path, metadata)
          Song.create_from_file(f[:tempfile].path, f[:filename])
        end
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
    get '/:digest/:name' do
      path = Song.get_path(params[:digest], params[:name])
      halt 404 if path.nil?
      send_file path
    end
  end
end
