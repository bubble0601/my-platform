require 'sinatra'
require 'logger'
require 'pp' if development?

ROOT = File.join(File.dirname(__FILE__), '..')
ENV['RACK_ENV'] ||= 'development'

Logger.new($stdout).info("Starting application in #{ENV['RACK_ENV']} mode...")

require_relative './util'
require_relative './config'
require_relative '../models/init'
require_relative './app'
require_relative './auth'
require_relative './logger'
require_relative '../helpers/init'
require_relative '../routes/init'
