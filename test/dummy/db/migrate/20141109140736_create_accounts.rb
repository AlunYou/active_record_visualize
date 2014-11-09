class CreateAccounts < ActiveRecord::Migration
  def change
    create_table :accounts do |t|

      t.string :name
      t.string :description
      t.datetime :start_date
      t.datetime :end_date
      t.integer  :size

      t.timestamps
    end
  end
end
