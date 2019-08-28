require 'date'

class MainApp < Sinatra::Base
  namespace '/api/music' do
    helpers do
      def to_data(song)
        if song.is_a?(Song)
          {
            id: song[:id],
            title: song[:title],
            artist: song[:artist_name] || song.artist&.name || 'Unknown Artist',
            album: song.album&.title || 'Unknown Album',
            album_artist: song.artist&.name,
            time: song[:length],
            digest: song[:digest],
            filename: File.basename(song[:filename]),
            year: song.album&.year,
            rate: song[:rate],
          }
        else
          {
            id: song[:id],
            title: song[:title],
            artist: song[:artist_name] || song[:name] || 'Unknown Artist',
            album: song[:album_title] || 'Unknown Album',
            album_artist: song[:name],
            time: song[:length],
            digest: song[:digest],
            filename: File.basename(song[:filename]),
            year: song[:year],
            rate: song[:rate],
          }
        end
      end
    end

    namespace '/songs' do
      get %r(/?) do
        if params[:tab]
          query = Song.eager_graph(:album, :artist)
                      .order{artist[:ruby]}
                      .order_append{artist[:name]}
                      .order_append{album[:year]}
                      .order_append{album[:title]}
                      .order_append(:track_num, :title)
          case params[:tab]
          when 'fabulous'
            query = query.where(rate: 5)
          when 'excellent'
            query = query.where{rate >= 4}
          when 'great'
            query = query.where{rate >= 3}
          when 'good'
            query = query.where{rate >= 2}
          when 'unrated'
            query = query.where(rate: 0)
          end
          query.map(&method(:to_data))
        elsif params[:artist]
          Song.eager_graph(:album, :artist)
              .order{album[:year]}
              .order_append{album[:title]}
              .order_append(:track_num, :title)
              .where(Sequel[:songs][:artist_id] =~ params[:artist])
              .map(&method(:to_data))
        end
      rescue => e
        logger.error e
        halt 500, 'Failed to load songs'
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
              return unless f[:filename].end_with?('.mp3')
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

      put '/:id/tag' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        song.updateTag(@json.transform_keys(&:to_s).filter{|k, v| v && v.length > 0})
        status 204
      end

      delete '/:id' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        song.delete
        status 204
      end
    end

    namespace '/artists' do
      get %r(/?) do
        Artist.order(:name).all.map{|artist| artist.slice(:id, :name)}
      end
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
