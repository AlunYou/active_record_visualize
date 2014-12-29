module ActiveRecordVisualize
  class Engine < ::Rails::Engine
    isolate_namespace ActiveRecordVisualize
  end
end




module ActiveRecordVisualize
  class Engine < ::Rails::Engine
    isolate_namespace ActiveRecordVisualize

    engine_name 'active_record_visualize'

    #this is a fix for jquery-rails and jbuilder won't work
    require 'jquery-rails'
    require 'jbuilder'

    initializer 'active_record_visualize.precompile_assets' do |app|
      app.config.assets.precompile += %w{ active_record_visualize/viewer.js}
      app.config.assets.precompile += %w{ active_record_visualize/viewer.css}
    end

    #load all helpers and decorators
    config.to_prepare do
      Dir.glob(ActiveRecordVisualize::Engine.root + "app/helpers/**/*_helper*.rb").each do |c|
        require_dependency(c)
      end
    end

    config.to_prepare do
      Dir.glob(ActiveRecordVisualize::Engine.root + "app/decorators/**/*_decorator*.rb").each do |c|
        require_dependency(c)
      end
    end


    config.generators do |g|
      g.test_framework :rspec
      g.fixture_replacement :factory_girl, :dir => 'spec/factories'
    end

  end
end
