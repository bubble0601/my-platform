module MusicHelpers
  def music_dir
    if CONF.local.enabled
      CONF.storage.music
    elsif @user
      "#{CONF.storage.music}/#{@user.id}"
    else
      halt 403
    end
  end

  def song_to_hash(song)
    {
      id: song[:id],
      created_at: song[:created_at].strftime('%Y/%m/%d %H:%M'),
      title: song[:title],
      artist: {
        id: song[:artist_id],
        name: song[:artist_name] || (song.artist&.name rescue song[:name]) || 'Unknown Artist',
      },
      album: {
        id: song[:album_id],
        title: (song.album&.title rescue song[:album_title]) || 'Unknown Album',
        artist: (song.artist&.name rescue song[:name]),
      },
      time: song[:length],
      digest: song[:digest],
      filename: File.basename(song[:filename]),
      year: song[:year] || (song.album&.year rescue song[:album_year]),
      rating: song[:rating],
      played_count: song[:played_count],
    }
  end

  def create_song_from_file(path, filename = nil)
    filename ||= File.basename(path)
    audio = Audio.load(path)

    song, album, artist = TagUtil.load_metadata_from_file(audio)

    unless song.title
      ext = File.extname(filename)
      song.title = File.basename(filename, ext)
    end

    associate_relations(song, album, artist)
    return nil if song_exists?(song)

    song.user_id = @user.id
    song.length = audio.info.length
    song.filename = song.generate_filename(filename)
    FileUtils.mkdir_and_move(path, song.path)
    song.digest = song.generate_digest
    song.save
  end

  def regenerate_song(_song)
    filename = File.basename(_song.path)
    audio = Audio.load(_song.path)
    song, album, artist = TagUtil.load_metadata_from_file(audio)

    unless song.title
      ext = File.extname(filename)
      song.title = File.basename(filename, ext)
    end

    associate_relations(song, album, artist)

    song.filename = song.generate_filename(filename)
    FileUtils.mkdir_and_move(_song.path, song.path)

    song.digest = song.generate_digest
    _song.update(song.to_hash)
  end

  def associate_relations(song, album, artist)
    if artist.name
      song.artist = Artist.find_or_create(name: artist.name, user_id: @user.id)
      song.artist_name = artist.name unless song.artist_name
      album.artist_id = song.artist.id
    else
      song.artist = nil
    end
    if album.artist_id && album.title
      song.album = Album.find_or_create(album.to_hash.slice(:artist_id, :title).merge(user_id: @user.id))
      %i[year track_count disc_count].each do |k|
        song.album[k] = album[k] if album[k]
      end
      song.album.save
    else
      song.album = nil
    end
  end

  def song_exists?(song)
    q = Song.where(title: song.title, user_id: @user.id)
    q = q.where(artist_id: song.artist.id) if song.artist
    q = q.where(album_id: song.album.id) if song.album
    !q.empty?
  end

  def to_col(field)
    case field
    when 'title' then Sequel[:songs][:title]
    when 'artist' then :artist_name
    when 'album' then Sequel[:albums][:title]
    when 'album_artist' then Sequel[:artists][:name]
    else field.to_sym
    end
  end

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
    when 'rating'
      raise ArgumentError unless %w[= <= >=].include?(rule[:operator])

      Sequel.lit("rating #{rule[:operator]} ?", rule[:value])
    when 'created_at'
      raise ArgumentError unless rule[:value].numeric?

      Sequel.lit('DATE_ADD(songs.created_at, INTERVAL ? DAY) > NOW()', rule[:value])
    else
      raise ArgumentError
    end
  end

  def youtube_dl(url, basepath, fmt = 'm4a')
    cmd = [
      'youtube-dl',
      '--no-playlist',
      '--geo-bypass',
      '-f', 'bestaudio',
      '--extract-audio',
      '--audio-format', fmt,
    ]
    cmd.push('--postprocessor-args "-acodec libfdk_aac"'.no_shellescape) if %w[m4a aac].include?(fmt)
    cmd.push(
      '-o', "#{basepath}.%(ext)s",
      url,
      '1>/dev/null 2>&1'.no_shellescape
    )
    begin
      exec_command(cmd)
      return File.absolute_path("#{basepath}.#{fmt}") if File.exist?("#{basepath}.#{fmt}")
      return File.absolute_path(Dir["#{basepath}.*"][0]) unless Dir["#{basepath}.*"].empty?

      raise
    rescue RuntimeError
      halt 500, 'Failed to download from the url'
    end
  end
end
