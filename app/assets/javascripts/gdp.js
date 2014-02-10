window.GDP = {

    chartOptions: {
        chart: {
            renderTo: 'chart',
            type: 'line',
            //backgroundColor: '#F2F1ED',
            borderColor: '#000000',
            borderWidth: 1,
            height: 500
        },
        title: {
            text: null
        },
        series: window.dataToLoad,
        xAxis: {
            title: {
                text: 'Year',
                margin: 18
            },
            labels: {
                y: 20
            }
        },
        yAxis: {
            title: {
                text: 'GDP/capita 1990 USD',
                margin: 15
            },
            type: 'linear',
            labels: {
                formatter: function() {return '$' + Highcharts.numberFormat(this.value,0);},
                x: -6,
                y: 4
            },
            min: 1
        },
        colors: [
            '#FF851B',
            '#001F3F'
        ],
        plotOptions: {
            line: {
                marker: {
                    enabled: false
                },
                tooltip: {
                    valuePrefix: '$'
                }
            }
        },
        legend: {
            align: 'center',
            verticalAlign: 'top',
            y: 0,
        },
        tooltip: {
            crosshairs: true
        },
        exporting: {
            buttons: {
                contextButton: {
                    text: 'Export'
                }
            }
        }
    },

    initialize: function() {
        var self = this;

        // Add event listeners
        $('#countryForm').on('submit', function(event) {
            event.preventDefault();
            self.fetchData(event);
        });

        var $scale = $('.logScale input');

        $scale.on('change', function(event) {
            self.toggelLogScale(event.target.checked);
        });

        // If the deep-link has log scale, set that before the chart renders
        if ($scale.is(':checked')) {
            this.chartOptions.yAxis.type = 'logarithmic';
        }

        // Add autocompletes to the inputs
        $('.countries').autocomplete({
            source: window.countries
        });

        // Setup the World GDP chart
        this.chart = new Highcharts.Chart(this.chartOptions);
    },

    fetchData: function(event) {
        var $form = $(event.target),
            $inputs = $form.children('input');

        // Make sure people aren't comparing the same region
        if ($inputs[0].value == false && $inputs[1].value == false) {
            alert('Please enter at least one region');
            return false;
        }
        else if ($inputs[0].value === $inputs[1].value) {
            alert('You cannot compare the same region');
            return false;
        }
        $.ajax({
            url: '/get_data',
            dataType: 'json',
            data: 'regions=' + $inputs[0].value + ',' + $inputs[1].value,
            context: this,
            success: this.success,
            error: this.error
        });
    },

    success: function(data, status) {
        this.addData(data);
        var title, queryParams;
        if (data.length > 1) {
            title = 'GDP Comparisons: ' + data[0].name + ' vs. ' + data[1].name;
            queryParams = '?regions=' + data[0].name + ',' + data[1].name;
        } else {
            title = 'GDP Comparisons: ' + data[0].name;
            queryParams = '?regions=' + data[0].name;
        }
        $('title')[0].innerHTML = title;
        history.pushState({}, document.title, queryParams);
    },

    error: function(jqXHR, textStatus, error) {

    },

    addData: function(data) {
        var self = this;
        while (self.chart.series.length > 0) {
            self.chart.series[0].remove(false);
        }
        data.forEach(function(series) {
            self.chart.addSeries({
                name: series.name,
                data: series.data
            }, false, false);
        });
        self.chart.redraw();
    },

    toggelLogScale: function(value) {
        switch (value) {
            case true:
                this.chart.yAxis[0].update({type: 'logarithmic'});
                history.pushState({}, document.title, window.location.search + '&scale=log');
                break;
            case false:
                this.chart.yAxis[0].update({type: 'linear'});
                history.pushState({}, document.title, window.location.search.replace('&scale=log', ''));
                break;
        }
    }
};

$(function(){window.GDP.initialize();});
