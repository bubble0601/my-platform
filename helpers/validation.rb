module ValidationHelpers
  def validates(obj, *keys, halt: nil, **opts)
    raise if obj.nil? or not Hash === obj
    keys.each{|k| raise unless obj.key?(k)}
    return true
  rescue
    if halt == false
      return false
    else
      halt 401, 'Invalid Request'
    end
  end
end
