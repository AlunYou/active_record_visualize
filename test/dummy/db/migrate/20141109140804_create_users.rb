class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|

      t.string :name
      t.string :email
      t.string :gender
      t.datetime :birth_date
      t.integer  :age
      t.float    :money
      t.string :status

      t.integer :account_id

      t.timestamps
    end
  end
end
