# encoding: utf-8
require_relative './memory'
require_relative './redis'
require_relative './sequel'

module DataRepository
  module Backend
    class Detector
      def initialize(backend_or_connection=nil)
        @backend_or_connection = backend_or_connection
      end #initialize

      def detect
        # TYPE CHECKING OMG!! SEND THE CRAFTSMANSHIPTROOPERS!!
        return backend_or_connection                      if is_backend?
        return Backend::Redis.new(backend_or_connection)  if is_redis?
        return Backend::Sequel.new(backend_or_connection) if is_sequel?
        return default_backend
      end #detect

      private

      attr_reader :backend_or_connection

      def default_backend
        Backend::Memory.new
      end #default_backend

      def is_backend?
        !!(backend_or_connection.class.name =~ /^DataRepository::Backend/)
      end #is_backend?

      def is_redis?
        backend_or_connection.respond_to? :zremrangebyscore
      end #is_redis?

      def is_sequel?
        backend_or_connection.respond_to? :supports_create_table_if_not_exists?
      end
    end # Detector
  end # Backend
end # DataRepository

