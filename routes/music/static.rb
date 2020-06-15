class MainApp
  namespace '/static/music' do
    helpers do
      def get_real_path(digest, name)
        song = Song.first(digest: digest)
        halt 404 if song.nil?
        halt 400 if File.basename(song.filename) != name

        song.path
      end
    end

    get '/:digest/cover.jpg' do
      song = Song.first(digest: params[:digest])
      halt 404 if song.nil?
      pic = Audio.load(song.path).tags.picture
      [200, { 'Content-Type' => pic[:mime] }, pic[:data]]
    end

    get '/:digest/cover.png' do
      song = Song.first(digest: params[:digest])
      halt 404 if song.nil?
      pic = Audio.load(song.path).tags.picture
      [200, { 'Content-Type' => pic[:mime] }, pic[:data]]
    end

    get '/:digest/:name' do
      path = get_real_path(params[:digest], params[:name])
      halt 404 if path.nil?
      send_file path
    end

    get '/temp/:digest/:name' do
      cache_control :no_store
      reset = params[:reset] == 'true'
      ext = File.extname(params[:name])[1..]
      basepath = "#{CONF.storage.temp}/#{params[:digest]}"
      if reset
        input_path = get_real_path(params[:digest], params[:name]) if reset
        output_path = "#{basepath}.#{ext}"
      else
        input_path = "#{basepath}.#{ext}"
        output_path = "#{basepath}_2.#{ext}"
      end
      halt 404 if input_path.nil? || !File.exist?(input_path)

      case params[:kind]
      when 'trim'
        params[:start] = '0' unless params[:start]
        cmd = ['ffmpeg', '-y', '-ss', params[:start]]
        cmd.push('-to', params[:end]) if params[:end]
        cmd.push('-i', input_path, '-c', 'copy', output_path)
        exec_command(cmd)
        FileUtils.move(output_path, input_path) unless reset
      # when 'noisered'
      #   noise_path = "#{path}_noise"
      #   cmd1 = ['sox', input_path, '-n', 'trim', '0', '1', 'noiseprof', noise_path]
      #   exec_command(cmd1)
      #   cmd2 = ['sox', input_path, output_path, 'noisered', noise_path, '0.21']
      #   exec_command(cmd2)
      #   FileUtils.rm(noise_path)
      #   FileUtils.move(output_path, input_path) unless reset
      when 'norm'
        cmd = ['ffmpeg', '-i', input_path]
        cmd.push('-filter:a', 'loudnorm')
        cmd.push(output_path)
        exec_command(cmd)
        FileUtils.move(output_path, input_path) unless reset
      when 'download'
        result_path = youtube_dl(params[:url], "#{basepath}.tmp")
        ext = File.extname(result_path)[1..]
        FileUtils.move(result_path, "#{basepath}.#{ext}")
        FileUtils.rm(Dir["#{basepath}.tmp.*"])
      end
      output_path = "#{basepath}.#{ext}"
      session[:music_edit_path] = output_path
      send_file output_path
    end

    post '/temp/:digest/:name' do
      f = params[:file]
      ext = File.extname(f[:tempfile].path)
      path = "#{CONF.storage.temp}/#{params[:digest]}#{ext}"
      FileUtils.move(f[:tempfile].path, path)
      session[:music_edit_path] = path
      send_file path
    end
  end
end
