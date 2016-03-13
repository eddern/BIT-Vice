$(function () {
    $('#container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Column chart'
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Dough'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        legend: {
            enabled: false,
        },
        tooltip: {
            enabled: false,
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black'
                    }
                }
            }
        },
        series: [{
            name: 'Dough',
            data: [5, 3, 4, 7, 2]
        }]
    });

    $.get("/",function(data,status){
      var chart = $("#container").highcharts();
      chart.xAxis[0].setCategories(data['labels'])
      chart.series[0].setData(data['values'])
    });
});
