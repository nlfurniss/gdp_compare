class Region < ActiveRecord::Base
    has_many :incomes, :dependent => :destroy
end
