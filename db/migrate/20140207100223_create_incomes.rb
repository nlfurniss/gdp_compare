class CreateIncomes < ActiveRecord::Migration
  def change
    create_table :incomes do |t|
      t.integer :year
      t.integer :gdp

      t.timestamps
    end
  end
end
