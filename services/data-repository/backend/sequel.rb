# encoding: utf-8
module DataRepository
  module Backend
    class Sequel
      def initialize(sequel=Sequel.sqlite)
        @sequel = sequel
      end

      def store(key, data, options={})
      end #store

      def fetch(key, options={})
      end #fetch

      private

      attr_accessor :sequel
    end # Memory
  end # Backend
end # DataRepository

