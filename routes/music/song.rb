class MainApp
  namespace '/api/music/songs' do
    helpers do
      def to_col(field)
        case field
        when 'title' then Sequel[:songs][:title]
        when 'artist' then :artist_name
        when 'album' then Sequel[:albums][:title]
        when 'album_artist' then Sequel[:artists][:name]
        else field.to_sym
        end
      end

      # rubocop:disable Metrics/CyclomaticComplexity
      def rule_to_query(rule)
        case rule[:field]
        when 'title', 'artist', 'album', 'album_artist'
          col = to_col(rule[:field])
          case rule[:operator]
          when 'include'
            Sequel.ilike(col, "%#{rule[:value].escape_like}%")
          when 'prefix'
            Sequel.ilike(col, "#{rule[:value].escape_like}%")
          when 'postfix'
            Sequel.ilike(col, "%#{rule[:value].escape_like}")
          when 'match'
            { col => rule[:value] }
          end
        when 'rate'
          raise ArgumentError unless %w[= <= >=].include?(rule[:operator])

          Sequel.lit("rate #{rule[:operator]} ?", rule[:value])
        when 'created_at'
          raise ArgumentError unless rule[:value].numeric?

          Sequel.lit('DATE_ADD(songs.created_at, INTERVAL ? DAY) > NOW()', rule[:value])
        else
          raise ArgumentError
        end
      end
      # rubocop:enable Metrics/CyclomaticComplexity
    end

    get '' do
      query = Song.eager_graph(:album, :artist)
                  .order{ artist[:ruby] }
                  .order_append{ artist[:name] }
                  .order_append{ album[:year] }
                  .order_append{ album[:title] }
                  .order_append(:track_num, :title)
      if params[:rules]
        rule_groups = params[:rules].map(&:parse_json)
        rule_groups.each do |or_group|
          conditions = or_group.map{ |rule| rule_to_query(rule) }.reduce{ |result, q| result | q }
          query = query.where(conditions)
        end
      end
      if params[:sortBy]
        s = params[:sortBy].split('__')
        col = to_col(s[0])
        order = s[1] == 'asc' ? Sequel.asc(col) : Sequel.desc(col)
        query = query.order_prepend(order)
      end
      query = query.limit(params[:limit].to_i) if params[:limit]
      query.map(&method(:to_song_data))
    rescue ArgumentError
      halt 400, 'Invalid arguments'
    end

    post '' do
      if @json # from media url
        now = DateTime.now.strftime('%Y%m%d_%H%M%S%L')
        path = "#{CONF.storage.temp}/temp#{now}"
        output = "#{path}.%(ext)s"
        path += '.mp3'
        youtube_dl(@json[:url], output)
        p path, @json[:metadata]
        Song.set_tags(path, @json[:metadata])
        res = Song.create_from_file(path)
        logger.warn "The downloaded song already exists: #{@json[:url]}" unless res
        return 200, to_song_data(res) if res
      else # upload file
        metadata = params[:data] ? JSON.parse(params[:data], symbolize_names: true) : nil
        case params[:file]
        when Array
          results = []
          params[:file].each do |f|
            break unless f[:filename].end_with?('.mp3')

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
      if song.album.nil?
        song.update_artwork(response['Content-Type'], response.body)
        return 200, [song[:id]]
      else
        res = song.album.songs.each do |s|
          s.update_artwork(response['Content-Type'], response.body)
        end
        res.map!{ |s| s[:id] }
        return 200, res
      end
    end

    delete '/:id' do
      song = Song[params[:id].to_i]
      halt 404, 'The requested resource not found' if song.nil?
      song.delete
      status 204
    end
  end
end
