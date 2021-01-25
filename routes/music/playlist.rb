using Sequel::SymbolAref

class MainApp
  namespace '/api/music/playlists' do
    helpers do
      def fetch_playlist(id)
        list = Playlist[id.to_i]
        halt 404, 'Playlist not found' if list.nil?
        halt 403 if list.user_id != @user.id
        list
      end
    end

    get '' do
      Playlist.where(user_id: @user.id)
              .order(:id)
              .map{ |list| list.slice(:id, :name) }
    end

    post '' do
      new_list = Playlist.create(name: @json[:name], user_id: @user.id)
      new_list.to_hash
    end

    get '/:id/songs' do
      items = PlaylistSong.eager_graph(:playlist)
                          .where(user_id: @user.id)
                          .select(:song_id, :weight)
                          .where(playlist_id: params[:id].to_i)
                          .all
      w_items = {}
      items.each{ |e| w_items[e.song_id] = e.weight }

      Song.where(:songs[:user_id] => @user.id)
          .eager_graph(:album, :artist)
          .where(Sequel[:songs][:id] => w_items.keys)
          .default_order
          .map(&method(:song_to_hash))
          .map{ |s| s[:weight] = w_items[s[:id]]; s }
    end

    post '/:id/songs' do
      list = fetch_playlist(params[:id])
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
      halt 403 if song.user_id != @user.id
      song_to_hash(song).merge({ weight: ps.weight })
    end

    put '/:id/songs/:sid' do
      pid = params[:id].to_i
      sid = params[:sid].to_i
      ps = PlaylistSong.first(playlist_id: pid, song_id: sid)
      halt 404 if ps.nil?
      halt 403 if Playlist[pid].user_id != @user.id
      ps.update(@json)
      status 204
    end

    delete '/:id/songs/:sid' do
      song = Song[params[:sid].to_i]
      pl = Playlist[params[:id].to_i]
      halt 404 if song.nil? || pl.nil?
      halt 403 if pl.user_id != @user.id
      pl.remove_song(song)
      status 204
    end
  end
end
