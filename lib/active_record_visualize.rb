require "active_record_visualize/engine"

module ActiveRecordVisualize
  class << self
    attr_accessor :mounted_at, :layouter, :simple_table_page_size, :object_table_column_num, :auto_fit

    def configure
      yield self
    end

    def use_defaults!
      configure do |config|
        config.mounted_at   = '/active_record_visualize'
        config.layouter     = 'LevelLayouter'
        config.simple_table_page_size    = 20
        config.object_table_column_num   = 2
        config.auto_fit     = true
      end
    end
  end
end

ActiveRecordVisualize.use_defaults!