$(function () {
    $('#container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Monthly Spending'
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Dough (NOK)'
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
            data: []
        }]
    });

    $.get("/",function(data,status){
      var chart = $("#container").highcharts();
      var total = 0;
      for (var i = 0; i < data.values.length; i++) {
        total += data.values[i]
      }

      chart.xAxis[0].setCategories(data['labels'])
      chart.series[0].setData(data['values'])
      chart.yAxis[0].addPlotLine({
        color: 'orange',
        value: total/data.values.length, // Insert your average here
        width: '1',
        zIndex: 2 // To not get stuck below the regular plot lines
      });
      var average = total/data.values.length
      $.each(chart.series[0].data,function(i,data){
        if(data.y <= average){
          data.update({
            color: '#4caf50'
          });
        }
      });
    });
});
