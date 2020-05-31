require 'date'
require 'net/http'
require 'nokogiri'

class MainApp < Sinatra::Base
  namespace '/api/music' do
    helpers UtilityHelpers
    helpers do
      def to_song_data(song)
        if song.is_a?(Song)
          {
            id: song[:id],
            title: song[:title],
            artist: {
              id: song[:artist_id],
              name: song[:artist_name] || song.artist&.name || 'Unknown Artist',
            },
            album: {
              id: song[:album_id],
              title: song.album&.title || 'Unknown Album',
              artist: song.artist&.name,
            },
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
            artist: {
              id: song[:artist_id],
              name: song[:artist_name] || song[:name] || 'Unknown Artist',
            },
            album: {
              id: song[:album_id],
              title: song[:album_title] || 'Unknown Album',
              artist: song[:name],
            },
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
            artist: {
              id: song[:artist_id],
              name: song[:artist_name] || song[:name] || 'Unknown Artist',
            },
            album: {
              id: song[:album_id],
              title: song[:album_title] || 'Unknown Album',
              artist: song[:name],
            },
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
        if params[:artist]
          aid = params[:artist]
          aid = nil if params[:artist] == '0'
          Song.eager_graph(:album, :artist)
              .where(Sequel[:songs][:artist_id] =~ aid)
              .order{album[:year]}
              .order_append{album[:title]}
              .order_append(:track_num, :title)
              .map(&method(:to_song_data))
        elsif (Integer params[:playlist] rescue false)
          items = PlaylistSong.select(:song_id, :weight).where(playlist_id: params[:playlist].to_i).all
          w_items = {}
          items.each{|e| w_items[e.song_id] = e.weight}

          Song.eager_graph(:album, :artist)
              .where(Sequel[:songs][:id] => w_items.keys)
              .order{artist[:ruby]}
              .order_append{artist[:name]}
              .order_append{album[:year]}
              .order_append{album[:title]}
              .order_append(:track_num, :title)
              .map{|s| s[:weight] = w_items[s[:id]]; s}
              .map(&method(:to_song_data))
        elsif params[:playlist]
          query = Song.eager_graph(:album, :artist)
                      .order{artist[:ruby]}
                      .order_append{artist[:name]}
                      .order_append{album[:year]}
                      .order_append{album[:title]}
                      .order_append(:track_num, :title)
          case params[:playlist]
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
          when 'new'
            query = query.where(Sequel.lit('DATE_ADD(songs.created_at, INTERVAL 7 DAY) > NOW()'))
          end
          query.map(&method(:to_song_data))
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
            return 200, to_song_data(res) if res
          else
            logger.error('youtube-dl'){out}
            halt 400, 'Failed to download from the url'
          end
        else # upload file
          metadata = if params[:data] then JSON.parse(params[:data], symbolize_names: true) else nil end
          case params[:file]
          when Array
            results = []
            params[:file].each do |f|
              return unless f[:filename].end_with?('.mp3')
              Song.set_tags(f[:tempfile].path, metadata)
              res = Song.create_from_file(f[:tempfile].path, f[:filename])
              if res
                results.push(to_song_data(res))
              else
                logger.warn "The uploaded song already exists: #{f[:filename]}"
                results.push(nil)
              end
            end
            return 200, results
          else
            f = params[:file]
            Song.set_tags(f[:tempfile].path, metadata)
            res = Song.create_from_file(f[:tempfile].path, f[:filename])
            logger.warn "The uploaded song already exists: #{f[:filename]}" unless res
            return 200, [to_song_data(res)] if res
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
        song.update_tag(@json.transform_keys(&:to_s))
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
        artists = Song.eager_graph(:artist)
                      .exclude(artist_id: nil)
                      .group_and_count(:artist_id, :name)
                      .having{count.function.* > 0}
                      .map{|s| { id: s[:artist_id], name: s[:name] }}
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

    namespace '/tools' do
      get '/candidates' do
        url = params[:url]
        if url.start_with?('https://www.youtube.com')
          doc = get_doc(params[:url])
          title = doc.title.gsub(/ - YouTube$/, '')
          title.gsub!(/[(（]?(Official Music Video|Official Video|Music Video)[)）]?/i, '')
          title.gsub!(/[(（]?(MV|PV)[)）]?/, '')
          title.strip!
          matched = /(.*)[「『](.*)[」』]/.match(title)
          if matched
            return {
              title: [$2.strip],
              artist: [$1.strip],
            }
          end
          matched = /(.*)[-ー−\/／](.*)/.match(title)
          if matched
            c1 = $1.strip
            c2 = $2.strip
            return {
              title: [c2, c1],
              artist: [c1, c2],
            }
          end
          {
            title: [title],
            artist: [],
          }
        end
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
