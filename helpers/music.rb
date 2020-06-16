module MusicHelpers
  def song_to_hash(song)
    # rubocop:disable Style/RescueModifier
    {
      id: song[:id],
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
      year: (song.album&.year rescue song[:year]),
      rate: song[:rate],
      created_at: song[:created_at].strftime('%Y/%m/%d %H:%M'),
    }
    # rubocop:enable Style/RescueModifier
  end

  def to_col(field)
    case field
    when 'title' then Sequel[:songs][:title]
    when 'artist' then :artist_name
    when 'album' then Sequel[:album][:title]
    when 'album_artist' then Sequel[:artist][:name]
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
