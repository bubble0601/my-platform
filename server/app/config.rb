require 'yaml'

# yamlからロードしたHashの値をメソッドでも取得できるようにする
# e.g.) CONF['db'] == CONF.db
def hash_method_define(obj)
  obj.each do |k, v|
    if v.is_a?(Hash)
      child = obj[k]
      hash_method_define(child)
      obj.define_singleton_method(k){ child }
    else
      obj.define_singleton_method(k){ v }
    end
  end
end

CONF = YAML.load_file(File.join(__dir__, '../../conf.yml'))
hash_method_define(CONF)
CONF.freeze
