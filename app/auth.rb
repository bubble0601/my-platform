class MainApp
  set(:auth) do |role|
    condition do
      case role
      when :user
        return true if @user
      end
      if @is_api
        halt 403, 'Unauthorized'
      else
        halt 403
      end
    end
  end

  # ゲストユーザーはデフォルトでPUTとDELETE禁止
  class << self
    def put(path, opts = {}, &block)
      opts[:auth] = :user if opts[:auth].nil?
      super(path, opts, &block)
    end

    def delete(path, opts = {}, &block)
      opts[:auth] = :user if opts[:auth].nil?
      super(path, opts, &block)
    end
  end

  before do
    @is_api = request.path.start_with?('/api')
    @user = session[:uid] && User[session[:uid]]
  end
end
