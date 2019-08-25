require 'yaml'

# yamlからロードしたHashの値をメソッドでも取得できるようにする
# e.g.) CONF['db'] === CONF.db
CONF = YAML.load_file('conf.yml')
hash_method_define = Proc.new do |obj|
  obj.each do |k, v|
    if(v.kind_of?(Hash))
      child = obj[k]
      hash_method_define.call(child)
      obj.define_singleton_method(k) { child }
    else
      obj.define_singleton_method(k) { v }
    end
  end
end
hash_method_define.call(CONF)
CONF.freeze
