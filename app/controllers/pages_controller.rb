class PagesController < ApplicationController
    before_action :prep_regions

    def index
        @title = 'GDP Comparison'
        @countries = Region.pluck(:name)
        @scale = params[:scale]

        if @regions
            query_data(@regions)
            @title += ': ' + (@regions.length > 1 ? @regions[0] + ' vs. ' + @regions[1] : @regions[0])
        else
            @response = [{name: "Total World", data: Region.find_by_name("Total World").incomes.where("gdp > 0").pluck(:year, :gdp)}]
        end

        @response = @response.to_json
    end

    def get_data
        query_data(@regions)
        render json: @response
    end

    private

    def prep_regions
        @regions = params[:regions].blank? ? nil : params[:regions].gsub(/^,/, '').split(',')
    end

    def query_data(regions)
        @response = []
        @regions.each do |region|
            data = Region.find_by_name(region.titlecase).try(:incomes).where("gdp > 0").pluck(:year, :gdp) rescue []
            @response.push({name: region, data: data})
        end
        @response
    end

end