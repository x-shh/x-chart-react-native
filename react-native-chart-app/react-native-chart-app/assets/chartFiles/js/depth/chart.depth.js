infChart.Depth = (function (Highcharts) {

    /**
     * @typedef {object} Symbol
     * @property {string} symbolId
     * @property {string} symbol
     * @property {string} exchange
     * @property {string} provider
     * @property {string} currency
     * @property {string} symbolDesc
     * @property {string} symbolType
     * @property {number} dp
     */

    /**
     * @typedef {object} OrderBookRecord
     * @property {number} price
     * @property {number} volume
     */

    /**
     * @typedef {object} OrderBookSnapshot
     * @property {Array<OrderBookRecord>} bids
     * @property {Array<OrderBookRecord>} asks
     */

    /**
     * @typedef {object} StreamingDataObject
     * @property {Symbol} symbol
     * @property {OrderBookSnapshot} data
     */

    /**
     * @typedef {object} ChartDataPoint
     * @property {number} x price
     * @property {number} y cumulative volume
     * @property {number} volume
     * @property {number} cumulativeValue
     */

    /**
     * @typedef {object} ChartData
     * @property {object} data
     * @property {number} min
     * @property {number} priceMin
     * @property {number} max
     * @property {number} priceMax
     * @property {number} mid
     */

    var dataPointThreshold = 1500, timerDelay = 250;

    // Constructor
    function Depth (container, chartId, config, symbol, constituents) {
        this.chartId = chartId;
        this.container = container;
        addClass(this.container, "order-book-volume-chart");

        /**
         * Default configuration of the depth chart (order book volume )
         * @type {{maxWidth: number, minWidth: number, minHeight: number, maxHeight: number}}
         */
        var defaultConfig = {
            titleFormat: '[symbol]',
            chartMode: "aggregated",
            navigatorOnly: false,
            tooltip: true,
            events: {}
        };

        config = extend({}, defaultConfig, config);
        this.mode = config.mode;
        this.config = config;
        this.theme = extend({
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
        this.symbol = symbol;
        this.constituents = constituents ? constituents : [];
        this.timer = undefined;
        this.chartData = {};
    }

    //region jquery utils - http://youmightnotneedjquery.com/

    function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    }

    //todo : check null -> {}
    function deepExtend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];

            if (!obj)
                continue;

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object')
                        out[key] = deepExtend(out[key], obj[key]);
                    else
                        out[key] = obj[key];
                }
            }
        }

        return out;
    }

    function addClass(el, className){
        if (el.classList) {
            el.classList.add(className);
        }else {
            el.className += ' ' + className;
        }
    }

    //endregion

    /**
     * format number
     * @param {number} value
     * @param {function} fixedDigitsFormatterFn
     * @returns {*}
     * @private
     */
    function _formatNumber(value, fixedDigitsFormatterFn){
        var val;
        if(fixedDigitsFormatterFn){
            val = fixedDigitsFormatterFn(value, "number", _getDecimalPlaces(Math.abs(value)) || 2);
        }else{
            val = Highcharts.numberFormat(value, _getDecimalPlaces(Math.abs(value)) || 2)
        }
        return val;
    }

    /**
     * legend formatter
     * @param symbol - symbol is stored in the series
     * @param {string} titleFormat
     * @param {object} chartData
     * @param {function} fixedDigitsFormatterFn
     * @returns {string}
     * @private
     */
    function _labelFormatter(symbol, titleFormat, chartData, fixedDigitsFormatterFn){
        if (symbol) {
            for(var prop in symbol){
                if(symbol.hasOwnProperty(prop)){
                    titleFormat = titleFormat.replace("[" + prop + "]", symbol[prop]);
                }
            }
        }
        var midVal = chartData.mid ? _formatNumber(chartData.mid, fixedDigitsFormatterFn): '';
        return '<div class="order-book-volume-title-wrapper">' +
            '<div class="order-book-volume-title">' + titleFormat + '</div>' +
            '<div class="order-book-volume-mid-price"><span>Mid Price : </span><span data-inf-ref="depth-mid-price">'+midVal+'</span></div></div>';
    }

    /**
     * tooltip formatter
     * @param tooltipItem - highcharts tooltip
     * @param {function} formatterFn
     * @returns {string}
     * @private
     */
    function _tooltipFormatter (tooltipItem, formatterFn) {
        var symbol = tooltipItem.point.series.options.symbol,
            currency = symbol && symbol.currency,
            sellCurrency = symbol && symbol.symbolId && symbol.symbolId.split('_')[0] || '',
            title = (tooltipItem.point && tooltipItem.point.series && tooltipItem.point.series.options.infType == "ask") ? 'Can be bought' : 'Can be sold';

        var price = _formatNumber(Math.abs(tooltipItem.point.options.price), formatterFn);
        var val = _formatNumber(tooltipItem.y, formatterFn);
        var totalVal = _formatNumber(tooltipItem.point.options.cumulativeValue, formatterFn);

        return '<div style="border-left: 3px solid ' + tooltipItem.color + ';" class="order-book-volume-tooltip-wrapper">' +
            '<p class="chart-currency-length-' + Math.round(price.length / 5) + ' tooltip-main-val">' + price + ' ' + currency + '</p>' +
            '<div  class="values">' +
            '<ul class="clearfix">' +
            '<li>' +
            '<p class="chart-currency-length-' + Math.round(val.length / 5) + '">' + val + ' ' + sellCurrency + '</p>' +
            '<p class="title">' + title + ' - </p>' +
            '</li>' +
            '<li>' +
            '<p class="title">for a total of:</p>' +
            '<p class="chart-currency-length-' + Math.round(totalVal.length / 5) + '">' + totalVal + ' ' + currency + '</p>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';
    }

    /**
     * get decimal places by value
     * @param {number} price
     * @returns {number}
     * @private
     */
    function _getDecimalPlaces(price) {
        if (price < 1) {
            return 6;
        } else if (price < 100) {
            return 4;
        } else {
            return 2;
        }
    }

    /**
     * update chart series
     * @param chart
     * @param {string} chartId
     * @param {object} data
     * @param {boolean} isStacked
     * @private
     */
    function _updateChartSeries(chart, chartId, data, isStacked) {
        if (isStacked) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var baseS = chart.get("stacked" + key);
                    if (baseS) {
                        baseS.setData(data[key], false, false, false);
                    }
                }
            }
        } else {
            var bidSeries = chart.get(chartId + "_ob_bid");
            var askSeries = chart.get(chartId + "_ob_ask");

            if (bidSeries) {
                bidSeries.setData(data.bid, false, false, false);
            }
            if (askSeries) {
                askSeries.setData(data.ask, false, false, false);
            }
        }
        chart.isDirtyLegend = true;//https://www.highcharts.com/forum/viewtopic.php?t=8634
        chart.redraw(false);
    }

    /**
     * update the mid label of the chart
     * @param {number} midVal
     * @param {function} fixedDigitsFormatter
     * @param element
     * @private
     */
    function _updateMidLabel(midVal, fixedDigitsFormatter, element) {
        var midLabelContainer = element.querySelector("[data-inf-ref='depth-mid-price']");
        if(midLabelContainer){
            midLabelContainer.innerHTML = _formatNumber(midVal, fixedDigitsFormatter);
        }
    }

    /**
     * get chart options
     * @param {object} chartOptions
     * @returns highcharts config
     * @private
     */
    Depth.prototype._getChartOptions = function(chartOptions) {
        var self = this;
        var isNavigatorOnly = self.config.navigatorOnly;

        var bidTheme = extend({}, self.theme.bid, self.config.colorTheme ? self.config.colorTheme.bid : {}),
            askTheme = extend({}, self.theme.ask, self.config.colorTheme ? self.config.colorTheme.ask : {});

        var bidSeries = extend({
                id: self.chartId + "_ob_bid",
                symbol : self.symbol,
                threshold: 0,
                data: [],
                type: "area",
                step: "left",
                infType: "bid",
               // cropShoulder:0,
                marker: {
                    enabled: false
                },
                states : {
                    inactive: {
                        enabled: false,
                        opacity: 1
                    },
                    hover : {
                        enabled : false
                    }
                }
            }, bidTheme),
            askSeries = extend({
                id: self.chartId + "_ob_ask",
                symbol : self.symbol,
                threshold: 0,
                data: [],
                type: "area",
                step: "right",
                infType: "ask",
                showInLegend: false,
               // cropShoulder:0,
                marker: {
                    enabled: false
                },
                states : {
                    inactive: {
                        enabled: false,
                        opacity: 1
                    },
                    hover : {
                        enabled : false
                    }
                }
            }, askTheme);

        var options = {
            chart: {
                renderTo: self.container,
                //spacingLeft: 0,
                //spacingRight: 0,
                //marginBottom: 25,
                //spacingBottom: 25,
                animation: false
            },
            plotOptions: {
                area: {
                    stacking: self.mode == 'stacked' ? 'normal' : null
                },
                series: {
                    lineWidth: 1,
                    animation: false,
                    turboThreshold: dataPointThreshold * 2,
                    events: {
                        legendItemClick: function () {
                            return false;//<== returning false will cancel the default action
                        }
                    }
                }
            },
            xAxis: {
                title: null,
                crosshair: false,
                gridLineWidth: 0,
                left: 0,
                labels: {
                    enabled: true,
                    formatter: function () {
                        return self._xAxisLabelFormatter(this);
                    }
                }
            },
            yAxis: {
                title: null,
                crosshair: false,
                opposite: true,
                alternateGridColor: null,
                gridLineWidth: 0,
                labels: {
                    enabled: true,
                    formatter: function () {
                        return self._yAxisLabelFormatter(this);
                    }
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
            },
            legend: {
                align: 'center',
                verticalAlign: 'top',
                enabled: true,
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
                labelFormatter: function(){
                    return _labelFormatter(this.options.symbol, self.config.titleFormat, self.chartData, self.fixedDigitsFormatterFn);
                }
            },
            tooltip: {
                enabled: self.config.tooltip,
                useHTML: true,
                shadow: false,
                formatter: function(){
                    return _tooltipFormatter(this, self.fixedDigitsFormatterFn);
                }
            },
            title: {
                text: ''
            },
            series: [
                bidSeries,
                askSeries]
        };

        if (chartOptions) {
            deepExtend(options, chartOptions);
        }

        if (isNavigatorOnly) {
            options.navigator = {
                "margin": 10,
                "height": self.container.clientHeight || 100,
                "enabled": true,
                "visible": true,
                "maskInside": false,
                xAxis: {
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

    /**
     * update chart with data
     * @private
     */
    Depth.prototype._updateChart = function() {
        var self = this;
        if(self.chart) {
            if(self.chartData.hasOwnProperty('mid') && self.chartData.mid !== 0) {
                _updateChartSeries(self.chart, self.chartId, self.chartData.data, self.mode === 'stacked');
                // _updateMidLabel(self.chartData.mid, self.fixedDigitsFormatterFn, self.container);
                if (self.config.events && self.config.events.afterDataUpdate) {
                    var extremes = self.chart.yAxis[0].getExtremes();
                    if (extremes) {
                        self.config.events.afterDataUpdate({
                            dataMin: extremes.dataMin,
                            dataMax: extremes.dataMax
                        });
                    }
                }
            }
        }
    };

    /**
     * initialize
     * @param {object} options
     * @param {object} scaleFactors
     */
    Depth.prototype.initialize = function (options, scaleFactors) {
        var self = this, container = self.container;
        if (container) {
            self.fixedDigitsFormatterFn = (self.config.fixedDigitsFormatter ? self.config.fixedDigitsFormatter : options.fixedDigitsFormatter);
            self.chart = Highcharts.chart(self._getChartOptions(options));
            if(self.constituents.length > 0){
                if (self.mode === 'stacked') {
                    self.constituents.forEach(function (constituent) {
                        var series = extend({
                            id: "stacked" + constituent.symbolId,
                            threshold: null,
                            data: [],
                            type: "area",
                            step: "center",
                            infType: "bid",
                            showInLegend: false,
                            marker: {
                                enabled: false
                            }
                        }, self.theme.bid, self.config.colorTheme[constituent.symbolId]);
                        self.chart.addSeries(series, false);
                    });
                }
            }
            self.setScaleFactors(scaleFactors);
        }
    };

    /**
     * destroy
     */
    Depth.prototype.destroy = function () {
        if (this.chart && this.chart.destroy) {
            this.chart.destroy();
            this.chart = null;
        }
        if(this.chartData) {
            this.chartData = {};
        }
    };

    /**
     * update data
     * data is updated through timer
     * @param {ChartData} data
     * @param {boolean} immediateUpdate
     */
    Depth.prototype.updateData = function (data, immediateUpdate) {
        var self = this;
        if (data) {
            self.chartData = data;

            if(immediateUpdate){
                if(self.timer){
                    clearTimeout(self.timer);
                    self.timer = undefined;
                }
                self._updateChart();
            }else{
                if(typeof self.timer === 'undefined'){
                    self.timer = setTimeout(function(){
                        self.timer = undefined;
                        self._updateChart();
                    }, timerDelay);
                }
            }
        }
    };

    /**
     * when base symbol or constituents change
     * @param symbol
     * @param {Array} constituents
     * @param {object} constituentThemes
     */
    Depth.prototype.onBaseSymbolChange = function (symbol, constituents, constituentThemes) {
        var self = this;
        if (!self.symbol || symbol.symbolId !== self.symbol.symbolId) {
            self.chartData = {};
            self.symbol = symbol;
            if (self.chart) {
                var bidSeries = self.chart.get(self.chartId + "_ob_bid"),
                    askSeries = self.chart.get(self.chartId + "_ob_ask");

                if (bidSeries && askSeries) {
                    bidSeries.setData([], false, false, false);
                    askSeries.setData([], false, false, false);
                    bidSeries.xAxis.setExtremes(null, null, false);
                    bidSeries.update({
                        symbol: symbol
                    }, false);
                    askSeries.update({
                        symbol: symbol
                    }, false);
                }
            }
        }

        if (constituents) {
            var newConstituents = [], usableConstituents = [];

            constituents.forEach(function (constituent) {
                if(self.chart){
                    var series = self.chart.get('stacked' + constituent.symbolId);
                    if (series) {
                        usableConstituents.push(constituent.symbolId);
                    }else{
                        newConstituents.push(constituent.symbolId);
                    }
                }else{
                    newConstituents.push(constituent.symbolId);
                }
            });

            self.constituents.forEach(function (constituent) {
                if (usableConstituents.indexOf(constituent.symbolId) === -1) {
                    if (self.chart){
                        var series = self.chart.get('stacked' + constituent.symbolId);
                        if (series) {
                            series.remove(false);
                        }
                    }
                }
            });

            constituents.forEach(function (constituent) {
                self.config.colorTheme[constituent.symbolId] = constituentThemes[constituent.symbolId];
                if (self.mode === 'stacked') {
                    if (newConstituents.indexOf(constituent.symbolId) > -1) {
                        if (self.chart) {
                            var series = extend({
                                id: "stacked" + constituent.symbolId,
                                threshold: null,
                                data: [],
                                type: "area",
                                step: "center",
                                infType: "bid",
                                showInLegend: false,
                                symbol: constituent,
                                marker: {
                                    enabled: false
                                }
                            }, self.theme.bid, self.config.colorTheme[constituent.symbolId]);
                            self.chart.addSeries(series, false);
                        }
                    }
                }
            });

            self.constituents = constituents;
        }
        if (self.chart) {
            self.chart.redraw(false);
        }
    };

    /**
     * reset chart data
     * used when setting new properties to chart
     * @param {boolean} redraw
     */
    Depth.prototype.resetData = function(redraw){
        var self = this;
        self.chartData = {};
        if (self.chart) {
            var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
                askSeries = this.chart.get(this.chartId + "_ob_ask"),
                constituents = this.constituents;

            if (bidSeries && askSeries) {
                bidSeries.setData([], false, false, false);
                askSeries.setData([], false, false, false);
                bidSeries.xAxis.setExtremes(null, null, false);
            }

            if (constituents) {
                for (var cons in constituents) {
                    if (constituents.hasOwnProperty(cons)) {
                        bidSeries = self.chart.get(constituents[cons].seriesId);
                        if (bidSeries) {
                            bidSeries.setData([], false, false, false);
                        }
                    }
                }
            }

            if (redraw) {
                this.chart.redraw(false);
            }
        }
    };

    /**
     * change chart mode
     * if stacked when constituents add new series and reset the bid and ask series
     * @param {string} mode - stacked/aggregated
     */
    Depth.prototype.changeMode = function (mode) {
        var self = this;
        self.mode = mode;
        self.chartData = {};
        if (mode === 'stacked') {
            if(self.constituents.length > 0) {
                var bidSeries = self.chart.get(self.chartId + "_ob_bid");
                var askSeries = self.chart.get(self.chartId + "_ob_ask");

                if (bidSeries) {
                    bidSeries.setData([], false, false, false);
                }
                if (askSeries) {
                    askSeries.setData([], false, false, false);
                }

                self.constituents.forEach(function (constituent) {
                    var series = extend({
                        id: "stacked" + constituent.symbolId,
                        threshold: null,
                        data: [],
                        type: "area",
                        step: "center",
                        infType: "bid",
                        showInLegend: false,
                        symbol: constituent,
                        marker: {
                            enabled: false
                        }
                    }, self.theme.bid, self.config.colorTheme[constituent.symbolId]);
                    self.chart.addSeries(series, false);
                });
            }
            self.chart.update({ plotOptions: { area: {stacking: 'normal' }}});
        } else {
            self.constituents.forEach(function (constituent) {
                var series = self.chart.get('stacked' + constituent.symbolId);
                series.remove(false);
            });

            self.chart.update({ plotOptions: { area: {stacking: undefined }}});
        }

        if(self.timer){
            clearTimeout(self.timer);
            self.timer = undefined;
        }
        self._updateChart();
    };

    /**
     * set x extremes
     * this is when depth side is in the right position - depth x axis should be equal to chart y axis
     * @param {number} min
     * @param {number} max
     */
    Depth.prototype.setXExtremes = function (min, max) {
        if(this.chart) {
            var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
                xAxis = bidSeries && bidSeries.xAxis;
            if (xAxis) {
                xAxis.setExtremes(min, max, true, false);
            }
        }
    };

    /**
     * update x axis options
     * used to change to log scale and revert to linear
     * @param options
     */
    Depth.prototype.updateXAxis = function(options){
        if(this.chart){
            var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
                xAxis = bidSeries && bidSeries.xAxis;
            if (xAxis) {
                xAxis.update(options);
            }
        }
    };

    /**
     * set extremes to y axis
     * to show the constituents in the same Y scale
     * @param {number} min
     * @param {number} max
     */
    Depth.prototype.setYExtremes = function (min, max) {
        var bidSeries = this.chart.get(this.chartId + "_ob_bid"),
            yAxis = bidSeries && bidSeries.yAxis;

        if (yAxis) {
            yAxis.setExtremes(min, max, true, false);
        }
    };

    /**
     * redraw chart
     * this is done when depth side is changed
     * @param {object} chartOptions
     * @param {object} scaleFactors
     */
    Depth.prototype.redrawChart = function (chartOptions, scaleFactors) {
        if (this.chart) {
            this.chart.destroy();
            var config = this._getChartOptions(chartOptions);
            this.chart = Highcharts.chart(config);
            this.setScaleFactors(scaleFactors);

            if(this.timer){
                clearTimeout(this.timer);
                this.timer = undefined;
            }
            this._updateChart();

        }
    };

    /**
     * resize chart
     * @param {number} width
     * @param {number} height
     * @param {object} scaleFactors
     * @param {boolean} disableRedraw
     */
    Depth.prototype.resize = function (width, height, scaleFactors, disableRedraw) {
        var _self = this;
        _self.setScaleFactors(scaleFactors);
        if (_self.chart && !disableRedraw) {
            _self.chart.setSize(width, height, false);
        }
    };

    /**
     * set scale factors
     * if scaled to update mouse pointer to correct location
     * this is done by the chart extending highcharts
     * @param {object} scaleFactors
     */
    Depth.prototype.setScaleFactors = function(scaleFactors){
        if (this.chart) {
            if (scaleFactors) {
                this.chart.infScaleX = scaleFactors.infScaleX;
                this.chart.infScaleY = scaleFactors.infScaleY;
            }
        }
    };

    /**
     * set series theme
     * stacked mode - we show both bid and ask series in same color
     * @param {object} bidColorTheme
     * @param {object} askColorTheme
     */
    Depth.prototype.setColorTheme = function (bidColorTheme, askColorTheme) {
        if (this.chart) {
            var bidSeries = this.chart.get(this.chartId + "_ob_bid"), askSeries = this.chart.get(this.chartId + "_ob_ask");
            bidSeries.update(extend({}, this.theme.bid, bidColorTheme), false);
            askSeries.update(extend({}, this.theme.ask, askColorTheme), false);
            this.chart.redraw(false);
        }
    };

    Depth.prototype._xAxisLabelFormatter = function (labelObj) {
        var theme = infChart.themeManager.getTheme();
        var labelColor = theme && theme.xAxis && theme.xAxis.labels.style.color; 
        return '<span style="color: ' + labelColor + '">' + labelObj.value + '</span>';
    };

    Depth.prototype._yAxisLabelFormatter = function (labelObj) {
        var theme = infChart.themeManager.getTheme();
        var labelColor = theme && theme.xAxis && theme.xAxis.labels.style.color; 
        return '<span style="color: ' + labelColor + '">' + labelObj.value + '</span>';
    };

    return Depth;

})(Highcharts);