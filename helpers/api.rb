module APIHelpers
  def halt(*res)
    if res.length == 2 && res[0].is_a?(Integer) && res[1].is_a?(String)
      super(res[0], { error_message: res[1] })
    else
      super(*res)
    end
  end
end
