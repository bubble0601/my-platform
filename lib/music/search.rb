require './helpers/util'

module Lyrics
  extend UtilityHelpers

  module_function

  def search(title, artist)
    search_methods = %i[
      search_az
      search_musix
      search_jlyric
      search_utaten
      search_mojim
    ]
    results = []
    threads = search_methods.map{ |s| async_exec{ method(s).call(results, title, artist) } }
    threads.each do |t|
      t&.join(10)
    rescue StandardError => e
      p e
    end
    results.sort_by{ |r| r[:text] == 'mojim.com' ? 1 : 0 }
  end

  def search_az(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = 'https://search.azlyrics.com/search.php?' + URI.encode_www_form(q: q)

    doc = get_doc(url)
    links = doc.css('td a:not(.btn)')
    link = nil
    links.each do |l|
      if l['href']&.start_with?('https://www.azlyrics.com/lyrics')
        link = l
        break
      end
    end
    return unless link

    doc = get_doc(link['href'])
    body = nil
    divs = doc.css('div.main-page > div > div > div')
    divs.each do |div|
      if div.children.length > 1 && div.children[1].comment? && div.children[1].text.strip.start_with?('Usage')
        body = div
        break
      end
    end
    return unless body

    lyrics = body.children.to_a.filter(&:text?).map(&:text).join("\n").strip.gsub("\r", '').gsub("\n\n", "\n")
    results.push({ text: 'azlyrics.com', value: lyrics })
  end

  def search_musix(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = 'https://www.musixmatch.com/search/' + CGI.escape(q).gsub('+', '%20')

    doc = get_doc(url)
    link = doc.css('a.title')[0]
    return unless link

    doc = get_doc("https://www.musixmatch.com#{link['href']}")
    body = doc.css('.mxm-lyrics .mxm-lyrics')[0]
    return unless body

    # rubocop:disable Style/RescueModifier
    lyrics = body.children.map{ |e| e.css('.mxm-lyrics__content span').map(&:text).join("\n") rescue nil }
                 .delete_if(&:nil?).join.strip.gsub("\r", '')
    # rubocop:enable Style/RescueModifier
    results.push({ text: 'musixmatch.com', value: lyrics }) unless lyrics.empty?
  end

  def search_jlyric(results, title, artist)
    url = if artist
            'http://search.j-lyric.net/index.php?' + URI.encode_www_form(kt: title, ct: 2, ka: artist, ca: 2)
          else
            'http://search.j-lyric.net/index.php?' + URI.encode_www_form(kt: title, ct: 2)
          end

    doc = get_doc(url)
    link = doc.css('div#mnb .bdy .mid a')[0]
    return unless link

    doc = get_doc(link['href'])
    body = doc.css('p#Lyric')[0]
    return unless body

    lyrics = body.children.to_a.filter{ |e| e.text? || (e.element? && e.name == 'br') }
                 .map{ |e| e.text? ? e.text : "\n" }
                 .join("\n").strip.gsub("\r", '').gsub("\n\n", "\n").gsub("\n\n", "\n")
    results.push({ text: 'j-lyric.net', value: lyrics })
  end

  def search_utaten(results, title, artist)
    url = if artist
            'https://utaten.com/search?' + URI.encode_www_form(artist_name: artist, title: title)
          else
            'https://utaten.com/search?' + URI.encode_www_form(title: title)
          end
    doc = get_doc(url)
    link = doc.css('table .searchResult__title a')[0]
    return unless link

    doc = get_doc('https://utaten.com/' + link['href'])
    body = doc.css('.lyricBody .hiragana')[0]
    return unless body

    elm2text = proc do |e|
      if e.text?
        e.text
      else
        e.name == 'br' ? "\n" : e.css('.rb')[0].text
      end
    end
    lyrics = body.children.to_a
                 .filter{ |e| e.text? || e['class'] == 'ruby' || e.name == 'br' }
                 .map{ |e| elm2text.call(e) }
                 .join.strip.gsub("\r", '').gsub("\n\n", "\n")
    results.push({ text: 'utaten.com', value: lyrics })
  end

  def search_mojim(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = 'http://mojim.com/' + CGI.escape(q) + '.html?j4'

    doc = get_doc(url)
    link = doc.css('table.iB .mxsh_ss3 a')[0]
    return unless link

    doc = get_doc("http://mojim.com#{link['href']}")
    body = doc.css('#fsZx1')[0]
    return unless body

    flag = false
    filtered_elements = body.children.to_a.filter do |e|
      flag = true if e['id'] == 'fsZx2'
      flag && ((e.text? && !e.text.include?('Mojim.com')) || e.name == 'br')
    end
    lyrics = filtered_elements.map{ |e| e.text? ? e.text : "\n" }.join.strip.gsub("\r", '')
    results.push({ text: 'mojim.com', value: lyrics })
  end
end

module CoverArt
  extend UtilityHelpers

  module_function

  def search(title, album, artist, page = 0)
    results = []
    threads = [
      # async_exec{ search_genius(results, (title or album), artist) },
      async_exec{ search_yahoo(results, (album or title), artist, page) },
    ]
    threads.each{ |t| t&.join(10) }
    results
  end

  # def search_genius(results, title, artist)
  #   q = [title, artist].filter(&:itself).join(' ')
  #   url = 'https://api.genius.com/search?' + URI.encode_www_form(q: q)
  #   json = get_json(url, { 'Authorization': "Bearer #{CONF.app.genius_access_token}" })
  #   images = json['response']['hits'].map{ |h| h['result']['header_image_thumbnail_url'] }
  #   results.push(*images)
  # end

  # def search_google(results, title, artist)
  #   q = [title, artist].filter(&:itself).join(' ')
  #   url = URI.escape("https://www.google.com/search?q=#{q}&tbm=isch")

  #   doc = get_doc(url)
  # end

  def search_yahoo(results, title, artist, page = 0)
    q = [title, artist].filter(&:itself).join(' ')
    b = page * 20 + 1
    url = 'https://search.yahoo.co.jp/image/search?' + URI.encode_www_form(p: q, b: b)

    doc = get_doc(url)
    images = doc.css('div#gridlist img').to_a.map{ |e| e['src'] }
    results.push(*images)
  end
end
