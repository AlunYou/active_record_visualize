class CreateProjectUsers < ActiveRecord::Migration
  def change
    create_table :project_users do |t|

      t.integer :project_id
      t.integer :user_id

      t.timestamps
    end
  end
end
