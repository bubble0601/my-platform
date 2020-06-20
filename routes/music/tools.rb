class MainApp
  namespace '/api/music/tools' do
    helpers do
      def get_youtube_title(url, limit = 5)
        return '' if limit == 0

        title = get_doc(url).title
        return title if title != 'YouTube'

        get_youtube_title(url, limit - 1)
      end

      def rsync(testrun, local, delete)
        local_dir = "#{CONF.storage.music}/"
        remote_dir = "#{CONF.local.remote.ssh.name}:#{CONF.local.remote.root}/#{CONF.local.remote.storage.music}/"
        cmd = ['rsync', '-avhuz']
        cmd.push('-n') if testrun
        cmd.push('--iconv=UTF-8-MAC,UTF-8'.no_shellescape, "--exclude='.DS_Store'".no_shellescape) if env[:os][:mac]
        cmd.push('--delete') if delete
        cmd.push('-e', 'ssh')
        if local
          cmd.push(local_dir)
          cmd.push(remote_dir)
        else
          cmd.push(remote_dir)
          cmd.push(local_dir)
        end
        exec_command(cmd)
      end

      def audio?(path)
        Audio.supported_formats.include?(File.extname(path)[1..])
      end
    end

    get '/candidates' do
      url = params[:url]
      if url.start_with?('https://www.youtube.com')
        title = get_youtube_title(params[:url])
        title = title.gsub(/ - YouTube$/, '')
        title.gsub!(/[(（\[【]?(Official Music Video|Official Video|Music Video|Official)[)）\]】]?/i, '')
        title.gsub!(/[(（\[【]?(MV|PV)[)）\]】]?/, '')
        title.strip!
        if (m = /(.*)[「『](.*)[」』]/.match(title))
          return {
            title: [m[2].strip],
            artist: [m[1].strip],
          }
        end
        if (m = %r{(.*)[-−/／](.*)}.match(title))
          c1 = m[1].strip
          c2 = m[2].strip
          return {
            title: [c2, c1],
            artist: [c1, c2],
          }
        end
        if (m = /\s*(.*)\s+(.*)\s*/.match(title))
          c1 = m[1].strip
          c2 = m[2].strip
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
      url = 'https://musicbrainz.org/ws/2/recording?'
      url += URI.encode_www_form(query: "title:#{params[:title]} AND artist:#{params[:artist]}", fmt: 'json')
      search_result = get_json(url, { 'User-Agent' => "#{CONF.app.name}/1.0.0" })
      search_result['recordings'].each do |rec|
        # 候補2つ以上のときスコア70未満は無視
        break if rec['score'] < 70 && results.length > 1

        artist = rec['artist-credit'][0]['name']
        if rec['artist-credit'].length > 1
          artist = rec['artist-credit'].reduce('') do |result, item|
            result += item['name']
            result += item['joinphrase'] if item['joinphrase']
            result
          end
        end
        next unless rec['releases']

        # rubocop:disable Style/RescueModifier
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
        # rubocop:enable Style/RescueModifier
      end
      results.sort_by! do |x|
        [
          x[:album_artist] == 'Various Artists' ? 1 : 0,
          x[:title].downcase.eql?(params[:title].downcase) ? 0 : 1,
          x[:track_count] > 5 ? 0 : 1,
          x[:year] || 10_000,
        ]
      end
      results.map! do |x|
        x[:track] = [x[:track_num], x[:track_count]].join('/') if x[:track_num] && x[:track_count]
        x[:disc] = [x[:disc_num], x[:disc_count]].join('/') if x[:disc_num] && x[:disc_count]
        %i[track_num track_count disc_num disc_count].each{ |k| x.delete(k) }
        x[:year] = x[:year].to_s
        x
      end
    end

    get '/searchlyrics' do
      Lyrics.search(params[:title], params[:artist])
    end

    get '/searchcoverart' do
      CoverArt.search(params[:title], params[:album], params[:artist], params[:page].to_i)
    end

    get '/sync' do
      halt 400, 'Not Configured' unless CONF.respond_to? :local
      local = params[:local] == 'true'
      delete = params[:delete] == 'true'
      { output: rsync(true, local, delete) }
    end

    post '/sync' do
      halt 400, 'Not Configured' unless CONF.respond_to? :local
      local = params[:local] == 'true'
      delete = params[:delete] == 'true'
      { output: rsync(false, local, delete) }
    end

    get '/scan' do
      files = {}
      Dir["#{CONF.storage.music}/**/*.*"].each do |f|
        f.unicode_normalize!
        next unless audio?(f)

        files[f] = false
      end
      Song.each do |s|
        path = s.path
        files[path] = true unless files[path].nil?
      end
      targets = files.filter{ |_, v| v == false }.map{ |k, _| k }
      { targets: targets }
    end

    post '/scan' do
      results = []
      @json.each do |f|
        unless child_path?(CONF.storage.music, f)
          results.push("Invalid path: #{f}")
          next
        end
        begin
          s = Song.create_from_file(f)
        rescue RuntimeError
          results.push("Error: #{e.message} at #{f}")
          next
        end
        if s
          results.push("Added: #{f} => #{s.filename}")
        else
          results.push("Already exists: #{f}")
        end
      end
      { results: results }
    end

    get '/normalize' do
      results = []
      Song.eager(:album, :artist).all.each do |song|
        old_path = song.path
        new_filename = song.generate_filename
        new_path = "#{CONF.storage.music}/#{new_filename}"
        next if old_path == new_path

        results.push({ current: old_path, to: new_path })
      end
      results
    end

    post '/normalize' do
      results = []
      Song.eager(:album, :artist).all.each do |song|
        old_path = song.path
        new_filename = song.generate_filename
        new_path = "#{CONF.storage.music}/#{new_filename}"
        next if old_path == new_path

        FileUtils.mkdir_and_move(old_path, new_path)
        song.filename = new_filename
        song.save
        results.push({ current: old_path, to: new_path })
      end
      results
    end

    get '/organize' do
      files = {}
      deletes = []
      missing_files = []
      Dir["#{CONF.storage.music}/**/*"].each do |f|
        f.unicode_normalize!
        if audio?(f)
          files[f] = false
        elsif File.file?(f)
          deletes.push(f)
        end
      end
      Song.each do |s|
        path = s.path
        if files[path].nil?
          missing_files.push(path)
        else
          files[path] = true
        end
      end
      deletes.concat(files.filter{ |_, v| v == false }.map{ |k, _| k })

      empty_dirs = FileUtils.find_empty_dir(CONF.storage.music)
      {
        target_files: deletes,
        target_dirs: empty_dirs,
        missing_files: missing_files,
      }
    end

    post '/organize' do
      deleted_files = []
      deleted_dirs = []
      @json[:target_files].each do |f|
        raise ArgumentError, 'Invalid path' unless child_path?(CONF.storage.music, f)

        FileUtils.rm(f)
        deleted_files.push(f)
      rescue ArgumentError => e
        logger.error('organize'){ e.message }
      end
      @json[:target_dirs].each do |f|
        raise ArgumentError, 'Invalid path' unless child_path?(CONF.storage.music, f)

        FileUtils.rm_r(f)
        deleted_dirs.push(f)
      rescue ArgumentError => e
        logger.error('organize'){ e.message }
      end

      {
        deleted_files: deleted_files,
        deleted_dirs: deleted_dirs,
      }
    end
  end
end
