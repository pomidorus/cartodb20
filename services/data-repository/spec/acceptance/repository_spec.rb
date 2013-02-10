# encoding: utf-8
require 'minitest/autorun'
require 'redis'
require 'sequel'
require_relative '../spec_helper'
require_relative '../../repository'

describe DataRepository do
  describe 'DataRepository.new' do
    it 'instantiates a repository with a memory backend' do
      repository = DataRepository.new
      repository.must_be_instance_of DataRepository::Repository
      repository.backend.must_be_instance_of DataRepository::Backend::Memory
    end

    it 'instantiates a repository with a Redis backend
    if a redis connection is passed' do
      repository = DataRepository.new(Redis.new)
      repository.must_be_instance_of DataRepository::Repository
      repository.backend.must_be_instance_of DataRepository::Backend::Redis
    end

    it 'instantiates a repository with a Sequel backend
    if a redis connection is passed' do
      repository = DataRepository.new(Sequel.sqlite)
      repository.must_be_instance_of DataRepository::Repository
      repository.backend.must_be_instance_of DataRepository::Backend::Sequel
    end
  end # DataRepository.new 
end # DataRepository

