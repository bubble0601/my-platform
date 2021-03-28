require 'sinatra'
require 'logger'

ROOT = File.join(File.dirname(__FILE__), '..')
ENV['RACK_ENV'] ||= 'development'

require_relative './util'
require_relative './config'
require_relative '../models/init'
require_relative './app'
require_relative './auth'
require_relative './logger'
require_relative '../helpers/init'
require_relative '../routes/init'
