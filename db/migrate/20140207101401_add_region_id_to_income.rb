class AddRegionIdToIncome < ActiveRecord::Migration
  def change
    add_column :incomes, :region_id, :integer
  end
end
