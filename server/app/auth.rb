class MainApp
  set(:auth) do |role|
    condition do
      case role
      when :user
        return true if @user
      end
      halt 401
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
    @user = session[:uid] && User[session[:uid]]
  end
end
