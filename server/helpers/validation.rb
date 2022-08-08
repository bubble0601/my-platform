module ValidationHelpers
  def validates(obj, *keys, halt: nil, **opts)
    raise if obj.nil? || !obj.is_a?(Hash)

    keys.each{ |k| raise unless obj.key?(k) }
    true
  rescue RuntimeError
    return false if halt == false

    halt 400, 'Invalid Request'
  end

  def validates_presence(obj, *keys, halt: nil)
    errors = []
    raise if obj.nil? || !obj.is_a?(Hash)

    keys.each{ |k| errors.push(k, 'cannot be empty') unless obj.key?(k) }
    true
  rescue RuntimeError
    return false if halt == false

    halt 400, 'Invalid Request'
  end
end
