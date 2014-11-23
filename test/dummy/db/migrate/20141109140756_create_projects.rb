class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|

      t.string :name
      t.string :description
      t.string :status
      t.datetime :start_date
      t.datetime :end_date
      t.integer  :size
      t.float    :value

      t.integer :account_id

      t.timestamps
    end
  end
end
