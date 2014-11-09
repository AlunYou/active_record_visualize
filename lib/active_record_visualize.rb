require "active_record_visualize/engine"

module ActiveRecordVisualize
  class << self
    attr_accessor :mounted_at

    def configure
      yield self
    end

    def use_defaults!
      configure do |config|
        config.mounted_at   = '/active_record_visualize'
      end
    end
  end
end

ActiveRecordVisualize.use_defaults!