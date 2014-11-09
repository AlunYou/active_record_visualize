class Account < ActiveRecord::Base

  has_many :projects, dependent: :destroy
  has_many :users, dependent: :destroy
end
