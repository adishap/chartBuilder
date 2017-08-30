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
                if (droppableId === "selected-dim") {
                    dimensions.push(draggableValue);
                }
                if (droppableId === "select-dim") {
                    dimensions = dimensions.filter(function(a) { return a !== draggableValue });
                }
                if (droppableId === "selected-mes") {
                    measurements.push(draggableValue);
                }
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

// module to manage charts
var Charts = (function() {
    // function to render barChart
    var barChart = function() {
        console.log(Data.getData());

        function data() {
            return stream_layers(3, 10 + Math.random() * 100, .1).map(function(data, i) {
                return {
                    key: 'Stream' + i,
                    values: data
                };
            });
        }

        /* Inspired by Lee Byron's test data generator. */
        function stream_layers(n, m, o) {
            if (arguments.length < 3) o = 0;

            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < m; i++) {
                    var w = (i / m - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            return d3.range(n).map(function() {
                var a = [],
                    i;
                for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                for (i = 0; i < 5; i++) bump(a);
                return a.map(stream_index);
            });
        }

        /* Another layer generator using gamma distributions. */
        function stream_waves(n, m) {
            return d3.range(n).map(function(i) {
                return d3.range(m).map(function(j) {
                    var x = 20 * j / m - i / 3;
                    return 2 * x * Math.exp(-.5 * x);
                }).map(stream_index);
            });
        }

        function stream_index(d, i) {
            return { x: i, y: Math.max(0, d) };
        }

        nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
                .showControls(false);

            chart.xAxis
                .axisLabel("Years")
                .tickFormat(d3.format(',f'));

            chart.yAxis
                .axisLabel("Values")
                .tickFormat(d3.format(',.1f'));

            d3.select('#chart svg')
                .datum(data())
                .transition().duration(500)
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    };

    // function to render pieChart
    var pieChart = function() {
        var data = [{
                "label": "One",
                "value": 29.765957771107
            },
            {
                "label": "Two",
                "value": 0
            },
            {
                "label": "Three",
                "value": 32.807804682612
            },
            {
                "label": "Four",
                "value": 196.45946739256
            },
            {
                "label": "Five",
                "value": 0.19434030906893
            },
            {
                "label": "Six",
                "value": 98.079782601442
            },
            {
                "label": "Seven",
                "value": 13.925743130903
            },
            {
                "label": "Eight",
                "value": 5.1387322875705
            }
        ];

        nv.addGraph(function() {
            var chart = nv.models.pieChart()
                .x(function(d) { return d.label })
                .y(function(d) { return d.value })
                .showLabels(true);

            d3.select("#chart svg")
                .datum(data)
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
