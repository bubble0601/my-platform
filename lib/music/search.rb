require './helpers/util'

module Lyrics
  extend UtilityHelpers

  module_function
  def search(title, artist)
    search_methods = [
      :search_az,
      :search_musix,
      :search_jlyric,
      :search_utaten,
      :search_mojim,
    ]
    results = []
    threads = search_methods.map{|s| async_exec{ method(s).call(results, title, artist) }}
    threads.each { |t| t.join(10) if t }
    results.sort_by{|r| r[:text] == 'mojim.com' ? 1 : 0}
  end

  def search_az(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = URI.escape("https://search.azlyrics.com/search.php?q=#{q}")

    doc = get_doc(url)
    links = doc.css('td a:not(.btn)')
    link = nil
    links.each do |l|
      if l['href'] and l['href'].start_with?('https://www.azlyrics.com/lyrics')
        link = l
        break
      end
    end
    return unless link

    doc = get_doc(link['href'])
    body = nil
    divs = doc.css('div.main-page > div > div > div')
    divs.each do |div|
      if div.children.length > 1 and div.children[1].comment? and div.children[1].text.strip.start_with?('Usage')
        body = div
        break
      end
    end
    return unless body

    lyrics = body.children.to_a.filter{|e| e.text?}.map{|e| e.text}.join("\n").strip.gsub("\r", '').gsub("\n\n", "\n")
    results.push({ text: 'azlyrics.com', value: lyrics })
  end

  def search_musix(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = URI.escape("https://www.musixmatch.com/search/#{q}")

    doc = get_doc(url)
    link = doc.css('a.title')[0]
    return unless link

    doc = get_doc("https://www.musixmatch.com#{link['href']}")
    body = doc.css('.mxm-lyrics .mxm-lyrics')[0]
    return unless body

    lyrics = body.children.map{|e| (e.css('.mxm-lyrics__content span').map{|e| e.text}.join("\n") rescue nil) }.filter{|e| not e.nil?}.join.strip.gsub("\r", '')
    results.push({ text: 'musixmatch.com', value: lyrics }) unless lyrics.empty?
  end

  def search_jlyric(results, title, artist)
    if artist
      url = URI.escape("http://search.j-lyric.net/index.php?kt=#{title}&ct=2&ka=#{artist}&ca=2")
    else
      url = URI.escape("http://search.j-lyric.net/index.php?kt=#{title}&ct=2")
    end

    doc = get_doc(url)
    link = doc.css('div#mnb .bdy .mid a')[0]
    return unless link

    doc = get_doc(link['href'])
    body = doc.css('p#Lyric')[0]
    return unless body

    lyrics = body.children.to_a.filter{|e| e.text? or (e.element? and e.name == 'br')}.map{|e| e.text? ? e.text : "\n"}.join("\n").strip.gsub("\r", '').gsub("\n\n", "\n").gsub("\n\n", "\n")
    results.push({ text: 'j-lyric.net', value: lyrics })
  end

  def search_utaten(results, title, artist)
    if artist
      url = URI.escape("https://utaten.com/search/artist_name=#{artist}/title=#{title}")
    else
      url = URI.escape("https://utaten.com/search//title=#{title}")
    end
    doc = get_doc(url)
    link = doc.css('table .searchResult__title a')[0]
    return unless link

    doc = get_doc('https://utaten.com/' + link['href'])
    body = doc.css('.lyricBody .hiragana')[0]
    return unless body

    lyrics = body.children.to_a
                 .filter{|e| e.text? or e['class'] == 'ruby' or e.name == 'br'}
                 .map{|e| e.text? ? e.text : (e.name == 'br' ? "\n" : e.css('.rb')[0].text)}
                 .join.strip.gsub("\r", '').gsub("\n\n", "\n")
    results.push({ text: 'utaten.com', value: lyrics })
  end

  def search_mojim(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = URI.escape("http://mojim.com/#{q}.html?j4")

    doc = get_doc(url)
    link = doc.css('table.iB .mxsh_ss3 a')[0]
    return unless link

    doc = get_doc("http://mojim.com#{link['href']}")
    body = doc.css('#fsZx1')[0]
    return unless body

    flag = false
    lyrics = body.children.to_a.filter{|e|
      flag = true if e['id'] == 'fsZx2'
      flag and ((e.text? and not e.text.include?('Mojim.com')) or e.name == 'br')
    }.map{|e| e.text? ? e.text : "\n"}.join.strip.gsub("\r", '')
    results.push({ text: 'mojim.com', value: lyrics} )
  end
end

module Artwork
  extend UtilityHelpers

  module_function
  def search(title, album, artist)
    results = []
    threads = [
      async_exec{ search_genius(results, (title or album), artist) },
      async_exec{ search_yahoo(results, (album or title), artist) },
    ]
    threads.each { |t| t.join(10) if t }
    results
  end

  def search_more(title, album, artist, page)
    results = []
    threads = [
      async_exec{ search_yahoo(results, (album or title), artist, page) },
    ]
    threads.each { |t| t.join(10) if t }
    results
  end

  def search_genius(results, title, artist)
    q = [title, artist].filter(&:itself).join(' ')
    url = URI.escape("https://api.genius.com/search?q=#{q}")
    json = get_json(url, { 'Authorization': "Bearer #{CONF.app.genius_access_token}" })
    images = json['response']['hits'].map{|h| h['result']['header_image_thumbnail_url']}
    results.push(*images)
  end

  # def search_google(results, title, artist)
  #   q = [title, artist].filter(&:itself).join(' ')
  #   url = URI.escape("https://www.google.com/search?q=#{q}&tbm=isch")

  #   doc = get_doc(url)
  # end

  def search_yahoo(results, title, artist, page = 0)
    q = [title, artist].filter(&:itself).join(' ')
    b = page * 20 + 1
    url = URI.escape("https://search.yahoo.co.jp/image/search?p=#{q}&b=#{b}")

    doc = get_doc(url)
    images = doc.css('div#gridlist img').to_a.map{|e| e['src']}
    results.push(*images)
  end
end
