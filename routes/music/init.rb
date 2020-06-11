require './lib/music/search'

class MainApp
  namespace '/api/music' do
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
        url = CGI.escape("https://musicbrainz.org/ws/2/recording?query=title:#{title} AND artist:#{artist}&fmt=json")
        get_json(url, { 'User-Agent' => "#{CONF.app.name}/1.0.0" })
      end
    end
  end
end

Dir.glob('*.rb', base: __dir__).sort.each{ |f| require_relative f }
