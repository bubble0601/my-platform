class MainApp
  namespace '/api/music/playlists' do
    get '' do
      Playlist.order(:id).all.map{ |list| list.slice(:id, :name) }
    end

    post '' do
      new_list = Playlist.create(name: @json[:name])
      new_list.to_hash
    end

    get '/:id/songs' do
      items = PlaylistSong.select(:song_id, :weight).where(playlist_id: params[:id].to_i).all
      w_items = {}
      items.each{ |e| w_items[e.song_id] = e.weight }

      Song.eager_graph(:album, :artist)
          .where(Sequel[:songs][:id] => w_items.keys)
          .order{ artist[:ruby] }
          .order_append{ artist[:name] }
          .order_append{ album[:year] }
          .order_append{ album[:title] }
          .order_append(:track_num, :title)
          .map(&method(:song_to_hash))
          .map{ |s| s[:weight] = w_items[s[:id]]; s }
    end

    post '/:id/songs' do
      list = Playlist[params[:id].to_i]
      halt 404 if list.nil?
      errors = []
      @json.each do |id|
        list.add_song(id)
      rescue Sequel::ValidationFailed
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
      halt 404 if song.nil?
      song_to_hash(song).merge({ weight: ps.weight })
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
      halt 404 if song.nil? || pl.nil?
      pl.remove_song(song)
      status 204
    end
  end
end
