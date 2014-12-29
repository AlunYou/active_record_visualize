$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "active_record_visualize/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "active_record_visualize"
  s.version     = ActiveRecordVisualize::VERSION
  s.authors     = ["AlunYou"]
  s.email       = ["xianlun.you@autodesk.com"]
  s.homepage    = "http://www.xx.com"
  s.summary     = "ActiveRecordVisualize could visualize all records in active record."
  s.description = "ActiveRecordVisualize could visualize all records in active record."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.1.4"
  s.add_dependency 'jbuilder', '~> 2.0'
  s.add_dependency "jquery-rails"

  s.add_development_dependency "sqlite3"
  s.add_development_dependency 'rspec-rails'
  s.add_development_dependency 'factory_girl_rails'
end
