require 'csv'

namespace :data do
  desc "Added GDP data to the database"
  task :populate_db => :environment do

    require 'csv'

    file = File.open("data.csv", "r:ISO-8859-1")
    csv = CSV.parse(file, headers: :first_row)

    countries = csv[0].to_a

    count = 1
    skipped = 0
    countries.each do |country|
       country = country[0]
        if country.nil?
            skipped += 1
            next
        end
        #p country
        #p count
        c = Region.create(name: country.strip)
        csv.each do |row|
            year = row[0]
            gdp = row[count]
            #p year
            #p gdp
            c.incomes.create(year: year, gdp: gdp)
        end
        count += 1
    end
    p "Skipped #{skipped}"
  end
end