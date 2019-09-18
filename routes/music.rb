require 'date'

class MainApp < Sinatra::Base
  namespace '/api/music' do
    helpers do
      def to_song_data(song)
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
        elsif song[:weight]
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
            weight: song[:weight],
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
      get '' do
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
          query.map(&method(:to_song_data))
        elsif params[:artist]
          Song.eager_graph(:album, :artist)
              .where(Sequel[:songs][:artist_id] =~ params[:artist])
              .order{album[:year]}
              .order_append{album[:title]}
              .order_append(:track_num, :title)
              .map(&method(:to_song_data))
        elsif params[:playlist]
          items = PlaylistSong.select(:song_id, :weight).where(playlist_id: params[:playlist].to_i).all
          w_items = {}
          items.each{|e| w_items[e.song_id] = e.weight}

          Song
            .eager_graph(:album, :artist)
            .where(Sequel[:songs][:id] => w_items.keys)
            .order{artist[:ruby]}
            .order_append{artist[:name]}
            .order_append{album[:year]}
            .order_append{album[:title]}
            .order_append(:track_num, :title)
            .map{|s| s[:weight] = w_items[s[:id]]; s}
            .map(&method(:to_song_data))
        end
      end

      post '' do
        if @json # from media url
          now = DateTime.now.strftime('%Y%m%d_%H%M%S%L')
          path = "#{ROOT}/#{CONF.storage.temp}/temp#{now}"
          output = "#{path}.%(ext)s".escape_shell
          out = `youtube-dl -f bestaudio -x --audio-format 'mp3' -o #{output} #{@json[:url].escape_shell} 1>/dev/null 2>&1`
          path += '.mp3'
          if $?.success?
            Song.set_tags(path, @json[:metadata])
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
        to_song_data(song)
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
      get '' do
        Artist.order(:name).all.map{|artist| artist.slice(:id, :name)}
      end
    end

    namespace '/playlists' do
      get '' do
        Playlist.order(:id).all.map{|list| list.slice(:id, :name)}
      end

      post '' do
        new_list = Playlist.create(name: @json[:name])
        new_list.to_hash
      end

      get '/:id' do
        list = Playlist[params[:id].to_i]
        halt 404 if list.nil?
        {
          id: list.id,
          name: list.name,
          songs: list.songs,
        }
      end

      post '/:id/songs' do
        list = Playlist[params[:id].to_i]
        halt 404 if list.nil?
        errors = []
        @json.each do |id|
          list.add_song(id)
        rescue
          errors.push(id)
        end
        if errors.empty?
          status 204
        else
          halt 400, 'Some songs are already added to the playlist'
        end
      end

      get '/:id/songs/:sid' do
        pid = params[:id].to_i
        sid = params[:sid].to_i
        ps = PlaylistSong.first(playlist_id: pid, song_id: sid)
        halt 404 if ps.nil?
        song = Song[sid]
        to_song_data(song).merge({ weight: ps.weight })
      end

      put '/:id/songs/:sid' do
        pid = params[:id].to_i
        sid = params[:sid].to_i
        ps = PlaylistSong.first(playlist_id: pid, song_id: sid)
        halt 404 if ps.nil?
        ps.update(@json)
        status 204
      end

      delete '/:id/songs/:sid' do
        song = Song[params[:sid].to_i]
        pl = Playlist[params[:id].to_i]
        halt 404 if song.nil? or pl.nil?
        pl.remove_song(song)
        status 204
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
