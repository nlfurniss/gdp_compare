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
        series: window.dataToLoad.figures,
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

        // Chrome fires `popstate` event on page load (wtf?!)
        // Workaround from here: https://github.com/defunkt/jquery-pjax/issues/143#issuecomment-6194330
        self.hasUsedHistoryAPI = false;
        self.initialUrl = window.location.href;

        // Add event listeners
        $('#countryForm').on('submit', function(event) {
            event.preventDefault();
            self.fetchData(event);
        });

        var $scale = $('.logScale input');

        $scale.on('change', function(event) {
            self.toggelLogScale(event.target.checked);
        });

        window.addEventListener('popstate', function(event) {
            var initialPop = !self.hasUsedHistoryAPI && self.initialUrl === location.href;
            if (initialPop) { return; }
            self.addData(event.state);
            self.clearInputs();
        });

        // If the deep-link has log scale, set that before the chart renders
        if ($scale.is(':checked')) {
            this.chartOptions.yAxis.type = 'logarithmic';
        }

        // Add autocompletes to the inputs
        $('.countries').autocomplete({
            source: window.countries
        });

        // Set starting state for history
        history.replaceState({figures: this.chartOptions.series}, document.title, window.location.href);

        // Setup the initial World GDP chart
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
            data: 'regions=' + encodeURIComponent($inputs[0].value) + ',' + encodeURIComponent($inputs[1].value),
            context: this,
            success: this.success,
            error: this.error
        });
    },

    success: function(data, status) {
        this.addData(data);
        var title, queryParams;
        if (data.errors.length > 0) {
            $('title')[0].innerHTML = 'GDP Comparisons';
            alert(data.errors.join(''));
            return;
        }
        else if (data.figures.length > 1) {
            title = 'GDP Comparisons: ' + data.figures[0].name + ' vs. ' + data.figures[1].name;
            queryParams = '?regions=' + data.figures[0].name + ',' + data.figures[1].name;
        }
        else {
            title = 'GDP Comparisons: ' + data.figures[0].name;
            queryParams = '?regions=' + data.figures[0].name;
        }
        $('title')[0].innerHTML = title;
        history.pushState(data, document.title, queryParams);
        this.hasUsedHistoryAPI = true;

        // Hacky way of changing the URL in the share Tweet
        $('iframe').after('<a href="https://twitter.com/share?url=' + encodeURIComponent(window.location.href) + '&via=nlfurniss&text=GDP comparison between countries&hashtags=GDP,gdpHead2Head" class="twitter-share-button" data-size="large" data-count="none" style="display:none;">Tweet</a>').remove();
        twttr.widgets.load();
    },

    error: function(jqXHR, textStatus, error) {

    },

    addData: function(data) {
        var self = this;
        while (self.chart.series.length > 0) {
            self.chart.series[0].remove(false);
        }
        data.figures.forEach(function(series) {
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
                break;
            case false:
                this.chart.yAxis[0].update({type: 'linear'});
                break;
        }
    },

    clearInputs: function() {
        $('#countryForm').children('input[type="text"]').each(function(index, elem) {
            elem.value = '';
        });
    }
};

$(function(){window.GDP.initialize();});
