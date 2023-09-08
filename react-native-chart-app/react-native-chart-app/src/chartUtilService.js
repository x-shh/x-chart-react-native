var changeChart = function (webViewRef, chartId, symbol, config, reset) {
    if (symbol) {
        var chartSymbol = getChartSymbol(symbol);
        infChart.manager.setSymbol(chartId, chartSymbol, config ? config : {}, reset);
    }

    const injectingCode = `  
      var chart = infChart.manager.getChart("mainchart");
      if (chart) {      
        chart.setIntervalManually("`+ interval + `", undefined, true);
      }
        true; 
      `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectingCode);
    }
};

var changeInterval = (interval) => {
    const injectingCode = `  
      var chart = infChart.manager.getChart("mainchart");
      if (chart) {      
        chart.setIntervalManually("`+ interval + `", undefined, true);
      }
        true; 
      `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectingCode);
    }
  }

  var changeChartType = (type) => {
    const changeChartType = `  
        infChart.manager.setChartStyle("mainchart", "`+ type + `", undefined, true);
        true; 
  `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(changeChartType);
    }
  };

  var changeDrawing = (value) => {
    const changeChartType = `  
      var chart = infChart.manager.getChart("mainchart");
      if(chart){
        infChart.mobileDrawingsManager.initializeDrawing(chart.chart, "` +  value.options[0].shape + `", undefined, undefined, "shape", true)
      }
      true; 
    `;

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(changeChartType);
    }
  };

  var addIndicator = function (chartId, type) {
    var chart = infChart.manager.getChart(chartId);
    if (chart) {
        chart.removeAllIndicators();
        if (type) {
            chart.addIndicator(type);
        }
    }
};

export const chartUtilService = {
    changeDrawing: changeDrawing,
    changeChart: changeChart,
    changeChartType: changeChartType,
    changeInterval: changeInterval,
    addIndicator: addIndicator
  };