require 'date'
require 'json'
require 'net/http'
require 'nokogiri'
require './lib/music/search'

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

      def search_info(title, artist)
        url = URI.escape("https://musicbrainz.org/ws/2/recording?query=title:#{title} AND artist:#{artist}&fmt=json")
        get_json(url, { 'User-Agent' => "#{CONF.app.name}/1.0.0" })
      end
    end

    namespace '/songs' do
      get '' do
        Song.eager_graph(:album, :artist)
            .order{album[:year]}
            .order_append{album[:title]}
            .order_append(:track_num, :title)
            .map(&method(:to_song_data))
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

      put '/:id/file' do
        song = Song[params[:id].to_i]
        path = "#{CONF.storage.temp}/#{song[:digest]}.mp3"
        song.replace_file(path)
        status 204
      end

      put '/:id/tag' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        song.update_tag(@json.transform_keys(&:to_s))
        status 204
      end

      put '/:id/lyrics' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        song.update_lyrics(@json[:lyrics])
        status 204
      end

      put '/:id/artwork' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        response = get_response(@json[:artwork])
        song.update_artwork(response['Content-Type'], response.body)
        status 204
      end

      put '/:id/albumartwork' do
        song = Song[params[:id].to_i]
        halt 404, 'The requested resource not found' if song.nil?
        response = get_response(@json[:artwork])
        res = song.album.songs.each{ |s|
          s.update_artwork(response['Content-Type'], response.body)
        }.map{ |s| s[:id] }
        return 200, res
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

      get '/:id/songs' do
        aid = params[:id]
        aid = nil if params[:id] == '0'
        Song.eager_graph(:album, :artist)
            .where(Sequel[:songs][:artist_id] =~ aid)
            .order{album[:year]}
            .order_append{album[:title]}
            .order_append(:track_num, :title)
            .map(&method(:to_song_data))
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

      get '/:id/songs' do
        items = PlaylistSong.select(:song_id, :weight).where(playlist_id: params[:id].to_i).all
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
        elsif errors.length == @json.length
          halt 200, 'Selected songs are already added to the playlist'
        else
          halt 200, 'Some songs are already added to the playlist'
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

    namespace '/smartlists' do
      get '' do
        [
          { id: 1, name: 'New7d' },
          { id: 2, name: 'New30d' },
          { id: 3, name: 'New100' },
          { id: 4, name: 'Fabulous' },
          { id: 5, name: 'Excellent' },
          { id: 6, name: 'Great' },
          { id: 7, name: 'Good' },
          { id: 8, name: 'Unrated' },
        ]
      end

      get '/:id/songs' do
        query = Song.eager_graph(:album, :artist)
                    .order{artist[:ruby]}
                    .order_append{artist[:name]}
                    .order_append{album[:year]}
                    .order_append{album[:title]}
                    .order_append(:track_num, :title)
        case params[:id]
        when '1'
          query = query.where(Sequel.lit('DATE_ADD(songs.created_at, INTERVAL 7 DAY) > NOW()'))
        when '2'
          query = query.where(Sequel.lit('DATE_ADD(songs.created_at, INTERVAL 30 DAY) > NOW()'))
        when '3'
          query = query.order_prepend(:created_at).reverse.limit(100)
        when '4'
          query = query.where(rate: 5)
        when '5'
          query = query.where{rate >= 4}
        when '6'
          query = query.where{rate >= 3}
        when '7'
          query = query.where{rate >= 2}
        when '6'
          query = query.where(rate: 0)
        end
        query.map(&method(:to_song_data))
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

      get '/searchinfo' do
        results = []
        search_result = search_info(params[:title], params[:artist])
        search_result['recordings'].each do |rec|
          # 候補2つ以上のときスコア70未満は無視
          break if rec['score'] < 70 and results.length > 1
          artist = rec['artist-credit'][0]['name']
          if rec['artist-credit'].length > 1
            artist = rec['artist-credit'].reduce('') do |result, item|
              result += item['name']
              result += item['joinphrase'] if item['joinphrase']
              result
            end
          end
          next unless rec['releases']
          rec['releases'].each do |album|
            results.push({
              title: rec['title'],
              artist: artist,
              album: (album['title'] rescue nil),
              album_artist: (album['artist-credit'][0]['name'] rescue nil),
              year: (Date.parse(album['date']).year rescue nil),
              track_num: (album['media'][0]['track'][0]['number'] rescue nil),
              track_count: (album['media'][0]['track-count'] rescue nil),
              disc_num: (album['media'][0]['position'] rescue nil),
              disc_count: (album['count'] rescue nil),
            })
          end
        end
        return results.sort_by{|x|
          [
            x[:album_artist] == "Various Artists" ? 1 : 0,
            x[:title].downcase.eql?(params[:title].downcase) ? 0 : 1,
            x[:track_count] > 5 ? 0 : 1,
            x[:year] || 10000,
          ]
        }.map{|x|
          if x[:track_num] and x[:track_count]
            x[:track] = [x[:track_num], x[:track_count]].join('/')
          else
            x[:track] = nil
          end
          if x[:disc_num] and x[:disc_count]
            x[:disc] = [x[:disc_num], x[:disc_count]].join('/')
          else
            x[:disc] = nil
          end
          [:track_num, :track_count, :disc_num, :disc_count].each{|k| x.delete(k)}
          x[:year] = x[:year].to_s
          x
        }
      end

      get '/searchlyrics' do
        Lyrics::search(params[:title], params[:artist])
      end

      get '/searchartwork' do
        if params[:more]
          Artwork::search_more(params[:title], params[:album], params[:artist])
        else
          Artwork::search(params[:title], params[:album], params[:artist])
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
    helpers do
      def exec_command(cmd, append = nil)
        cmd = cmd.map(&:escape_shell).join(' ') if Array === cmd
        cmd += " #{append}" if append
        out = `#{cmd}`
        unless $?.success?
          logger.error "An error ocurred when execute `#{cmd}`"
          logger.error out
          # raise RuntimeError, "An error ocurred when execute `#{cmd}`"
          halt 500, 'An error ocurred when executing command'
        end
        return out
      end
    end

    get '/:digest/:name' do
      path = Song.get_path(params[:digest], params[:name])
      halt 404 if path.nil?
      send_file path
    end

    get '/temp/:digest/:name' do
      cache_control :no_store
      reset = params[:reset] == 'true'
      path = "#{CONF.storage.temp}/#{params[:digest]}"
      if reset
        input_path = Song.get_path(params[:digest], params[:name]) if reset
        output_path = "#{path}.mp3"
      else
        input_path = "#{path}.mp3"
        output_path = "#{path}_2.mp3"
      end
      halt 404 if input_path.nil? or not File.exist?(input_path)

      case params[:kind]
      when 'trim'
        params[:start] = '0' unless params[:start]
        cmd = ['sox', input_path, output_path, 'trim', params[:start]]
        cmd.push("=#{params[:end]}") if params[:end]
        exec_command(cmd)
        FileUtils.move(output_path, input_path) unless reset
      when 'noisered'
        noise_path = "#{path}_noise"
        cmd1 = ['sox', input_path, '-n', 'trim', '0', '1', 'noiseprof', noise_path]
        exec_command(cmd1)
        cmd2 = ['sox', input_path, output_path, 'noisered', noise_path, '0.21']
        exec_command(cmd2)
        FileUtils.rm(noise_path)
        FileUtils.move(output_path, input_path) unless reset
      when 'norm'
        cmd = ['sox', input_path, output_path, 'gain', '-n', '-1']
        exec_command(cmd)
        FileUtils.move(output_path, input_path) unless reset
      when 'download'
        cmd = ['youtube-dl', '-f', 'bestaudio', '-x', '--audio-format', 'mp3', '-o', "#{path}.tmp.%(ext)s", params[:url]]
        exec_command(cmd, '1>/dev/null 2>&1')
        FileUtils.move("#{path}.tmp.mp3", "#{path}.mp3")
        FileUtils.rm(Dir["#{path}.tmp.*"])
      end
      send_file "#{path}.mp3"
    end

    post '/temp/:digest/:name' do
      path = "#{CONF.storage.temp}/#{params[:digest]}.mp3"
      f = params[:file]
      FileUtils.move(f[:tempfile].path, path)
      send_file path
    end
  end
end
