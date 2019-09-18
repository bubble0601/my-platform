module APIHelpers
  def halt(*res)
    if res.length == 2 and Integer === res[0] and String === res[1]
      super(res[0], { error_message: res[1] })
    else
      super(*res)
    end
  end
end
