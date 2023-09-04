/**
 * Created by dushani on 2/9/18.
 * Interface for chart to communicate with depth
 */
infChart.depthManager = function () {

    /**
     * Default configuration of the depth chart (order book volume )
     * @type {{side: string, maxWidth: number, minWidth: number, minHeight: number, maxHeight: number}}
     */
    var defaultConfig = {
        side: "right",
        maxWidth: 300,
        minWidth: 100,
        minHeight: 150,
        maxHeight: 150,
        titleFormat: '[symbol]',
        chartMode: "aggregated",
        navigatorOnly: false,
        events: {}
    };

    /**
     * Returns the HTMl container of the depth (order book volume ) chart
     * @param element
     * @param depthSettings
     * @param toolBarConfig
     * @returns {string}
     * @private
     */
    var _setHTML = function (element, depthSettings, toolBarConfig) {
        var depthEnabled = depthSettings && depthSettings.enabled,
            depthVisible = depthSettings && depthSettings.show,
            config = $.extend({}, defaultConfig, toolBarConfig, depthSettings);

        var container = element.find('div[inf-container="order-book-volume"]');
        if (depthEnabled) {
            var style = {};
            if (!depthVisible) {
                style['display'] = 'none';
            } else {
                element.addClass(_getDepthWrapper(config.side));
            }
            if (config.side == "right") {
                style['max-width'] = config.maxWidth + 'px';
                style['min-width'] = config.minWidth + 'px';
            } else {
                style['max-height'] = config.maxHeight + 'px';
                style['min-height'] = config.minHeight + 'px';
            }
            container.css(style);
            container.addClass('order-book-volume');
            container.attr('inf-depth-side', depthSettings.side);
        } else {
            container.hide();
        }
    };

    /**
     * Resize the container of the depth (order book volume ) chart
     * @param container
     * @param width
     * @param height
     * @returns {{width: number, height: number}}
     * @private
     */
    var _setContainerSize = function (container, width, height) {
        var usedWidth = 0, usedHeight = 0;
        if (container.length > 0 && window.getComputedStyle(container[0]).display != "none") {
            var side = container.attr('inf-depth-side');
            if (side == "right") {
                usedWidth = Math.floor(Math.min(defaultConfig.maxWidth, Math.max(defaultConfig.minWidth, width / 6)));
                container.width(usedWidth);
                container.height(height);
            } else {
                usedHeight = Math.floor(Math.min(defaultConfig.maxHeight, Math.max(defaultConfig.minHeight, height / 6)));
                container.height(usedHeight);
                container.width(width);
            }
        }
        return {'width': usedWidth, 'height': usedHeight, side : side};
    };

    /**
     * Returns the default configs of depth (order book volume ) chart
     * @returns {{side: string, maxWidth: number, minWidth: number, minHeight: number, maxHeight: number}}
     * @private
     */
    var _getDefaultConfig = function () {
        return defaultConfig;
    };

    /**
     * Returns the wrapper class of the depth (order book volume ) side
     * @param side
     * @returns {string}
     * @private
     */
    var _getDepthWrapper = function (side) {
        return side == 'right' ? 'order-book-volume-right' : '';
    };

    /**
     * Set the wrapper class of the depth (order book volume ) side
     * @param chartContainer
     * @param side
     * @private
     */
    var _setDepthWrapper = function (chartContainer, side) {
        var cls = _getDepthWrapper(side);
        chartContainer.xRemoveClass('order-book-volume-right');
        chartContainer.xAddClass(cls);
    };

    /**
     * Returns the container of the depth (order book volume ) chart
     * @param chartContainer
     * @returns {*}
     * @private
     */
    var _getDepthContainer = function (chartContainer) {
        var container = chartContainer.find("[inf-container=order-book-volume]");
        if (container.length == 0 && chartContainer.attr("inf-container") == 'order-book-volume') {
            container = chartContainer;
        }
        return container;
    };

    var _getLoadingMessage = function(){
      return infChart.util.getLoadingMessage();
    };

    return {
        setHTML: _setHTML,
        setContainerSize: _setContainerSize,
        getDefaultConfig: _getDefaultConfig,
        setDepthWrapper: _setDepthWrapper,
        getDepthContainer: _getDepthContainer,
        getLoadingMessage : _getLoadingMessage

    }
}();

/**
 * Depth class
 * @param containerId
 * @param chartId
 * @param config
 * @param hChart
 * @constructor
 */
infChart.Depth = function (containerId, chartId, config, symbol) {
    this.chartId = chartId;
    if (containerId) {
        if (typeof containerId == "String") {
            this.baseId = containerId
        } else {
            this.baseId = infChart.util.generateUUID();
            $(containerId).attr('id', this.baseId);
        }
    } else {
        this.baseId = chartId;
    }

    var baseContainer = $("#" + this.baseId),
        obvContainer = baseContainer.find("[inf-container=order-book-volume]");

    if (obvContainer.length == 0) {
        baseContainer.attr("inf-container", "order-book-volume");
    }
    var depthCont = infChart.depthManager.getDepthContainer(baseContainer);
    if (depthCont) {
        depthCont.addClass("order-book-volume-chart");
        depthCont.data('infDepth', this);
    }

    config = $.extend({}, infChart.depthManager.getDefaultConfig(), config);
    this.side = config.side;
    this.noData = false;
    this.show = config.show;
    this.mode = config.mode;
    this.config = config;
    this.theme = $.extend({
        bid: {
            color: "#52ac62",
            fillColor: "#52ac62",
            fillOpacity: 0.4
        },
        ask: {
            color: "#bf1212",
            fillColor: "#bf1212",
            fillOpacity: 0.4
        }
    }, Highcharts.theme && Highcharts.theme.depth);
    this.colorTheme = config.colorTheme;
    this.singleColor = config.singleColor;
    this.processedData = {bids: [], asks: []};
    this.constituents = {};
    this.listnerRef = [];
    this.updateDelay = 250;
    this.symbol = symbol;
    this.isFirstLoad = true;
    this.enableLoading = config.enableLoading || false;
    this.loading = 0;

    if (config.xExtremes) {

        this.xExtremes = $.extend({}, config.xExtremes);

        if (config.xExtremes.bid) {
            this.xExtremes.minZoom = config.xExtremes.bid;
        }

        if (config.xExtremes.ask) {
            this.xExtremes.maxZoom = config.xExtremes.ask;
        }
        if (config.xExtremes.bottom) {
            this.xExtremes.bottomZoom = config.xExtremes.bottom;
        }

    }
};

/**
 * Initialize the depth (order book volume ) chart after all containers are set.
 * @param hChart
 */
infChart.Depth.prototype.initialize = function (hChart) {

    var self = this,
        iChart = infChart.manager.getChart(self.chartId);


    // this.chart = Highcharts.chart(this._getChartOptions(this.side, hChart));//error 13
    var container = infChart.depthManager.getDepthContainer($("#" + self.baseId));
    if (container && container.length > 0) {
        if (iChart) {
            self.listnerRef.push({
                method: 'afterSetExtremes', id: iChart.registerForEvents('afterSetExtremes', function () {
                    if(!iChart.isFirstLoadInprogress() && self.isFirstLoad){
                        self.isFirstLoad = false;
                            self.resize();
                            // TODO :: check the possibility of redrawing the chart only once from 'resize' and 'setXAxisDimensions'
                    }
                    self.setXAxisDimensions(!iChart.isFirstLoadInprogress() && !self.isFirstLoad);
                })
            });
        }

        self.fixedDigitsFormatterFn = (self.config.fixedDigitsFormatter ? self.config.fixedDigitsFormatter :
            (iChart && iChart.settings.registeredMethods && iChart.settings.registeredMethods.fixedDigitsFormatter));

        self.chart = Highcharts.chart(self._getChartOptions(self.side, hChart));
        self._setLoading(true);

        self.setScaleFactors();

        if (iChart) {
            self.listnerRef.push({
                method: 'setSymbol', id: iChart.registerForEvents('setSymbol', function (symbol) {
                    self.onBaseSymbolChange(symbol, !iChart.isFirstLoadInprogress());
                })
            });
        }

    }
};



