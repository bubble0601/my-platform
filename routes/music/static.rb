class MainApp
  namespace '/static/music' do
    get '/:digest/:name' do
      path = Song.get_path(params[:digest], params[:name])
      halt 404 if path.nil?
      send_file path
    end

    # TODO: make it stateless
    get '/temp/:digest/:name' do
      cache_control :no_store
      reset = params[:reset] == 'true'
      path = "#{CONF.storage.temp}/#{params[:digest]}"
      if reset
        input_path = Song.get_path(params[:digest], params[:name]) if reset
        output_path = "#{path}.mp3"
      else
        input_path = "#{path}.mp3"
        output_path = "#{path}_2.mp3"
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
      # when 'norm'
      #   cmd = ['sox', input_path, output_path, 'gain', '-n', '-1']
      #   exec_command(cmd)
      #   FileUtils.move(output_path, input_path) unless reset
      when 'download'
        youtube_dl(params[:url], "#{path}.tmp.%(ext)s")
        exec_command(cmd)
        FileUtils.move("#{path}.tmp.mp3", "#{path}.mp3")
        FileUtils.rm(Dir["#{path}.tmp.*"])
      end
      send_file "#{path}.mp3"
    end

    post '/temp/:digest/:name' do
      path = "#{CONF.storage.temp}/#{params[:digest]}.mp3"
      f = params[:file]
      FileUtils.move(f[:tempfile].path, path)
      send_file path
    end
  end
end
