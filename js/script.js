var dimensions = [];
var measurements = [];
var pieChartData;
var barChartData;

// module to manage draggable
var Dragble = (function() {
    var init = function(dragDiv, dropDiv) {
        dropDiv.droppable({
            accept: dragDiv,
            drop: function(event, ui) {
                var draggableValue = ui.draggable.attr("data-value");
                var droppableId = $(this).attr("id");
                // add filter to dimesion
                if (droppableId === "selected-dim") {
                    dimensions.push(draggableValue);
                }
                // remove filter to dimension
                if (droppableId === "select-dim") {
                    dimensions = dimensions.filter(function(a) { return a !== draggableValue });
                }
                // add filter to measurement
                if (droppableId === "selected-mes") {
                    measurements.push(draggableValue);
                }
                // remove filter to measurement
                if (droppableId === "select-mes") {
                    measurements = measurements.filter(function(a) { return a !== draggableValue });
                }

                // refresh charts
                Charts.plotChart();
            }
        });
        $(dragDiv).draggable({
            revert: 'invalid'
        });
    };

    var drag = function(dragDiv, dropDiv) {
        init(dragDiv, dropDiv);
    };

    return {
        drag: drag
    };

})();

// module to generate data
var Data = (function() {
	// will return data for pie chart according to selected filters
    var pieData = function() {
        var data = [];
        for (var i = pieChartData.length - 1; i >= 0; i--) {
            if (measurements.indexOf(pieChartData[i].label) > -1) {
                data.push(pieChartData[i]);
            }
        }
        return data;
    };

	// will return data for bar chart according to selected filters
    var barData = function() {
        var data = [];
        for (var i = barChartData.length - 1; i >= 0; i--) {
            if (measurements.indexOf(barChartData[i].key) > -1) {
                data.push(barChartData[i]);
            }
        }
        return data;
    };

    var getData = function() {
        // get selected chart
        var activeChart = $(".active", ".selected-chart").data().chart;

        if (!dimensions.length || !measurements.length) {
            return [];
        }

        if (activeChart === "pie") {
            return pieData();
        } else {
            return barData();
        }
    };

	// will generate data for pie chart
    var generatePieData = function(keys) {
        var data = [];

        for (var i = keys.length - 1; i >= 0; i--) {
            data.push({
                label: keys[i],
                value: Math.floor((Math.random() * 1000) + (100 * dimensions.length))
            })
        }

        return data;
    };

	// will generate data for bar chart
    var generateBarData = function(keys) {
        var years = [2013, 2014, 2015, 2016, 2017];
        var data = [];

        for (var i = keys.length - 1; i >= 0; i--) {
            var values = [];
            for (var j = years.length - 1; j >= 0; j--) {
                values.push({
                    x: years[j],
                    y: Math.floor((Math.random() * 400) + (100 * dimensions.length))
                })
            }
            data.push({
                key: keys[i],
                values: values
            });
        }

        return data;
    };

    var generateData = function() {
        var keys = ["orders", "sales", "purchases", "revenue"];

        pieChartData = generatePieData(keys);
        barChartData = generateBarData(keys);
    };

    return {
        getData: getData,
        generateData: generateData
    };
})();

// module to manage charts
var Charts = (function() {
    // function to render barChart
    var barChart = function() {
        nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
                .showControls(false)
                .useInteractiveGuideline(true);

            chart.noData("Select dimensions and measurements to generate report.");

            chart.xAxis
                .axisLabel("Years")
                .tickFormat(d3.format('f'));

            chart.yAxis
                .axisLabel("Values")
                .tickFormat(d3.format(',.1f'));

            d3.select('#chart svg')
                .datum(Data.getData())
                .transition().duration(500)
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    };

    // function to render pieChart
    var pieChart = function() {
        nv.addGraph(function() {
            var chart = nv.models.pieChart()
                .x(function(d) { return d.label })
                .y(function(d) { return d.value })
                .showLabels(true);

            chart.noData("Select dimensions and measurements to generate report.");

            d3.select("#chart svg")
                .datum(Data.getData())
                .transition().duration(1200)
                .call(chart);

            return chart;
        });
    };

    var plotChart = function() {
        // get selected chart
        var activeChart = $(".active", ".selected-chart").data().chart;

        // remove current plotted chart
        $('#chart svg').html("");
        if (activeChart === "pie") {
            pieChart();
        } else {
            barChart();
        }
    };

    return {
        plotChart: plotChart
    };

})();

var init = function() {
    // initialize dragging for dimensions
    Dragble.drag('.dim-draggable', $('.dim-droppable'));
    // initialize dragging for measurements
    Dragble.drag('.mes-draggable', $('.mes-droppable'));
    // generate data for charts
    Data.generateData();
    // plot charts
    Charts.plotChart();
}

init();

$(".selected-chart").on("click", ".btn", function() {
    var $this = $(this);

    // remove active class from previous button and add it to clicked btn
    $(".active", ".selected-chart").removeClass("active");
    $this.addClass("active");

    // refresh charts
    Charts.plotChart();
});