infChart.Depth.prototype.getContainer = function () {
    return infChart.depthManager.getDepthContainer($(document.getElementById(this.baseId)));
};

infChart.Depth.prototype.isLoading = function () {
    return this.loading > 0;
};

infChart.Depth.prototype._setLoading = function (isLoading) {
    if(this.enableLoading) {
        if (isLoading) {
            this.loading++;
            //this.chart.showLoading();
            var loadingHTML = infChart.depthManager.getLoadingMessage();
            $(this.getContainer()).mask(loadingHTML);
        }
        else {
            if (this.loading > 0) {
                this.loading--;
                if (!this.isLoading()) {
                    //this.chart.hideLoading();
                    $(this.getContainer()).unmask();
                }
            }
        }
    }
};


infChart.StockChart.prototype.isLoading = function () {
    return this.loading > 0;
};

/**
 * Returns the Highcharts config of depth (order book volume ) chart
 * @param side
 * @param hChart
 * @returns {{chart: {renderTo: *, spacingLeft: number, spacingRight: number, marginBottom: number, spacingBottom: number, backgoundColor: string, annimation: boolean}, plotOptions: {series: {lineWidth: number, animation: boolean}}, xAxis: *[], yAxis: *[], legend: {enabled: boolean}, tooltip: {enabled: boolean, useHTML: boolean, shadow: boolean, positioner: Function, formatter: Function}, title: {text: string}, series: *[]}}
 * @private
 */
infChart.Depth.prototype._getChartOptions = function (side, hChart) {
    var self = this,
        iChart = infChart.manager.getChart(this.chartId),
        isNavigatorOnly = self.config.navigatorOnly,
        baseEl = $("#" + this.baseId),
        container = infChart.depthManager.getDepthContainer(baseEl);

    hChart = !hChart ? iChart && iChart.chart : hChart;

    var bidTheme, askTheme;
    if (self.singleColor) {
        bidTheme = self.colorTheme ? $.extend({}, this.theme.bid, self.colorTheme) : $.extend({}, this.theme.bid);
        askTheme = self.colorTheme ? $.extend({}, this.theme.ask, self.colorTheme) : $.extend({}, this.theme.ask);
    } else {
        bidTheme = (self.colorTheme && self.colorTheme.bid) ? $.extend({}, this.theme.bid, self.colorTheme.bid) : $.extend({}, this.theme.bid);
        askTheme = (self.colorTheme && self.colorTheme.ask) ? $.extend({}, this.theme.ask, self.colorTheme.ask) : $.extend({}, this.theme.ask);
    }

    var axisOptions = this.getXAxisDimensions(),
        bidSeries = $.extend({
            id: this.chartId + "_ob_bid",
            threshold: 0,
            data: [],
            type: "area",
            step : "center",
            infType: "bid",
            marker: {
                enabled: false
            }
        }, bidTheme),
        askSeries = $.extend({
            id: this.chartId + "_ob_ask",
            threshold: 0,
            data: [],
            type: "area",
            step : "center",
            infType: "ask",
            showInLegend: false,
            marker: {
                enabled: false
            }
        }, askTheme);

    /// hChart =
    var options = {
        chart: {
            renderTo: container[0],
            spacingLeft: 0,
            spacingRight: 0,
            "marginBottom": 25,
            "spacingBottom": 25,
            /*backgoundColor: "#061f2d",*/
            annimation: false
        },
        "plotOptions": {
            area: {
                stacking: self.mode == 'stacked' ? 'normal' : null
            },
            "series": {
                "lineWidth": 1,
                "animation": false,
                turboThreshold: 3000,
                events: {
                    legendItemClick: function () {
                        return false;//<== returning false will cancel the default action
                    }
                }
            }
        },
        xAxis: $.extend({
            title: null,
            crosshair: false,
            /*alternateGridColor: ( side != 'right') ? "#092837" : null,*/
            gridLineWidth: 0,
            width: 20,// hChart && hChart.plotWidth,
            left: hChart && hChart.plotLeft || 0,
            labels: {
                enabled: ( side != 'right'),
                formatter: function () {
                    return this.value;// * -1;
                }
            }/*,
             tickPositioner : function(){
             var el = $element.find(type == 2 ? "[rel=regChart1]" : "[rel=regChart1]");
             var chart = el.data("infReg");
             return chart.yAxis.tickPositions;

             }*/
        }, axisOptions.X)/*, $.extend({
         title: null,
         crosshair: false,
         alternateGridColor: null,
         gridLineWidth: 0,
         left: hChart.plotLeft + hChart.plotWidth / 2,
         autoRotation: [-45],
         offset: 0,
         //top : -21,
         width: hChart.plotWidth / 2/!*,
         tickPositioner : function(){
         var el = $element.find(type == 2 ? "[rel=regChart1]" : "[rel=regChart1]");
         var chart = el.data("infReg");
         return chart.yAxis.tickPositions;

         }*!/
         }, axisOptions.X)*/,
        yAxis: $.extend({
            title: null,
            crosshair: false,
            "opposite": true,
            alternateGridColor: null,
            gridLineWidth: 0,
            "labels": {
                enabled: ( side != 'right')
            },
            id: "#0",
            min: 0,
            events: {
                afterSetExtremes: function (axis) {
                    var baseyAxis = axis && axis.target;

                    if (self.config.events.afterAxisSetExtremes && baseyAxis && !isNaN(baseyAxis.min) && !isNaN(baseyAxis.max)) {
                        self.config.events.afterAxisSetExtremes.apply(this, [{
                            isXAxis: false,
                            min: baseyAxis.min,
                            max: baseyAxis.max
                        }]);
                    }
                }
            }

        }, axisOptions.Y),
        legend: {
            align: 'center',
            verticalAlign: 'top',
            enabled: ( side != 'right'),
            useHTML: true,
            borderWidth: 0,
            itemDistance: 5,
            symbolPadding: 0,
            symbolWidth: 0.001,
            symbolHeight: 0.001,
            symbolRadius: 0,
            floating: true,
            navigation: {
                enabled: false
            },
            labelFormatter: function () {

                var iChart = infChart.manager.getChart(self.chartId),
                    title = self.config.titleFormat;
                if (self.symbol) {
                    $.each(self.symbol, function (i, val) {
                        title = title.replace("[" + i + "]", val);
                    });
                }
                return '<div class="order-book-volume-title-wrapper">' +
                    '<div class="order-book-volume-title">' + title + '</div>' +
                    '<div class="order-book-volume-mid-price"><span>Mid Price : </span><span inf-ref="depth-mid-price"></span></div></div>';
            }
        },
        tooltip: {
            enabled: true,
            useHTML: true,
            shadow: false,
            /*positioner: function (labelWidth, labelHeight, point) {
             return self._tooltipPositioner(this.chart, labelWidth, labelHeight, point);
             },*/
            formatter: function (point) {
                var tooltipItem = this,
                    iChart = infChart.manager.getChart(self.chartId),
                    fixedDigitsFormatterFn = self.fixedDigitsFormatterFn,
                    mainSeries = iChart && iChart.getMainSeries(),
                    price = fixedDigitsFormatterFn ? fixedDigitsFormatterFn(Math.abs(tooltipItem.x), "number", self._getDecimalPlaces(self.symbol, Math.abs(tooltipItem.x)) || 2) : Highcharts.numberFormat(Math.abs(tooltipItem.x),
                        self._getDecimalPlaces(self.symbol, Math.abs(tooltipItem.x)) || 2),
                    currency = self.symbol && self.symbol.currency,
                    sellCurrency = self.symbol && self.symbol.symbol && self.symbol.symbol.split('_')[0] || '',
                    title = (this.point && this.point.series && this.point.series.options.infType == "ask") ? 'Can be bought' : 'Can be sold',
                    val = (fixedDigitsFormatterFn ? fixedDigitsFormatterFn(tooltipItem.y, "number", self._getDecimalPlaces(self.symbol, Math.abs(tooltipItem.y)) || 2) : Highcharts.numberFormat(tooltipItem.y, self._getDecimalPlaces(self.symbol, Math.abs(tooltipItem.y)) || 2)),
                    totalVal = (fixedDigitsFormatterFn ? fixedDigitsFormatterFn(this.point.options.cumulativeValue, "number", self._getDecimalPlaces(self.symbol, Math.abs(this.point.options.cumulativeValue)) || 2) : Highcharts.numberFormat(this.point.options.cumulativeValue, self._getDecimalPlaces(self.symbol, Math.abs(this.point.options.cumulativeValue)) || 2));
                return '<div style="border-left: 3px solid ' + tooltipItem.color + ';" class="order-book-volume-tooltip-wrapper">' +
                    '<p class="chart-currency-length-' + Math.round(price.length / 5) + '">' + price + ' ' + currency + '</p>' +
                    '<div class="values">' +
                    '<ul class="clearfix">' +
                    '<li>' +
                    '<p class="title">' + title + ':</p>' +
                    '<p class="chart-currency-length-' + Math.round(val.length / 5) + '">' + val + ' ' + sellCurrency + '</p>' +
                    '</li>' +
                    '<li>' +
                    '<p class="title">For a total of:</p>' +
                    '<p class="chart-currency-length-' + Math.round(totalVal.length / 5) + '">' + totalVal + ' ' + currency + '</p>' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>';
            }
        },
        title: {
            text: ''
        },
        series: [
            bidSeries,
            askSeries]
    };


    if (hChart) {
        var chartOptions = hChart.options.chart;
        if (side == "right") {


            options.chart = $.extend(options.chart, {
                spacingLeft: 0,
                marginLeft: 0,
                marginRight: 0,
                spacingRight: 0,
                spacingTop: chartOptions.spacingTop,
                marginTop: 0,
                "marginBottom": 0,
                spacingBottom: 0,
                inverted: true
            });
            options.yAxis.offset = 0;
            options.yAxis.left = 0;
            // options.yAxis.width = baseEl.width();

        } else {
            options.chart = $.extend(options.chart, {
                spacingLeft: chartOptions.spacingLeft,
                spacingRight: chartOptions.spacingRight,
                "marginLeft": chartOptions.marginLeft,
                "marginRight": chartOptions.marginRight,
                "marginBottom": 45,
                "spacingBottom": 45,
                "marginTop": 0,
                spacingTop: 5,
                inverted: false
            });

        }
    }


    if (isNavigatorOnly) {
        options.navigator = {
            /* "series": {
             "animation": false
             },*/
            "margin": 10,
            "height": container.height() || 100,
            "enabled": true,
            "visible": true,
            "maskInside": false,
            xAxis: {
                /*alternateGridColor: "#061f2d",*/
                labels: {
                    enabled: true,
                    formatter: function () {
                        return this.value;
                    }
                },
                infEvents: {
                    onNavigatorScrollStop: function (navigator) {

                        var series = navigator.chart && navigator.chart.get(self.chartId + "_ob_bid"),
                            basexAxis = series && series.xAxis;

                        if (self.config.events.onNavigatorScrollStop && basexAxis && !isNaN(basexAxis.min) && !isNaN(basexAxis.max)) {
                            self.config.events.onNavigatorScrollStop.apply(this, [basexAxis.min, basexAxis.max]);
                        }
                    }
                }
            }
        };
        bidSeries.showInNavigator = true;
        askSeries.showInNavigator = true;

        options.yAxis.height = 0;
        options.yAxis.labels = {enabled: false};
        options.xAxis.labels = {enabled: false};
        options.legend.enabled = false;
        options.xAxis.visible = false;
        options.chart.spacingBottom = 0;
        options.chart.marginBottom = 0;

    }

    return options;

};

