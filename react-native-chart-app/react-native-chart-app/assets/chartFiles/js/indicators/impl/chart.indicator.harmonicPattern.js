//region **************************************  Harmonic Pattern (HarmonicPtn) Indicator******************************************

/***
 * Constructor for  Harmonic Pattern (HarmonicPtn) Indicator
 * @param {string} id indicator id
 * @param {string} chartId chart id
 * @param {string} type indicator type
 * @constructor
 */
 infChart.HarmonicPatternIndicator = function (id, chartId, type) {

    infChart.AdvancedIndicator.apply(this, arguments);

    var self = this;
    var chart = infChart.manager.getChart(chartId).chart;

    self.axisId = "#0";
    self.series[0] = chart.addSeries({
        id: id,
        infIndType: "HarmonicPtn",
        infIndSubType: "HarmonicPtn",
        name: "Harmonic",
        type: "line",
        color: "#00aeff",
        lineColor: "#00aeff",
        infType: "indicator",
        yAxis: "#0",
        zIndex: 3,
        fillOpacity: 0.5,
        hideLegend: false,
        showInLegend: true,
        showInNavigator: false
    }, false);
};

infChart.util.extend(infChart.AdvancedIndicator, infChart.HarmonicPatternIndicator);

/**
 * Overwritting general calculate method of the indicator
 * @param {object} ohlc ohlcv data
 * @param {array} data data attay
 * @param {boolean) redraw whether to redraw chart or not
 */
infChart.HarmonicPatternIndicator.prototype.calculate = function (ohlc, data, redraw) {
    var self = this,
        open = ohlc.o,
        high = ohlc.h,
        low = ohlc.l,
        close = ohlc.c,
        xchart = infChart.manager.getChart(self.chartId),
        chart = xchart.chart;

    if (self.interval !== xchart.interval) {
        self._removeDrawings();
        self.patterns = {};
        self.selectedPattern = undefined;
    }

    if (data && data.length > 0 && self.drawings.length === 0 && !self.loading && !(self.interval === xchart.interval && xchart.checkEquivalentSymbols(xchart.symbol, self.lastRequestedSymbol))) {
        self.interval = xchart.interval;
        self.lastRequestedSymbol = xchart.symbol;
        self.loading = true;
        xchart.setLoading(true);

        self.getSeries(open, high, low, close, data, function (patternData) {
            var colors = ["#0781fb", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#ff4400", "#ff4400"];
            if (patternData && patternData.points && patternData.points.length > 0) {
                var patterns = patternData.points;
                var count = 0;
                infChart.util.forEach(patterns, function (index, value) {
                    if (value.atime && value.btime && value.ctime && value.dtime && value.xtime) {
                        //var color = colors[count % colors.length]; // TODO :: implement if needed
                        var color = colors[0];
                        count++;
                        if (!self.selectedPattern) {
                            self.selectedPattern = self.id + '_harmonicPattern_' + index;
                        }
                        self.patterns[self.id + '_harmonicPattern_' + index] = {
                            'indicatorId': self.id,
                            'drawingId': self.id + '_harmonicPattern_' + index,
                            'borderColor': color,
                            'name': value.patternname,
                            'data': {
                                "aprice": value.aprice,
                                "atime": value.atime * 1000,
                                "bprice": value.bprice,
                                "btime": value.btime * 1000,
                                "cprice": value.cprice,
                                "ctime": value.ctime * 1000,
                                "dprice": value.dprice,
                                "dtime": value.dtime * 1000,
                                "xprice": value.xprice,
                                "xtime": value.xtime * 1000,
                                "patternname": value.patternname
                            }
                        };
                    }
                });

                if (self.panel) {
                    self.removeSettingWindow();
                }

                if (xchart.isRightPanelOpen()) {
                    self.loadSettingWindow();
                } else {
                    self.patterns[self.selectedPattern] && self.drawings.push(infChart.drawingUtils.common.indicatorUtils.addHarmonicPattern(chart, undefined, self.patterns[self.selectedPattern]));
                    self._showHideDrawings();
                    self.loadSettingWindow(true);
                }
            }
            xchart.setLoading(false);
            self.loading = false
        });
    }
};

/**
 * Get series data from the service
 * @param {Array} ots open data
 * @param {Array} hts high data
 * @param {Array} lts low data
 * @param {Array} cts close data
 * @param {Array} data all data set
 * @param {function} callback callback function to be executed when data received
 */
infChart.HarmonicPatternIndicator.prototype.getSeries = function (ots, hts, lts, cts, data, callback) {
    var self = this,
        xchart = infChart.manager.getChart(self.chartId);
    var s = [];
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            s.push(data[i][0] / 1000 + "," + ots[i] + "," + hts[i] + "," + lts[i] + "," + cts[i]);
        }
    }
    xchart.dataManager.scanPattern(s.join('\n'), callback);
};
/**
 * Remove all drawings from the indicator
 * @private
 */
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};

