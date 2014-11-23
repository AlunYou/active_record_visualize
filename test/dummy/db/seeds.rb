# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

def fixture_file_upload(path, mime_type = nil, binary = false)
  if self.class.respond_to?(:fixture_path) && self.class.fixture_path
    path = File.join(self.class.fixture_path, path)
  end
  Rack::Test::UploadedFile.new(path, mime_type, binary)
end

def gen_image_url(file)
  file_path = Rails.root.join(Rails.root.join('db', 'seed_resources', file))
  chunk = fixture_file_upload(file_path, 'image/png', true)
  file = {}
  file['original_filename'] = chunk.original_filename
  file['content_type'] = chunk.content_type
  file['content'] = chunk.read(chunk.size)
  key = 'image-' + SecureRandom.hex(8)
  Rails.cache.write key, file, :expires_in => 1.minutes
  image_temp_path = Rails.application.routes.url_helpers.show_temp_images_path(key)
  handle = Bim::Ea::DatabaseImageHandler.new
  image_url = handle.process(image_temp_path, {})
  image_url
end

account = Account.create id: 1, name: 'account_internal',start_date: Time.parse('2012-03-12'), end_date:Time.parse('2016-03-05')

user = account.users.create name:'youx', email: 'higherone@gmail.com'
user2 = account.users.create name:'phoenix', email: 'phoenix@gmail.com'
user3 = account.users.create name:'dragon', email: 'dragon@gmail.com'
user4 = account.users.create name:'EA eng', email: 'ea.eng@autodesk.com'

enterprise_project1 = account.projects.create({ name: 'Disney Shanghai', start_date: Time.parse('2012-03-12'), end_date:Time.parse('2015-03-05'), status:'active',
                                                value:300})
enterprise_project2 = account.projects.create({ name: 'Disney Shanghai', start_date: Time.parse('2012-03-12'), end_date:Time.parse('2015-03-05'), status:'active',
                                                value:300})

project_user = ProjectUser.create user_id: user.id, project_id: enterprise_project1.id
project_user = ProjectUser.create user_id: user2.id, project_id: enterprise_project1.id

project_user = ProjectUser.create user_id: user3.id, project_id: enterprise_project2.id
project_user = ProjectUser.create user_id: user4.id, project_id: enterprise_project2.id