infChart.Depth.prototype._getDecimalPlaces = function (symbol, price) {
    if (price < 1) {
        return 6;
    } else if (price < 100) {
        return 4;
    } else {
        return 2;
    }
};

/**
 * Set positions of the tooltip
 * @param chart
 * @param labelWidth
 * @param labelHeight
 * @param point
 * @returns {{x: *, y: (number|*)}}
 * @private
 */
infChart.Depth.prototype._tooltipPositioner = function (chart, labelWidth, labelHeight, point) {

    var tooltipX,
        tooltipY;

    if (this.side == "right") {
        if (point.plotY > (chart.plotTop + labelHeight)) {
            tooltipY = chart.plotTop;
        } else {
            tooltipY = chart.plotTop + chart.plotHeight - labelHeight;
        }

        tooltipX = chart.plotLeft + chart.plotWidth - labelWidth;
    } else {
        if (point.plotX > chart.plotWidth - labelWidth) {
            tooltipX = chart.plotLeft;
        } else {
            tooltipX = chart.plotLeft + chart.plotWidth - labelWidth;
        }

        tooltipY = chart.plotTop + chart.plotHeight - labelHeight;

    }

    return {
        x: tooltipX,
        y: tooltipY
    };
};

/**
 * clean chart when changing the base symbol of the main chart
 */
infChart.Depth.prototype.onBaseSymbolChange = function (symbol, redraw) {

    this._setLoading(true);
    var self = this;
    this.symbol = symbol;
    if (this.chart) {
        var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
            askSeries = this.chart.get(this.chartId + "_ob_ask"),
            constituents = this.constituents;

        if (bidSeries && askSeries) {
            bidSeries.setData([], false, false, false);
            askSeries.setData([], false, false, false);
            bidSeries.update({
                name: symbol.symbol
            }, false);
            bidSeries.xAxis.setExtremes(
                null,
                null,
                false
            );
        }

        if (constituents) {
            for (var cons in constituents) {
                if (constituents.hasOwnProperty(cons)) {
                    bidSeries = self.chart.get(constituents[cons].seriesId);
                    if (bidSeries) {
                        bidSeries.remove(false);
                    }
                }
            }
        }

        if(redraw) {
            this.chart.redraw(false);
        }
    }
    this.processedData = {bids: [], asks: []};

    this.constituents = {};
};

/**
 * clean chart when changing the base symbol of the main chart
 */
infChart.Depth.prototype.setConstituents = function (constituents) {
    var self = this;
    this.constituents = {};
    this.processedData = {bids: [], asks: []};

    if (this.chart) {
        if (constituents && constituents.length > 0) {
            for (var cons in constituents) {
                if (constituents.hasOwnProperty(cons)) {
                    var symbol = constituents[cons],
                        seriesId = "stacked" + symbol.symbolId;
                    self.constituents[symbol.symbolId] = {symbol: symbol, seriesId: seriesId};
                    var bidSeries = $.extend({
                        id: seriesId,
                        threshold: 0,
                        data: [],
                        type: "area",
                        infType: "bid",
                        step : "center",
                        showInLegend: false,
                        marker: {
                            enabled: false
                        }
                    }, this.theme.bid, symbol.theme);
                    this.chart.addSeries(bidSeries, false);
                }
            }
            if(!this.isFirstLoad) {
                this.chart.redraw(false);
            }
        }

    }
};

