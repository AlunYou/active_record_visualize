class User < ActiveRecord::Base
  belongs_to :account
  has_many :project_users
  has_many :projects, through: :project_users
end
