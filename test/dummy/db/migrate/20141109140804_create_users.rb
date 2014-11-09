class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|

      t.string :name
      t.string :gender
      t.datetime :birth_date
      t.integer  :age
      t.float    :money

      t.timestamps
    end
  end
end