infChart.Depth.prototype.setProperties = function (properties) {
    var iChart = infChart.manager.getChart(this.chartId), baseEl = $("#" + this.baseId);
    var depthEl = infChart.depthManager.getDepthContainer(baseEl);
    if (properties.enabled) {
        this.side = properties.side;
        if (properties.show) {
            depthEl.attr("inf-depth-side", properties.side);
            if (properties.side == "right") {
                depthEl.css({
                    'max-width': this.config.maxWidth,
                    'min-width': this.config.minWidth,
                    'max-height': '',
                    'min-height': ''
                });
            } else {
                depthEl.css({
                    'max-width': '',
                    'min-width': '',
                    'max-height': this.config.maxHeight,
                    'min-height': this.config.minHeight
                });
            }
            if (!this.noData) {
                depthEl.show();
                this.show = true;
                this.redrawChart();
                iChart.resizeChart();
            }
        } else {
            if (this.show) {
                depthEl.hide();
                this.show = false;
                iChart.resizeChart();
            }
        }
    } else {
        if (typeof properties.noData !== "undefined") {
            if (properties.noData) {
                depthEl.hide();
                iChart.resizeChart();
                this.noData = properties.noData;
            } else {
                if (this.noData) {
                    if (this.show) {
                        depthEl.show();
                        this.redrawChart();
                        iChart.resizeChart();
                    }
                    this.noData = properties.noData;
                }
            }
        } else {
            if (this.show) {
                depthEl.hide();
                this.show = false;
                iChart.resizeChart();
            }
        }
    }
};

/**
 * Change the side of the container of the depth (order book volume ) chart
 * @param side
 * @returns {{side: *, show: *}}
 */
infChart.Depth.prototype.changeSide = function (side) {
    if (!this.noData) {
        var baseEl = $("#" + this.baseId);

        //infChart.depthManager.setDepthWrapper(baseEl, side);

        var depthEl = infChart.depthManager.getDepthContainer(baseEl);

        if (this.side == side) {
            this.show = !this.show;
            if (!this.show) {
                depthEl.hide();
            } else {
                depthEl.show();
            }
            //return {side: side, show: this.show};
        } else {
            this.cleanChart();
            depthEl.show();
            this.show = true;
            this.side = side;

            if (this.side == "right") {
                depthEl.css({
                    'max-width': this.config.maxWidth,
                    'min-width': this.config.minWidth,
                    'max-height': '',
                    'min-height': ''
                });
            } else {
                depthEl.css({
                    'max-width': '',
                    'min-width': '',
                    'max-height': this.config.maxHeight,
                    'min-height': this.config.minHeight
                });
            }

            depthEl.attr("inf-depth-side", side);

            this.redrawChart();
        }
    } else {
        this.side = side;
        this.show = false;
    }

    return this.getProperties();
};

infChart.Depth.prototype.setColorTheme = function (isSingleColor, theme) {
    this.singleColor = isSingleColor;
    if (this.chart) {
        var bidSeries = this.chart.get(this.chartId + "_ob_bid"), askSeries = this.chart.get(this.chartId + "_ob_ask");
        if (isSingleColor) {
            bidSeries.update($.extend({}, this.theme.bid, theme), false);
            askSeries.update($.extend({}, this.theme.ask, theme), false);
            if(!this.isFirstLoad) {
                this.chart.redraw(false);
            }
        } else {
            if (theme) {
                bidSeries.update($.extend({}, this.theme.bid, theme.bid), false);
                askSeries.update($.extend({}, this.theme.ask, theme.ask), false);
                if(!this.isFirstLoad) {
                    this.chart.redraw(false);
                }
            }
        }
    }
};

/**
 * Change the side of the container of the depth (order book volume ) chart
 * @param mode
 * @returns {{side: *, show: *}}
 */
infChart.Depth.prototype.changeMode = function (mode) {
    var baseEl = $("#" + this.baseId);
    var depthEl = infChart.depthManager.getDepthContainer(baseEl);
    this.mode = mode;
    depthEl.attr("inf-depth-mode", mode);
    this.redrawChart();
    this.delayedUpdate(true);
};

/**
 * Set scaling factor of the charts
 */
infChart.Depth.prototype.setScaleFactors = function () {

    if (this.chart) {
        var iChart = infChart.manager.getChart(this.chartId);
        if (iChart) {
            var scaleFct = iChart.getScaleFactors(),
                scaleX = scaleFct && scaleFct.infScaleX || 1,
                scaleY = scaleFct && scaleFct.infScaleY || 1;
            this.chart.infScaleX = scaleX;
            this.chart.infScaleY = scaleY;
        } else {

            var scaleFactorX = 1, scaleFactorY = 1, transform, matrix;
            var scalers = $("#" + this.baseId).parents().filter(function () {
                transform = $(this).css('transform');
                if (transform != "none") {
                    matrix = transform.match(/-?[\d\.]+/g);
                    if (matrix.length >= 4) {
                        scaleFactorX = scaleFactorX * Math.sqrt(parseFloat(matrix[0]) * parseFloat(matrix[0]) + parseFloat(matrix[1]) * parseFloat(matrix[1]));
                        scaleFactorY = scaleFactorY * Math.sqrt(parseFloat(matrix[2]) * parseFloat(matrix[2]) + parseFloat(matrix[3]) * parseFloat(matrix[3]));
                    }
                    return true;
                } else {
                    return false;
                }
            });
            this.chart.infScaleX = scaleFactorX;
            this.chart.infScaleY = scaleFactorY;
        }
    }
};

infChart.Depth.prototype.reflow = function () {
        this.chart.reflow();
        this.updateMidLabel();
};

infChart.Depth.prototype.resize = function () {

    var _self = this,
        iChart = infChart.manager.getChart(this.chartId),
        adjustSize = function () {
            _self.setScaleFactors();

            if (_self.side == "right") {

                var baseEl = $("#" + _self.baseId),
                    depthEl = baseEl && infChart.depthManager.getDepthContainer(baseEl);
                if (iChart && iChart.chart && depthEl) {
                    depthEl.css({height: iChart.chart.plotHeight + iChart.chart.margin[0]});
                } else {
                    depthEl.css({height: "100%"});
                }
            }

            if (_self.chart && (!iChart || !iChart.isFirstLoadInprogress()) && !_self.isFirstLoad) {
                _self.reflow();
            }
        };

    /*if(iChart) {

     } else {
     _self.resizeTimer = setTimeout(function () {
     if (_self.adjustOnResizeTimeout) {
     adjustSize();
     }
     _self.resizeTimer = 0;
     }, _self.settings.config.maxResizeDelay);
     }*/

    if(!_self.isFirstLoad) {
        adjustSize();
    }
};