/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Bind setting container's events
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.bindSettingsContainerEvents = function ($container) {
    var self = this;
    $container.find('li[rel=patternItem] a').on('click', function (e) {
        var el = $(this).parents("div[inf-type='ind-pattern-sel']").find("span[rel=selectItem]")[0];
        var xchart = infChart.manager.getChart(self.chartId);
        var chart = xchart.chart;

        el && el.xHtml($(this).attr("inf-pattern-name"));
        self.selectedPattern = $(this).attr('inf-pattern');

        if (!self.drawings.length || (self.drawings[0].drawingId !== self.selectedPattern)) {
            self._removeDrawings();
            self.patterns[self.selectedPattern] && self.drawings.push(infChart.drawingUtils.common.indicatorUtils.addHarmonicPattern(chart, undefined, self.patterns[self.selectedPattern]));
            self._showHideDrawings();
        }
        e.stopPropagation();
    });
    infChart.structureManager.settings.bindPanel($container, function () {
        infChart.indicatorMgr.removeIndicatorFromSettings(self.chartId, self.id);
    });
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};
/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};
infChart.HarmonicPatternIndicator.prototype._removeDrawings = function () {
    var self = this;
    self.drawings.forEach(function (drawing) {
        infChart.drawingsManager.removeDrawing(self.chartId, drawing.drawingId, false);
    });
    self.drawings = [];
};
/**
 * Return the html for the settings window
 * @returns {*}
 */
infChart.HarmonicPatternIndicator.prototype.getSettingWindowHTML = function () {
    var dropdownOptionsArr = [];
    infChart.util.forEach(this.patterns, function (index, pattern) {
        dropdownOptionsArr.push({
            id: pattern.drawingId,
            name: pattern.name,
            rel: "patternItem",
            idAttr: 'inf-pattern',
            nameAttr: 'inf-pattern-name'
        })
    });
    var paramSection = infChart.structureManager.indicator.getSeriesParameterSection({}, [], [], [], [{
        options: dropdownOptionsArr,
        type: 'ind-pattern-sel',
        label: 'Pattern'
    }]);

    return infChart.structureManager.settings.getPanelHTML(this.chartId + '-indicator-panel', this.getUniqueId(),
        infChart.manager.getLabel('label.indicatorDesc.' + this.type),
        infChart.structureManager.settings.getPanelBodyHTML([paramSection]));
};

/**
 * Initialize the settings panel
 * @param {Element} $container settings panel
 */
infChart.HarmonicPatternIndicator.prototype.initializeSettingsWindow = function ($container) {
    $container.find('li[rel=patternItem] a[inf-pattern="' + this.selectedPattern + '"]').trigger('click');
};

/**
 * hide indicator
 */
infChart.HarmonicPatternIndicator.prototype.hideIndicator = function (seriesId) {
    this.drawings[0].annotation.group.hide();
    infChart.Indicator.prototype.hideIndicator.apply(this, [seriesId, true]);
};

/**
 * show indicator
 */
infChart.HarmonicPatternIndicator.prototype.showIndicator = function (seriesId) {
    this.drawings[0].annotation.group.show();
    infChart.Indicator.prototype.showIndicator.apply(this, [seriesId, true]);
};

/**
 * show hide drawings
 */
infChart.HarmonicPatternIndicator.prototype._showHideDrawings = function () {
    if (!this.series[0].visible && this.drawings[0]) {
        this.drawings[0].annotation.group.hide();
    }
};

//endregion ************************************** Harmonic Pattern (HarmonicPtn)  Indicator******************************************
