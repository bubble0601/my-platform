class MainApp
  namespace '/api/music/smartlists' do
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
        { id: 9, name: 'No lyrics' },
        { id: 10, name: 'No artwork' },
      ]
    end

    get '/:id/songs' do
      query = Song.eager_graph(:album, :artist)
                  .order{ artist[:ruby] }
                  .order_append{ artist[:name] }
                  .order_append{ album[:year] }
                  .order_append{ album[:title] }
                  .order_append(:track_num, :title)
      case params[:id]
      when '1'
        query = query.where(Sequel.lit('DATE_ADD(songs.created_at, INTERVAL 7 DAY) > NOW()'))
                     .order_prepend(:created_at).reverse
      when '2'
        query = query.where(Sequel.lit('DATE_ADD(songs.created_at, INTERVAL 30 DAY) > NOW()'))
                     .order_prepend(:created_at).reverse
      when '3'
        query = query.order_prepend(:created_at).reverse.limit(100)
      when '4'
        query = query.where(rate: 5)
      when '5'
        query = query.where{ rate >= 4 }
      when '6'
        query = query.where{ rate >= 3 }
      when '7'
        query = query.where{ rate >= 2 }
      when '8'
        query = query.where(rate: 0)
      when '9'
        query = query.where(has_lyric: false)
      when '10'
        query = query.where(has_artwork: false)
      end
      query.map(&method(:to_song_data))
    end
  end
end