infChart.Depth.prototype.getZoomRange = function () {
    var self = this,
        dataExtremes = self.getDataExtremes(),
        fullRange = dataExtremes && dataExtremes.midVal,
        isBestZoom = this.xExtremes && this.xExtremes.bestZoom,
        zoomStartRate,
        zoomEndRate,
        zoomStart,
        zoomEnd,
        minZoomRates = this.xExtremes && (this.xExtremes.minZoomRates || this.xExtremes.maxZoomRates),
        maxZoomRates = this.xExtremes && (this.xExtremes.maxZoomRates || this.xExtremes.minZoomRates),
        i,
        iLen,
        zoomRate;

    if (isBestZoom && minZoomRates && maxZoomRates) {

        for ( i = 0, iLen = minZoomRates.length; i<iLen; i++ ){
            zoomRate = minZoomRates[i];
            zoomStart = dataExtremes.midVal - fullRange * zoomRate;
            if(dataExtremes.bestBid> zoomStart) {
                break;
            }
        }

        for ( i = 0, iLen = maxZoomRates.length; i<iLen; i++ ){
            zoomRate = minZoomRates[i];
            zoomEnd = dataExtremes.midVal + fullRange * zoomRate;
            if(dataExtremes.bestAsk < zoomEnd) {
                break;
            }
        }

    } else {
        zoomStartRate = this.xExtremes && ((this.side == "bottom" && this.xExtremes.bottomZoom) || this.xExtremes.minZoom );
        zoomEndRate = this.xExtremes && ((this.side == "bottom" && this.xExtremes.bottomZoom ) || this.xExtremes.maxZoom );
        zoomStart = zoomStartRate && dataExtremes && fullRange && (dataExtremes.midVal - fullRange * zoomStartRate );
        zoomEnd = zoomEndRate && dataExtremes && fullRange && (dataExtremes.midVal + fullRange * zoomEndRate );
    }

    zoomStart = zoomStart || dataExtremes.min;
    zoomEnd = zoomEnd || dataExtremes.max;

    return {start: zoomStart, end: zoomEnd};
};

infChart.Depth.prototype.updateChart = function (forcedUpdate) {

    var self = this;
    if (self.rawData) {
        self.processedData = this._processData(self.rawData);
        self.rawData = undefined;
    }
    this.isFirstLoad = false;


    if (this.chart) {

        var dataExtremes,
            zoomStart,
            zoomEnd,
            i,
            len,
            zoomRange;

        if (self.mode != "stacked") {
            var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
                askSeries = this.chart.get(this.chartId + "_ob_ask");

            if (bidSeries && askSeries && this.processedData) {

                zoomRange = this.getZoomRange();
                zoomStart = zoomRange && zoomRange.start;
                zoomEnd = zoomRange && zoomRange.end;

                var bids = [], asks = [];
                if (zoomStart || zoomEnd) {
                    var bidsTemp = this.processedData.bids,
                        asksTemp = this.processedData.asks;
                    zoomStart = zoomStart || dataExtremes && dataExtremes.min;
                    zoomEnd = zoomEnd || dataExtremes && dataExtremes.max;

                    for (i = bidsTemp.length - 1; i >= 0; i--) {
                        if (bidsTemp[i].x >= zoomStart && bidsTemp[i].x <= zoomEnd) {
                            bids.unshift(bidsTemp[i]);
                        } else if (bidsTemp[i].x < zoomStart) {
                            break;
                        }
                    }

                    for (i = 0, len = asksTemp.length; i < len; i++) {
                        if (asksTemp[i].x >= zoomStart && asksTemp[i].x <= zoomEnd) {
                            asks.push(asksTemp[i]);
                        } else if (asksTemp[i].x > zoomEnd) {
                            break;
                        }
                    }

                } else {
                    bids = this.processedData.bids;
                    asks = this.processedData.asks;
                }

                bidSeries.setData(bids, false, false, false);
                askSeries.setData(asks, false, false, false);
                this.setXAxisDimensions(true);
            }
        } else if (self.constituentsTemp || forcedUpdate) {

            self._generateStackedChartData();

            var currentCons = self.constituents,
                cons;

            for (cons in currentCons) {
                if (currentCons.hasOwnProperty(cons)) {
                    var baseS = self.chart.get(currentCons[cons].seriesId);
                    if (baseS) {
                        var chartDataMap = currentCons[cons].chartDataMap,
                            dataKeys = Object.keys(chartDataMap).sort(function (a, b) {
                                return +a - +b
                            }),
                            chartData = new Array(dataKeys.length);

                        dataKeys.forEach(function (val, idx) {
                            chartData[idx] = chartDataMap[+val];
                        });
                        baseS.setData(chartData, false, false, false);
                        //baseS.userOptions.infDataMap = chartDataMap;
                    }
                }
            }

            this.setXAxisDimensions(true);
        }
        if (self.config.events && self.config.events.afterDataUpdate) {
            var extremes = this.chart.yAxis[0].getExtremes();
            if (extremes) {
                self.config.events.afterDataUpdate.apply(this, [{
                    dataMin: extremes.dataMin,
                    dataMax: extremes.dataMax
                }]);
            }
        }
    }
    if(self.processedData && (self.processedData.bids.length || self.processedData.asks.length)) {
        self._setLoading(false);
    } else if(self.loading && !self.loadingTimer){
        self.loadingTimer = setTimeout(function(){
            self._setLoading(false);
        }, 10000);
    }
};

