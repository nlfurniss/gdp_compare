class PagesController < ApplicationController
    before_action :prep_regions

    def index
        @title = 'GDP Comparison'
        @countries = Region.pluck(:name)
        @scale = params[:scale]
        @query_params = ''

        if @regions
            @response = query_data(@regions)
            @title += ': ' + @regions.join(' vs. ')
            @query_params = '?regions=' + params[:regions]
            p @query_params
        else
            @response = {errors: [], figures: [{name: "Total World", data: Region.find_by_name("Total World").incomes.where("gdp > 0").pluck(:year, :gdp)}]}
        end

        @response = @response.to_json
    end

    def get_data
        @response = query_data(@regions)
        render json: @response
    end

    private

    def prep_regions
        @regions = params[:regions].blank? ? nil : params[:regions].gsub(/^,/, '').split(',')
    end

    def query_data(regions)
        response = {errors: [], figures: []}
        @regions.each do |region|
            data = Region.where("name ilike ?", "%#{region}%").first.try(:incomes).where("gdp > 0").pluck(:year, :gdp) rescue []
            response[:errors].push("No data found for " + region + "\n") if data.blank?
            response[:figures].push({name: region, data: data})
        end
        response
    end

end