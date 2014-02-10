class PagesController < ApplicationController
    before_action :return_regions

    def index
        if @regions
            @regions.split(',').each do |region|
                data = Region.find_by_name(region).incomes.where("gdp > 0").pluck(:year, :gdp)
                @response.push({name: region, data: data})
            end
        else
            @countries = Region.pluck(:name)
            @world_gdp = Region.find_by_name("Poland").incomes.where("gdp > 0").pluck(:year, :gdp)
        end
    end

    def get_data
        @response = []
        @regions.gsub(/^,/, '').split(',').each do |region| #.gsub!(/^,/, '')
            data = Region.find_by_name(region).incomes.where("gdp > 0").pluck(:year, :gdp)
            @response.push({name: region, data: data})
        end
        render json: @response
    end

    private

    def return_regions
        @regions = params[:regions].blank? ? nil : params[:regions]
    end

end