infChart.Depth.prototype._generateStackedChartData = function () {
    var self = this,
        dataExtremes,
        fullRange,
        zoomStart,
        zoomEnd,
        zoomStartRate,
        zoomEndRate;

    var constituentsTemp = self.constituentsTemp;
    self.constituentsTemp = undefined;

    var currentCons = self.constituents,
        bidsMap = {},
        askMap = {},
        symbolTemp, symbolChartData,
        cons,
        dataRow,
        zoomRange;

    for (cons in constituentsTemp) {
        if (constituentsTemp.hasOwnProperty(cons)) {
            if (constituentsTemp[cons].rawData) {
                self.constituents[cons].processedData = self._processData(constituentsTemp[cons].rawData, true);
            }
        }
    }

    zoomRange = this.getZoomRange();
    zoomStart = zoomRange && zoomRange.start;
    zoomEnd = zoomRange && zoomRange.end;

    for (cons in currentCons) {

        if (currentCons.hasOwnProperty(cons)) {

            symbolTemp = self.constituents[cons];
            symbolTemp.chartData = [];
            symbolTemp.chartDataMap = {};
            symbolTemp.missingBids = [];

            if (symbolTemp.processedData) {

                symbolTemp.processedData.bids.forEach(function (val, idx) {
                    if (zoomStart <= val.x && val.x <= zoomEnd) {
                        if (!bidsMap[val.x]) {
                            bidsMap[val.x] = {};
                        }
                        bidsMap[val.x][cons] = val;
                    }
                });

                symbolTemp.processedData.asks.forEach(function (val, idx) {
                    if (zoomStart <= val.x && val.x <= zoomEnd) {
                        if (!askMap[val.x]) {
                            askMap[val.x] = {};
                        }
                        askMap[val.x][cons] = val;
                    }
                });
            }
        }
    }


    var bidKeys = Object.keys(bidsMap).sort(function (a, b) {
        return +a - +b;
    });
    var askKeys = Object.keys(askMap).sort(function (a, b) {
        return +a - +b;
    });

    for (var i = bidKeys.length - 1; i >= 0; i--) {
        var val = bidsMap[bidKeys[i]];
        cons = undefined;
        for (cons in currentCons) {
            symbolTemp = currentCons[cons];
            var bidVal = +bidKeys[i];
            if (currentCons.hasOwnProperty(cons) && symbolTemp.processedData && symbolTemp.chartDataMap && !symbolTemp.chartDataMap[bidVal]) {

                symbolChartData = symbolTemp.chartData;
                if (val[cons]) {
                    dataRow = val[cons];
                    symbolChartData[i] = dataRow;
                    symbolTemp.chartDataMap[bidVal] = dataRow;
                } else if (bidVal <= symbolTemp.processedData.bidEnd) {
                    if (symbolChartData[i + 1]) {
                        dataRow = $.extend({}, symbolChartData[i + 1], {x: bidVal});
                        symbolChartData[i] = dataRow;
                        symbolTemp.chartDataMap[bidVal] = dataRow;
                    } else {
                        dataRow = $.extend({}, symbolTemp.processedData.bids[symbolTemp.processedData.bids.length - 1], {x: bidVal});
                        symbolChartData[i] = dataRow;
                        symbolTemp.chartDataMap[bidVal] = dataRow;
                    }
                } else if (askKeys[0] && bidVal < +askKeys[0]) {
                    dataRow = {y: 0, bid: 0, cumulativeValue: 0, x: bidVal};
                    symbolChartData[i] = dataRow;
                    symbolTemp.chartDataMap[bidVal] = dataRow;
                } else {
                    symbolTemp.missingBids.push(bidVal);
                }
            }
        }
    }

    for (i = 0; i < askKeys.length; i++) {
        var val = askMap[askKeys[i]];
        for (cons in currentCons) {
            var askVal = +askKeys[i];
            symbolTemp = currentCons[cons];
            if (currentCons.hasOwnProperty(cons) && currentCons[cons].processedData && symbolTemp.chartDataMap && !symbolTemp.chartDataMap[askVal]) {

                symbolChartData = symbolTemp.chartData;

                var missingBids = symbolTemp.missingBids,
                    mc = missingBids.length - 1;

                if (missingBids.length && missingBids[mc] < askVal) {

                    while (missingBids.length) {
                        if (missingBids[mc] < askVal) {
                            if (!symbolTemp.chartDataMap[missingBids[mc]]) {
                                dataRow = $.extend({}, symbolChartData[symbolChartData.length - 1], {x: missingBids[mc]});
                                symbolChartData.push(dataRow);
                                symbolTemp.chartDataMap[missingBids[mc]] = dataRow;
                            }
                            missingBids.splice(mc, 1);
                            mc = missingBids.length - 1;
                        } else {
                            if (missingBids[mc] == askVal) {
                                missingBids.splice(mc, 1);
                            }
                            break;
                        }

                    }
                }
                if (!symbolTemp.chartDataMap[askVal]) {
                    if (val[cons]) {
                        dataRow = val[cons];
                        symbolChartData.push(dataRow);
                        symbolTemp.chartDataMap[askVal] = dataRow;
                    } else if (askVal > symbolTemp.processedData.bidEnd && askVal < symbolTemp.processedData.askStart) {
                        dataRow = {y: 0, ask: 0, cumulativeValue: 0, x: askVal};
                        symbolChartData.push(dataRow);
                        symbolTemp.chartDataMap[askVal] = dataRow;
                    } else if (askVal >= symbolTemp.processedData.askStart) {
                        if (symbolChartData[symbolChartData.length - 1]) {
                            dataRow = $.extend({}, symbolChartData[symbolChartData.length - 1], {x: askVal});
                            symbolChartData.push(dataRow);
                            symbolTemp.chartDataMap[askVal] = dataRow;
                        }
                        /*else {
                         symbolTemp[askI] = $.extend({}, symbolTemp.processedData.asks[0], {x: parseFloat(askVal)});
                         }*/
                    } else if (askVal < symbolTemp.processedData.bidEnd) {
                        var value = undefined;
                        for (var bi = symbolChartData.length - 1; bi >= 0; bi--) {
                            if (askVal > symbolChartData[bi].x) {
                                value = symbolChartData[bi + 1];
                                break;
                            }
                        }

                        if (value) {
                            dataRow = $.extend({}, value, {x: askVal});
                            symbolChartData.splice(bi + 1, 0, dataRow);
                            symbolTemp.chartDataMap[askVal] = dataRow;

                        } else {
                            dataRow = $.extend({}, symbolChartData[0], {x: askVal});
                            symbolChartData.splice(0, 0, dataRow);
                            symbolTemp.chartDataMap[askVal] = dataRow;
                        }
                    }
                }
            }
        }
    }
};

/**
 * Update given data in the chart
 * @param data
 */
infChart.Depth.prototype.updateData = function (data, mode) {

    var self = this;
    if (mode == "stacked") {

        if (Array.isArray(data)) {
            if (!self.constituentsTemp) {
                self.constituentsTemp = {};
            }
            data.forEach(function (dataSym) {
                var dataTemp = dataSym && dataSym.data,
                    symbol = dataSym && dataSym.symbol;
                if (symbol && dataTemp && ((dataTemp.bids && Array.isArray(dataTemp.bids)) || (dataTemp.asks && Array.isArray(dataTemp.asks)))) {
                    //var processedSymData = self._processData(dataTemp, true);
                    if (!self.constituentsTemp[symbol.symbolId]) {
                        self.constituentsTemp[symbol.symbolId] = {
                            symbol: symbol,
                            seriesId: "stacked" + symbol.symbolId,
                            rawData: dataTemp
                        };
                    }
                    //self.constituentsTemp[symbol.symbolId].processedData = processedSymData;
                    /*self.constituentsTemp[symbol.symbolId].rawData = dataTemp;*/
                }
            });
        }

    } else if (data && ((data.bids && Array.isArray(data.bids)) || (data.asks && Array.isArray(data.asks)))) {
        this.rawData = data;
    }
    this.delayedUpdate(true);
};

infChart.Depth.prototype.delayedUpdate = function (immediateUpdate) {
    var self = this;
    if (!self.isWaitingForUpdate) {

        setTimeout(function () {
            self.isWaitingForUpdate = false;
            if (self.updateTicksRequired) {
                if (self.chart && self.chart.hasRendered) {
                    self.updateTicksRequired = false;
                    self.updateChart();
                } else if (self.chart) {
                    self.delayedUpdate(false);
                }
            }
        }, self.updateDelay);

        self.isWaitingForUpdate = true;

        if (immediateUpdate) {
            self.updateChart();
        }

    } else {
        self.updateTicksRequired = true;
    }
};

/**
 * Draw or update the mid label of the chart
 */
infChart.Depth.prototype.getMidPrice = function () {

    var self = this;
    if (this.mode == "stacked") {
        var currentCons = self.constituents,
            cons,
            count = 0,
            totalVal = 0,
            midVal;

        for (cons in currentCons) {
            if (currentCons.hasOwnProperty(cons) && (currentCons[cons].processedData && !isNaN(currentCons[cons].processedData.midValue))) {
                totalVal += currentCons[cons].processedData.midValue;
                count++;
            }
        }
        midVal = totalVal / count;
    } else {
        var askSeries = this.chart.get(this.chartId + "_ob_ask"),
            bidSeries = this.chart.get(this.chartId + "_ob_bid");
        midVal = askSeries && askSeries.options && askSeries.options.data && askSeries.options.data[0] &&
        bidSeries && bidSeries.options && bidSeries.options.data && bidSeries.options.data.length > 0 ?
        (askSeries.options.data[0].x + bidSeries.options.data[bidSeries.options.data.length - 1].x) / 2 : undefined;
    }
    return midVal;
};

/**
 * Draw or update the mid label of the chart
 */
infChart.Depth.prototype.updateMidLabel = function () {

    var self = this,
        midVal = self.getMidPrice();

    var dp = this._getDecimalPlaces(undefined, midVal) || 4;

    if (midVal) {
        if (this.side != "right") {
            var baseEl = $("#" + this.baseId),
                fixedDigitsFormatterFn = self.fixedDigitsFormatterFn;

            baseEl.find("[inf-ref=depth-mid-price]").html(fixedDigitsFormatterFn ? fixedDigitsFormatterFn(midVal, "number", dp) : Highcharts.numberFormat(midVal, dp));
        }
    }
};

/**
 * Returns the dimensions of x Axis
 * @returns {{}}
 */
