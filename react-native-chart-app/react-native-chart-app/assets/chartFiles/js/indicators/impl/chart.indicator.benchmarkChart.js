//region ************************************** Benchmark Chart Indicator ******************************************

/**
 * Constructor for Benchmark Chart Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.BenchmarkChartIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    this.axisId = "#BC_" + id;
    this.blockUpdateForMainSymbol = true;
    this.includeSymbol = true;

    var colors = infChart.util.getSeriesColors();
    this.symbol = infChart.manager.getChart(this.chartId).symbol;

    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "BC",
        infIndType: "BC",
        infIndSubType: "BC",
        infType: "indicator",
        type: "line",
        yAxis: this.axisId,
        showInLegend: false,
        showSymbolSearch: true,
        color: colors[0],
        lineColor: colors[0]
    }, true);

    this.style[this.series[0].options.id] = ["line", "candlestick", "area", "column"];
};

infChart.util.extend(infChart.Indicator, infChart.BenchmarkChartIndicator);

infChart.BenchmarkChartIndicator.prototype.getLoader = function(){
    return  '<div rel="' + this.id + '" class="c-loading"><div class="c-loading__icon"></div></div>';
};

infChart.BenchmarkChartIndicator.prototype.showHideLoader = function (isShowLoader){
    chartInstance = infChart.manager.getChart(this.chartId);
    if (isShowLoader) {
        var loadingHTML = this.getLoader();

        let indicatorContainerHeight = this.series[0].yAxis.userOptions.height;
        let mainChartHeight= this.series[0].yAxis.top;
        
        $(chartInstance.getContainer()).mask(loadingHTML);
        let loadingComponent = $("div[rel=" + this.id + "]");
        let loaderHeight = $(loadingComponent[0]).height();
        let y = mainChartHeight + ((indicatorContainerHeight + loaderHeight)/2) ;
        
        $(loadingComponent[0]).parent().parent().css({top: y})
    } else {
        $(chartInstance.getContainer()).unmask();
    }
};

infChart.BenchmarkChartIndicator.prototype.calculate = function (ohlc, data, redraw) {
    this.showHideLoader(false);
    data = infChart.indicatorMgr.filterIndicatorData(data, this.chartId);
    if (data && data.length > 0) {
        this.series[0].setData(data, true);
    }
};

infChart.BenchmarkChartIndicator.prototype.loadIndicatorHistoryData = function (selectedSymbol, isPropertyChange){
    this.showHideLoader(true);
    let self = this; 
    self.series[0].setData([], true);
    let stockChart = infChart.manager.getChart(self.chartId);
    let properties = stockChart.getProperties();
    let yAxis = this.series[0].yAxis;

    let symProperties = {
        symbol: selectedSymbol,
        interval: properties.interval
    };
    self.symbol = selectedSymbol;
    
    let callback = function (data, properties) {
        self.calculate(undefined, data.data, true);
        self.setTitle(this.getAxisId(), yAxis.left, yAxis.top - 6, 20, true);
        infChart.manager.getChart(this.chartId)._onPropertyChange("indicators");
    }
    stockChart.dataManager.readHistoryData(symProperties, callback, self);

};

infChart.BenchmarkChartIndicator.prototype.getIndicatorTitle = function () {
    let self = this; 
    let symbol = self.symbol;
    let stockChart = infChart.manager.getChart(self.chartId);
    let symbolName = stockChart._getSymbolDisplayName(symbol);

    return symbolName;
};

//endregion ************************************** Benchmark Chart Indicator ******************************************


