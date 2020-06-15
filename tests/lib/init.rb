require 'minitest/autorun'

class TestBase < Minitest::Test
  def assert_equal(actual, expected, message = nil)
    super(expected, actual, message)
  end
end
