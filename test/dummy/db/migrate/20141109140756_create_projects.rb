class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|

      t.string :name
      t.string :description
      t.datetime :start_date
      t.datetime :end_date
      t.integer  :size
      t.float    :value

      t.timestamps
    end
  end
end