infChart.Depth.prototype.getXAxisDimensions = function () {
    var iChart = infChart.manager.getChart(this.chartId),
        hChart = iChart && iChart.chart,
        options = {};

    var xOptions = {},
        yOptions = {},
        mainYAxis = iChart && iChart.getMainYAxis();

    if (this.side == "right") {

        if (mainYAxis && iChart) {
            xOptions.min = iChart.getBaseValue(mainYAxis.min, iChart.isLog, iChart.isCompare, iChart.isPercent);
            xOptions.max = iChart.getBaseValue(mainYAxis.max, iChart.isLog, iChart.isCompare, iChart.isPercent);
        }
        xOptions.left = 0;
        xOptions.width = 0;
        xOptions.reversed = false;
        yOptions.labels = {enabled: false};

    } else {
        xOptions.reversed = false;
        xOptions.left = hChart && hChart.plotLeft || 0;
        xOptions.width = null;
    }

    if (!this.xExtremes && this.side != "right") {
        xOptions.min = null;
        xOptions.max = null;
        xOptions.previousZoom = undefined;
    }

    options.X = xOptions;

    options.Y = {};
    return options;
};

infChart.Depth.prototype.getDataExtremes = function () {
    var self = this,
        min = Number.MAX_VALUE,
        max = 0,
        processedDt,
        midVal,
        bestBid,
        bestAsk;

    if (this.mode == "stacked") {
        var currentCons = self.constituents,
            cons,
            count = 0,
            totalVal = 0;

        for (cons in currentCons) {
            if (currentCons.hasOwnProperty(cons)) {
                processedDt = currentCons[cons].processedData;

                var prMin = processedDt && processedDt.bids && processedDt.bids[0] && processedDt.bids[0].x,
                    prAskMin = processedDt && processedDt.asks && processedDt.asks[0] && processedDt.asks[0].x,
                    prBidMax = processedDt && processedDt.bids && processedDt.asks[processedDt.bids.length - 1] && processedDt.bids[processedDt.bids.length - 1].x,
                    prMax = processedDt && processedDt.asks && processedDt.asks[processedDt.asks.length - 1] && processedDt.asks[processedDt.asks.length - 1].x;

                min = Math.min(prMin || prAskMin, prAskMin || prMin);
                max = Math.max(prMax || prBidMax, prBidMax || prMax);

                if (!isNaN(prMin) && min == Number.MAX_VALUE || min > prMin) {
                    min = prMin;
                }

                if (!isNaN(prMax) && max == 0 || max < prMax) {
                    max = prMax;
                }

                bestBid = Math.max(bestBid || prBidMax, prBidMax);
                bestAsk = Math.max(bestAsk || prAskMin, prAskMin);

                if (processedDt && !isNaN(processedDt.midValue)) {
                    totalVal += processedDt.midValue;
                    count++;
                }
            }

        }

        midVal = totalVal / count;

    } else {

        processedDt = self.processedData;

        var askDt = processedDt && processedDt.asks,
            bidDt = processedDt && processedDt.bids,
            minBid = bidDt && bidDt[0] && bidDt[0].x,
            minAsk = askDt && askDt[0] && askDt[0].x,
            maxBid = bidDt && bidDt[bidDt.length - 1] && bidDt[bidDt.length - 1].x,
            maxAsk = askDt && askDt[askDt.length - 1] && askDt[askDt.length - 1].x;

        midVal = askDt && askDt[0] && bidDt && bidDt.length > 0 ?
        (askDt[0].x + bidDt[bidDt.length - 1].x) / 2 : undefined;


        min = Math.min(minBid || minAsk, minAsk || minBid) || min;
        max = Math.max(maxAsk || maxBid, maxBid || maxAsk) || max;

        bestBid = maxBid;
        bestAsk = minAsk;
    }

    return { midVal: midVal, min: min, max: max, bestBid: bestBid, bestAsk: bestAsk };
};

/**
 * Set the X Axis' dimensions
 * @param redraw
 */
infChart.Depth.prototype.setXAxisDimensions = function (redraw) {
    var options = this.getXAxisDimensions();

    if (options && options.X) {

        var bidSeries = this.chart.get(this.chartId + "_ob_bid");

        bidSeries.yAxis.update(options.Y, false);
        bidSeries.xAxis.update(options.X, false);
        //if(options.X && (options.X.min || options.X.max)){
        //    bidSeries.xAxis.setExtremes(options.X.min, options.X.max, true);
        // }
        //askSeries.xAxis.update(options.X, false);

        if (redraw) {
            this.chart.redraw(false);
        }

        this.updateMidLabel();
    }
};

/**
 * Clean the depth (order book volume ) chart
 */
infChart.Depth.prototype.cleanChart = function () {
    var baseEl = $("#" + this.baseId),
        depthEl = infChart.depthManager.getDepthContainer(baseEl);
    depthEl.find(".highcharts-container").hide();
};

/**
 * Redraw the depth (order book volume ) chart
 */
infChart.Depth.prototype.redrawChart = function () {
    if (this.chart && !this.isFirstLoad) {
        this.chart.destroy();
        this.midLabel = undefined;
        var baseEl = $("#" + this.baseId),
            config = this._getChartOptions(this.side);
        if (this.mode == "aggregated") {
            config.series[0].data = this.processedData.bids;
            config.series[1].data = this.processedData.asks;
        }
        this.chart = Highcharts.chart(config);
        this.setScaleFactors();
    }
};

/**
 * Find out the precision to process bid, ask values and returns the precision min and max values of the bid,ask values
 * @param bids
 * @param asks
 * @returns {{min: *, max: *, askCount: number, bidCount: number, precision}}
 * @private
 */
infChart.Depth.prototype._getPrecision = function (bids, asks) {
    if (bids && bids.length > 0 && asks && asks.length > 0) {
        var bestBid = bids[bids.length - 1].price,
            bestAsk = asks[0].price,
            maxAskToConsider = bestAsk * 1.5,
            minBidToConsider = bestBid * 0.5,
            min, max, askCount = 0, bidCount = 0;

        // finds the minimum actual bid  from the bids data list
        var i = 0, len = bids.length;
        for (i; i < len; i++) {
            if (i === 0) {
                if (bids[0].price > minBidToConsider) {
                    min = bids[0].price;
                    bidCount = len;
                    break;
                } else if (bids[1].price > minBidToConsider) {
                    min = bids[1].price;
                    bidCount = len - 1;
                    break;
                }
            } else {
                if (bids[i + 1] && bids[i + 1].price > minBidToConsider) {
                    min = bids[i + 1].price;
                    bidCount = len - i;
                    break;
                }
            }
        }

        // finds the maximum actual ask  from the asks data list
        i = asks.length - 1;
        for (i; i >= 0; i--) {
            if (i === asks.length - 1) {
                if (asks[i].price < maxAskToConsider) {
                    max = asks[i].price;
                    askCount = i + 1;
                    break;
                } else if (asks[i - 1].price < maxAskToConsider) {
                    max = asks[i - 1].price;
                    askCount = i;
                    break;
                }
            } else {
                if (asks[i - 1].price < maxAskToConsider) {
                    max = asks[i - 1].price;
                    askCount = i;
                    break;
                }
            }
        }

        if (min && max) {

            return {
                min: min,
                max: max,
                askCount: askCount, // ask count from mid price to max value (ascending)
                bidCount: bidCount, // bid count from mid price to min value (descending)
                precision: this._getPrecisionUsingMinMax(min, max, askCount + bidCount)
            };
        }
    }
};

/**
 * Calculates the precision for the given min and max values of given no of points
 * @param min
 * @param max
 * @param dataPoints
 * @returns {number|*}
 * @private
 */
infChart.Depth.prototype._getPrecisionUsingMinMax = function (min, max, dataPoints) {
    var gap, gapLog;
    if (dataPoints > 1) {
        gap = (max - min) / (dataPoints - 1)
    } else {
        gap = min - max;
    }

    gapLog = Math.floor(infChart.util.num2Log(Math.abs(gap)));
    gapLog = Math.pow(10, gapLog);

    return gapLog;
};

/**
 * Returns the predefined precision for the given price
 * @param price
 * @returns {number}
 * @private
 */
