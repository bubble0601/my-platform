class MainApp
  namespace '/api/music/songs' do
    helpers do
      def fetch_song(id)
        song = Song[id.to_i]
        halt 404, 'The requested resource is not found' if song.nil?
        song
      end

      def download_new_song
        now = DateTime.now.strftime('%Y%m%d_%H%M%S%L')
        path = youtube_dl(@json[:url], "#{CONF.storage.temp}/temp#{now}")
        TagUtil.set_tags(path, @json[:metadata])
        new_song = Song.create_from_file(path)
        unless new_song
          logger.warn "The downloaded song already exists: #{@json[:url]}"
          return nil
        end
        return 200, song_to_hash(new_song) if new_song
      end

      def upload_new_song
        metadata = params[:data]&.parse_json
        files = params[:file].is_a?(Array) ? params[:file] : [params[:file]]

        results = []
        files.each do |f|
          begin
            TagUtil.set_tags(f[:tempfile].path, metadata) if metadata
          rescue NotImplementedError
            logger.error "The uploaded song format is unsupported or incorrect: #{f[:filename]}"
            results.push(nil)
            next
          end

          new_song = Song.create_from_file(f[:tempfile].path, f[:filename])
          if new_song
            results.push(song_to_hash(new_song))
          else
            logger.warn "The uploaded song already exists: #{f[:filename]}"
            results.push(nil)
          end
        end
        [200, results]
      end
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
      query.map(&method(:song_to_hash))
    rescue ArgumentError
      halt 400, 'Invalid arguments'
    end

    post '' do
      if @json # from media url
        download_new_song
      else # upload file
        upload_new_song
      end
    end

    get '/:id' do
      song = fetch_song(params[:id])
      song_to_hash(song)
    end

    put '/:id' do
      song = fetch_song(params[:id])
      song.update(@json)
      status 204
    end

    put '/:id/file' do
      song = fetch_song(params[:id])
      halt 400 unless session[:music_edit_path]
      song.replace_file(session[:music_edit_path])
      session[:music_edit_path] = nil
      status 204
    end

    get '/:id/metadata' do
      song = fetch_song(params[:id])
      audio = Audio.load(song.path)
      info = audio.info
      tags = audio.tags
      res_format = {
        codec: audio.codec_info,
        length: info.length,
        bitrate: info.bitrate,
        sample_rate: info.sample_rate,
        channels: info.channels,
        tag_type: tags.type,
      }

      res_tags = {
        title: tags.title,
        artist: tags.artist,
        album: tags.album,
        album_artist: tags.album_artist,
        track: tags.track,
        disc: tags.disc,
        year: tags.year,
        lyrics: tags.lyrics,
      }
      if (pic = tags.picture)
        cover_ext = case pic[:mime]
                    when /jpeg/ then 'jpg'
                    when /png/ then 'png'
                    end
        res_tags[:cover_art_url] = "/static/music/#{song.digest}/cover.#{cover_ext}"
      end
      {
        format: res_format,
        tags: res_tags,
      }
    end

    put '/:id/tag' do
      song = fetch_song(params[:id])
      errors = TagUtil.set_tags(song.path, @json)
      # TagUtil.delete_tags(song.path, @json[:other_tags_to_delete])
      song.regenerate
      return 204 if errors.empty?

      return 200, errors
    end

    put '/:id/lyrics' do
      song = fetch_song(params[:id])
      song.update_lyrics(@json[:lyrics])
      status 204
    end

    put '/:id/artwork' do
      song = fetch_song(params[:id])
      response = get_response(@json[:artwork])
      song.update_artwork(response['Content-Type'], response.body)
      status 204
    end

    put '/:id/albumartwork' do
      song = fetch_song(params[:id])
      response = get_response(@json[:artwork])
      if song.album.nil?
        song.update_artwork(response['Content-Type'], response.body)
        return 200, [song[:id]]
      else
        res = song.album.songs.each do |s|
          s.update_artwork(response['Content-Type'], response.body)
        end
        return 200, res.map!{ |s| s[:id] }
      end
    end

    delete '/:id' do
      song = fetch_song(params[:id])
      song.delete
      status 204
    end
  end
end
