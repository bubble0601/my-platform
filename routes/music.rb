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
            created_at: song[:created_at].strftime("%Y/%m/%d %H:%M"),
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
            created_at: song[:created_at].strftime("%Y/%m/%d %H:%M"),
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
            created_at: song[:created_at].strftime("%Y/%m/%d %H:%M"),
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
          aid = params[:artist]
          aid = nil if params[:artist] == '0'
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
          path = "#{CONF.storage.temp}/temp#{now}"
          output = "#{path}.%(ext)s".escape_shell
          out = `youtube-dl -f bestaudio -x --audio-format 'mp3' -o #{output} #{@json[:url].escape_shell} 1>/dev/null 2>&1`
          path += '.mp3'
          if $?.success?
            Song.set_tags(path, @json[:metadata])
            res = Song.create_from_file(path)
            logger.warn "The downloaded song already exists: #{@json[:url]}" unless res
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
              res = Song.create_from_file(f[:tempfile].path, f[:filename])
              logger.warn "The uploaded song already exists: #{f[:filename]}" unless res
            end
          else
            f = params[:file]
            Song.set_tags(f[:tempfile].path, metadata)
            res = Song.create_from_file(f[:tempfile].path, f[:filename])
            logger.warn "The uploaded song already exists: #{f[:filename]}" unless res
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
        song.update_tag(@json.transform_keys(&:to_s).filter{|k, v| v && v.length > 0})
        status 204
      end

      put '/:id/fix' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        song.fix
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
        artists = Artist.order(:name).all.map{|artist| artist.slice(:id, :name)}
        artists.push({ id: 0, name: 'Unknown Artist' }) if Song.first(artist_id: nil)
        artists
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

    namespace '/sync' do
      get '/testrun' do
        unless CONF.respond_to? :remote
          halt 400, 'Not Configured'
        end
        local_dir = "#{CONF.storage.music}/".escape_shell
        remote_dir = "#{CONF.remote.ssh.name}:#{CONF.remote.root}/#{CONF.remote.storage.music}/".escape_shell
        r1 = `rsync -avhunz --exclude='.DS_Store' -e ssh #{local_dir} #{remote_dir}`
        r2 = `rsync -avhunz -e ssh #{remote_dir} #{local_dir}`
        { output: "#{r1}\n\n#{r2}" }
      end

      post '/run' do
        unless CONF.respond_to? :remote
          halt 400, 'Not Configured'
        end
        local_dir = "#{CONF.storage.music}/".escape_shell
        remote_dir = "#{CONF.remote.ssh.name}:#{CONF.remote.root}/#{CONF.remote.storage.music}/".escape_shell
        r1 = `rsync -avhuz --exclude='.DS_Store' -e ssh #{local_dir} #{remote_dir}`
        r2 = `rsync -avhuz -e ssh #{remote_dir} #{local_dir}`
        { output: "#{r1}\n\n#{r2}" }
      end
    end

    namespace '/scan' do
      post '' do
        results = []
        Dir["#{CONF.storage.music}/**/*.mp3"].each do |f|
          s = nil
          begin
            s = Song.create_from_file(f)
          rescue
            begin
              Song.fix_mp3(f)
              s = Song.create_from_file(f)
            rescue => e
              results.push("Error: #{e.message} at #{f}")
            end
          end
          results.push(s.filename) if s
        end
        { output: results.join("\n") }
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