infChart.Depth.prototype._getPrecisionByPrice = function (price) {
    if (price < 1) {
        return 0.00001;
    } else if (price <= 100) {
        return 0.01;
    } else if (price <= 500) {
        return 0.1;
    } else {
        return 1;
    }
};

/**
 * Process depth (order book volume ) data before updating the chart
 * @param data
 * @private
 */
infChart.Depth.prototype._processData = function (data) {
    var self = this,
        cumulativeBidVolume = 0,
        cumulativeAskVolume = 0,
        cumulativeValue = 0,
        processedData = {bids: [], asks: [], bidsMap: {}, asksMap: {}, bidEnd: undefined, askStart: undefined},
        roundedVal,
        i = 0,
        len,
        val,
        x,
        idxCount,
        precisionObj,
        precision,
        bidStartIdx,
        askEndIdx,
        prevBid,
        prevAsk,
        midValue;

    self.cumulativeTotalBidVolume = 0;
    self.cumulativeTotalAskVolume = 0;

    // Sort data by price
    self._sortData(data.bids, 'price', 1);
    self._sortData(data.asks, 'price', 1);

    // calculate the precision and min/max values of the data
    precisionObj = data && self._getPrecision(data.bids, data.asks);
    precision = precisionObj && precisionObj.precision;
    bidStartIdx = precisionObj && precisionObj.bidCount && (data.bids.length - precisionObj.bidCount) || 0;
    askEndIdx = precisionObj && (precisionObj.askCount - 1) || (data.asks.length && data.asks.length - 1) || 0;

    // Generate bid data
    if (data.bids && Array.isArray(data.bids) && data.bids.length) {

        len = data.bids.length;
        idxCount = 0;

        for (i = len - 1; i >= bidStartIdx; i--) {

            val = data.bids[i];
            cumulativeBidVolume = cumulativeBidVolume + val.volume;
            self.cumulativeTotalBidVolume = self.cumulativeTotalBidVolume + val.volume;
            val.cumulativeBidVolume = cumulativeBidVolume;
            cumulativeValue = cumulativeValue + val.price * val.volume;
            x = typeof val.price == "string" ? parseFloat(val.price) : val.price;
            roundedVal = infChart.util.precisionRound(x, (precision ? precision : self._getPrecisionByPrice(x)));

            if (prevBid && prevBid.x == roundedVal) { // change the volume of the existing point

                prevBid.y = cumulativeBidVolume;
                prevBid.cumulativeValue = cumulativeValue;

            } else { // add new point

                prevBid = {
                    x: roundedVal,
                    y: cumulativeBidVolume,
                    bid: val.price,
                    cumulativeValue: cumulativeValue
                };
                processedData.bids[idxCount] = prevBid;
                idxCount++;
            }
        }

        processedData.bids.reverse();
        processedData.bidEnd = processedData.bids.length && processedData.bids[processedData.bids.length - 1].x;

    }

    i = 0;
    cumulativeValue = 0;
    idxCount = 0;

    // Generate ask data
    if (data.asks && Array.isArray(data.asks) && data.asks.length) {

        for (idxCount = 0; idxCount <= askEndIdx; idxCount++) {

            val = data.asks[idxCount];
            x = typeof val.price == "string" ? parseFloat(val.price) : val.price;

            if (self.mode != "stacked" || processedData.bidEnd < x) {
                cumulativeAskVolume = cumulativeAskVolume + val.volume;
                self.cumulativeTotalAskVolume = self.cumulativeTotalAskVolume + val.volume;
                val.cumulativeAskVolume = cumulativeAskVolume;
                cumulativeValue = cumulativeValue + val.price * val.volume;
                roundedVal = infChart.util.precisionRound(x, (precision ? precision : self._getPrecisionByPrice(x)));

                if (processedData.askStart == undefined) {
                    processedData.askStart = roundedVal;
                }

                if (prevAsk && prevAsk.x == roundedVal) {  // change the volume of the existing point

                    prevAsk.y = cumulativeAskVolume;
                    prevAsk.cumulativeValue = cumulativeValue;

                } else {
                    // add new point
                    prevAsk = processedData.asks[i] = {
                        x: roundedVal,
                        y: cumulativeAskVolume,
                        ask: val.price,
                        cumulativeValue: cumulativeValue
                    };
                    i++;
                }
            }
        }
    }

    // calculate the mid value
    midValue = processedData.bids.length && processedData.asks[0] && ((processedData.bids[processedData.bids.length - 1].bid + processedData.asks[0].ask) / 2);

    if (processedData.bids.length) {
        processedData.bids.push({x: processedData.bidEnd, y: 0, bid: 0, cumulativeValue: 0});
    }

    if (processedData.asks.length) {
        processedData.asks.unshift({x: processedData.asks[0].x, y: 0, ask: 0, cumulativeValue: 0});
    }
    processedData.midValue = midValue;

    return processedData;
};

/**
 * Sort function fot data
 * @param data
 * @param field
 * @param direction
 * @private
 */
infChart.Depth.prototype._sortData = function (data, field, direction, wrapperFn) {

    wrapperFn = wrapperFn ? wrapperFn : function (value) {
        return value;
    };

    function compare(a, b) {
        if (wrapperFn(a[field]) < wrapperFn(b[field]))
            return direction > 0 ? -1 : 1;
        if (wrapperFn(a[field]) > wrapperFn(b[field]))
            return direction > 0 ? 1 : -1;
        return 0;
    }

    if (data) {
        data.sort(compare);
    }
};

/**
 * Destroy depth (order book volume) chart
 */
infChart.Depth.prototype.destroy = function () {
    var iChart = infChart.manager.getChart(this.chartId);
    if (iChart) {
        this.listnerRef.forEach(function (val) {
            iChart.removeRegisteredEvent(val.method, val.id);
        });
    }

    if (this.chart && this.chart.destroy) {
        this.chart.destroy();
        this.chart = null;
    }
};

infChart.Depth.prototype.setXExtremes = function (min, max) {
    var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
        xAxis = bidSeries && bidSeries.xAxis;

    if (xAxis) {
        min = Math.max(xAxis.dataMin, min);
        max = Math.min(xAxis.dataMax, max);
        xAxis.setExtremes(min, max, true, false);
        this.xExtremes = {min: min, max: max};
    }

};

infChart.Depth.prototype.setYExtremes = function (min, max) {
    var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
        yAxis = bidSeries && bidSeries.yAxis;

    if (yAxis) {
        yAxis.setExtremes(min, max, true, false);
    }

};

infChart.Depth.prototype.getProperties = function () {
    return {
        enabled: this.config.enabled,
        side: this.side,
        show: this.show,
        titleFormat : this.config && this.config.titleFormat
    }
};

infChart.Depth.prototype.getYExtremes = function () {
    var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
        yAxis = bidSeries && bidSeries.yAxis;
    return {
        min: Math.min(yAxis.dataMin, yAxis.min),
        max: Math.max(yAxis.dataMax, yAxis.max)
    }

};

infChart.Depth.prototype.zoomX = function (type, option) {

    if (!this.xExtremes) {
        this.xExtremes = {};
    }

    switch (type) {
        case "bid":
            this.xExtremes.minZoom = option;
            this.xExtremes.bestZoom = false;
            break;
        case "ask" :
            this.xExtremes.maxZoom = option;
            this.xExtremes.bestZoom = false;
            break;
        case "bottom" :
            this.xExtremes.bottomZoom = option;
            this.xExtremes.bestZoom = false;
            break;
        case "bestZoom" :
            this.xExtremes.bestZoom = option;
            break;
        default :
            break;
    }

    this.updateTicksRequired = false;
    this.updateChart(true);


};

