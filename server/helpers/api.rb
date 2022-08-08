module APIHelpers
  def halt_with_message(code, message = nil)
    unless message
      message = code
      code = 200
    end
    body({ message: message })
    halt code
  end

  def halt_with_error(code, errors = nil)
    unless errors
      errors = code
      code = 200
    end
    body({ errors: errors })
    halt code
  end
end
