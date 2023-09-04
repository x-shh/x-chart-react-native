/**
 * Created by dushani on 8/26/15.
 *
 * This is the api implementation which clients(outsiders from chart core) communicates with the inifinit chart.
 */
var infChart = window.infChart || {};

infChart.manager = infChart.manager || (function ($, H) {

        var _instance;
        var _charts = {};
        var _loadingMap = {};
        var _chartCustomSettings = {};
        var _defaultLanguage = 'en';
        var _favoriteDrawingToolbarConfigs = [];
        //var _supportedLanguages = ['en'];
        var _localizationOptions = {
            language: _defaultLanguage, pathPrefix: "../js/lang", skipLanguage: "en-US",
            callback: function (data, element, defaultCallback, referenceId) {

                _updateLangTitles(element);
                var highChartsOpt = _getLabel("highchart");
                highChartsOpt.decimalPoint = (!highChartsOpt.decimalPoint) ? "." : highChartsOpt.decimalPoint;
                highChartsOpt.thousandsSep = (!highChartsOpt.thousandsSep) ? "," : highChartsOpt.thousandsSep;

                H.setOptions({
                    lang: highChartsOpt
                });
                defaultCallback(data, element);
                _afterLocalize(referenceId);
            }
            /*, fileExtension:'js'*/
        };
        var _fsListeners = {exit: [], enter: []};
        var _isFullScreen = false;
        var _sizeBeforeFullScreen = {};
        var shiftKeyPressed = false;
        var _contextMenuOrder = [];

        var _updateLangTitles = function (container) {
            container.find("[title*='label.']").each(function (i, el) {
                el.title = _getLabel(el.title);
            });

            // Fix for the bootstrap tooltip
            container.find("[adv-chart-tooltip*='label.']").each(function (i, el) {
                el.setAttribute("adv-chart-tooltip", _getLabel(el.getAttribute("adv-chart-tooltip")));
            });
        };

        var _renderChart = function (container, uniqueId, properties, setDefaultProperties) {
            _chartCustomSettings[uniqueId] = properties;

            var settingsProperties = infChart.util.merge({}, infChart.settings, properties.settings);

            var config = $.extend(true, {}, infChart.config, properties.config);

            _favoriteDrawingToolbarConfigs = properties.favoriteToolBarConfigs ? properties.favoriteToolBarConfigs : [];
            _contextMenuOrder = settingsProperties.config.contextMenuOrder ? settingsProperties.config.contextMenuOrder : [];

            _addSavedFavoriteToolbarToConfig(properties.favoriteToolBarConfigs, settingsProperties.toolbar.config);

            _generateContainers(container, uniqueId, settingsProperties.toolbar, settingsProperties, config);

            var dataManager = infChart.dataProviderManager.createDataManager(settingsProperties.dataProvider);
            var chartObj = new infChart.StockChart(uniqueId, dataManager, settingsProperties);
            _charts[uniqueId] = chartObj;
            chartObj.setProviderProperties(settingsProperties.dataProvider);
            _initializeChartComponents(uniqueId, container, settingsProperties);

            if (settingsProperties.toolbar.enable) {
                infChart.toolbar.createToolbar(container, uniqueId, settingsProperties.toolbar);
            }

            _localizationOptions = $.extend(true, {}, _localizationOptions, settingsProperties.lang);
            _localizationOptions.element = container;
            _localize(uniqueId);

            _createChart(container, uniqueId, config, settingsProperties, setDefaultProperties);
            if (settingsProperties.toolbar.enable) {
                infChart.toolbar.initializeTooltips(container);
            }

            if ( chartObj.localized ) {
                //to re arrange tool bar after setting the initial values
                infChart.structureManager.rearrangeStructure(uniqueId, container[0]);
            }

            return _charts[uniqueId];
        };

        var _getFavoriteToolBarConfigs = function () {
            return _favoriteDrawingToolbarConfigs;
        };

        var _addSavedFavoriteToolbarToConfig = function(favoriteToolBarConfigs, config) {
            if (favoriteToolBarConfigs && favoriteToolBarConfigs != null) {
                favoriteToolBarConfigs.forEach( function(tbConfig) {
                    if (Object.prototype.hasOwnProperty.call(config, tbConfig.cat) 
                        && Object.prototype.hasOwnProperty.call(config[tbConfig.cat], 'options')) {
                        config[tbConfig.cat].options.forEach(function(option) {
                            if (option.shape == tbConfig.shape) {
                                option.isFavorite = tbConfig.isFavorite;
                            }
                        });
                    }
                });
            } 
        };

        /**
         * generate chart
         * @param uniqueId id of chart container
         * @param properties chart properties {}
         * @private
         */
        var _initChart = function (uniqueId, properties) {
            var _initChartStartTime = (new Date()).getTime();
            var containerElem = $('#' + uniqueId);
            var chart = _renderChart(containerElem, uniqueId, properties);
            chart.performanceCheck["_initChart"] = (new Date()).getTime() - _initChartStartTime;
            return chart;
        };

        /**
         * change chart theme
         * @param {string} theme - chart theme dark/light
         */
        var _changeChartTheme = function (theme, setDefaultColors, colorChangedProperties) {
            var charts = {};
            for (var chartId in _charts) {
                if (_charts.hasOwnProperty(chartId)) {
                    charts[chartId] = _getChartCustomSettingsForThemeChange(chartId, theme, setDefaultColors, colorChangedProperties);
                }
            }
            _setChartTheme(theme);
            for(var chartId in charts) {
                if (charts.hasOwnProperty(chartId)) {
                    var newChartConfig = charts[chartId];
                    _onChangeChartTheme(chartId, newChartConfig, setDefaultColors);
                }
            }
        };
        
        var _changeChartThemeByChartId = function (chartId, theme) {
            var chartCustomSettings;
            if (chartId && _charts.hasOwnProperty(chartId)) {
                chartCustomSettings = _getChartCustomSettingsForThemeChange(chartId);
            }
            _setChartTheme(theme);
            _onChangeChartTheme(chartId, chartCustomSettings);
        };


        var _onChangeChartTheme = function (chartId, newChartConfig, setDefaultColors) {
            var containerElem = $('#' + chartId);
            var chart = _charts[chartId];
            _removeChart(chartId);
            var newChartInstance = infChart.manager.renderChart(containerElem, chartId, newChartConfig, setDefaultColors);
            newChartInstance.range = {};
            if (newChartConfig.settings.config.userExtremes && newChartConfig.settings.config.userExtremes.xAxis) {
                var xExtremes = newChartConfig.settings.config.userExtremes.xAxis;
                _setUserDefinedXAxisExtremes(chartId, xExtremes.userMin, xExtremes.userMax, true, true);
            }
            if (newChartConfig.settings.config.userExtremes && newChartConfig.settings.config.userExtremes.yAxis) {
                var yExtremes = newChartConfig.settings.config.userExtremes.yAxis;
                _setUserDefinedYAxisExtremes(chartId, yExtremes.userMin, yExtremes.userMax, true, true);
            }
            if (chart._hasRegisteredMethod('onThemeChange')) {
                chart._fireRegisteredMethod('onThemeChange', [newChartInstance]);
            }
        };

        var _updateChartAxisColors = function(chartId, theme) {
            var chart = _getChart(chartId);

            var darkTheme = infChart.themeManager.getDarkTheme();
            var lightTheme = infChart.themeManager.getLightTheme();

            var darkThemeXaxisLabelColor = darkTheme.xAxis.labels.style.color;
            var darkThemeYaxisLabelColor = darkTheme.yAxis.labels.style.color;

            var lightThemeXaxisLabelColor = lightTheme.xAxis.labels.style.color;
            var lightThemeYaxisLabelColor = lightTheme.yAxis.labels.style.color;

            var xAxisLabelColor = theme === "dark" ? darkThemeXaxisLabelColor : lightThemeXaxisLabelColor;
            var yAxisLabelColor = theme === "dark" ? darkThemeYaxisLabelColor : lightThemeYaxisLabelColor;

            if(chart) {
                chart.chart.xAxis[0].update({
                    labels: {
                        style: {
                            color: xAxisLabelColor
                        }
                    }
                }, false);
                chart.chart.yAxis[0].update({
                    labels: {
                        style: {
                            color: yAxisLabelColor
                        }
                    }
                }, false);

                chart.chart.redraw();
            }
        };

        /**
         * get chart custo settings for theme change
         * @param {string} chartId - chart Id
         * @returns {object} chart settings object
         */
        var _getChartCustomSettingsForThemeChange = function (chartId, theme, setDefaultColors, colorChangedProperties) {

            var chart = _getChart(chartId);
            var currentConfig = _getProperties(chartId, infChart.constants.fileTemplateTypes.all);
            var customSettings = _chartCustomSettings[chartId];
            var themeData = theme == "dark" ? infChart.themeManager.getDarkTheme() : infChart.themeManager.getLightTheme();

            customSettings.settings.config = infChart.util.merge({}, customSettings.settings.config, currentConfig);
            customSettings.settings.symbol = infChart.util.merge({}, customSettings.settings.symbol, currentConfig.mainSymbol);
            customSettings.settings.config.mainSeriesOptions = currentConfig.mainSeriesOptions;

            if(theme && setDefaultColors) {
                _removeSeriesColorProperties(currentConfig.mainSeriesOptions);
                if(customSettings.settings.config && customSettings.settings.config.indicators && infChart.indicatorMgr){
                    infChart.indicatorMgr.resetIndicatorsColors(customSettings.settings.config.indicators, themeData.indicator);
                }
                _removeCompareSeriesColors(currentConfig.compareSeriesOptions);

                customSettings.settings.config.backgroundColor = themeData.chart.backgroundColor;
                customSettings.settings.config.chartBgTopGradientColor = themeData.chart.chartBgTopGradientColor;
                customSettings.settings.config.chartBgBottomGradientColor = themeData.chart.chartBgBottomGradientColor;
                customSettings.settings.config.backgroundType = "solid";
                customSettings.settings.config.gridSettings.xGridLineColor = themeData.xAxis.gridLineColor;
                customSettings.settings.config.gridSettings.yGridLineColor = themeData.yAxis.gridLineColor;
            }

            if(!chart.customGridLineColorEnabled && colorChangedProperties && !colorChangedProperties.gridLineColor) {
                customSettings.settings.config.gridSettings.xGridLineColor = themeData.xAxis.gridLineColor;
                customSettings.settings.config.gridSettings.yGridLineColor = themeData.yAxis.gridLineColor;
            }

            customSettings.settings.config["userExtremes"] = {};
            customSettings.settings.config["selectedSettingTabOptions"] = {};

            if(!_isDefaultXAxisExtremes(chartId)) {
                var xExtremes = chart.getMainXAxis().getExtremes();
                customSettings.settings.config["userExtremes"]["xAxis"] = {
                    userMax: xExtremes.userMax,
                    userMin: xExtremes.userMin
                }
            }

            if(!_isDefaultYAxisExtremes(chartId)) {
                var yExtremes = chart.getMainYAxis().getExtremes();
                customSettings.settings.config["userExtremes"]["yAxis"] = {
                    userMax: yExtremes.userMax,
                    userMin: yExtremes.userMin
                }
            }

            if (customSettings.settings.config.rightPanel) {
                var tabOptions = chart.getActiveSettingsTabOptions();
                customSettings.settings.config["selectedSettingTabOptions"] = tabOptions;
            }

            return customSettings;
        };

        var _removeSeriesColorProperties = function(mainSeriesOptions) {

            if(mainSeriesOptions.color){
                delete mainSeriesOptions.color;
            }
            if(mainSeriesOptions.fillColor){
                delete mainSeriesOptions.fillColor;
            }
            if(mainSeriesOptions.lineColor){
                delete mainSeriesOptions.lineColor;
            }
            if(mainSeriesOptions.upColor){
                delete mainSeriesOptions.upColor;
            }
            if(mainSeriesOptions.upLineColor){
                delete mainSeriesOptions.upLineColor;
            }

        };

        var _removeCompareSeriesColors = function(compareSeries) {
                compareSeries.forEach(function(series){
                    if(series.color){
                        delete series.color;
                    }
                    if(series.fillColor){
                        delete series.fillColor;
                    }
                    if(series.lineColor){
                        delete series.lineColor;
                    }
                })
        };

        /**
         * set chart theme
         * @param {string} theme - chart theme dark/light
         */
        var _setChartTheme = function (theme) {
            infChart.themeManager.setTheme(theme);
        };

        var _setSelectToolbarIconOnReset = function (uniqueId, container) {
            if( infChart.drawingsManager){
                 infChart.drawingsManager.setSelectToolbarIconOnReset(uniqueId, container);
            }
        };

        /**
         * create highcharts
         * @param containerElem chart container
         * @param containerId container id of chart container
         * @param config chart properties object
         * @param settings chart settings object
         * @private
         */
        var _createChart = function (containerElem, containerId, config, settings, setDefaultProperties) {
            var chartObj = _charts[containerId];
            try {
                var chartId = _getChartId(containerId), chartContainer = document.getElementById(chartId);

                if (chartContainer) {
                    //mouseWheelController, hasEmpty = false, dummyIds = [];

                    //config.chart.renderTo = chartContainer;
                    //config.chart.infContainer = containerId;
                    //config.chart.infChart = true;
                    //config.chart.infScalable = settings.config.scalable;
                    //config.navigator.enabled = settings.config.navigator;
                    //var chartH = chartContainer.offsetHeight;
                    //config.navigator.height = (chartH) ? infChart.util.getNavigatorHeight(chartH, config) :
                    //    settings.config.navigatorHeight ? settings.config.navigatorHeight : config.navigator.height;
                    //
                    //
                    //// copy the plot options of the main yAxis to all indicator yAxis
                    //infChart.util.forEach(config.yAxis, function (index, axis) {
                    //    $.extend(axis, config.plotOptions.yAxis);
                    //});
                    //
                    ////// set empty data
                    //infChart.util.forEach(config.series, function (index, series) {
                    //
                    //    if (series.infType == 'base') {
                    //        series.infRefresh = settings.config.refreshBtn;
                    //    } else if (series.infType == 'dummy') {
                    //        hasEmpty = true;
                    //        dummyIds.xPush(series.id);
                    //    }
                    //
                    //    if (!series.data) {
                    //        $.extend(series, {data: []});
                    //    }
                    //    series.infHideClose = settings.config.hideClose;
                    //    series.infHideSettings = typeof settings.config.hideSettings !== 'undefined' ? settings.config.hideSettings :  false;
                    //});
                    //
                    //
                    //if (settings.config.displayAllIntervals && dummyIds.indexOf(infChart.constants.dummySeries.missingId) < 0) {
                    //    config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.missingId));
                    //}
                    //
                    //if (settings.config.panToFuture && dummyIds.indexOf(infChart.constants.dummySeries.forwardId) < 0) {
                    //    config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.forwardId));
                    //}
                    //
                    //if (settings.config.panToPast && dummyIds.indexOf(infChart.constants.dummySeries.backwardId) < 0) {
                    //    config.series.xPush(infChart.util.getDummySeriesConfig(infChart.constants.dummySeries.backwardId));
                    //}

                    /*
                     //  var dataManager = infChart.dataProviderManager.createDataManager(settings.dataProvider.type, settings.dataProvider.url, settings.dataProvider.source,);
                     var dataManager = infChart.dataProviderManager.createDataManager(settings.dataProvider);*/

                    //IMPORTANT :: need to rearrangeStructure before creating Highcharts.StockChart to fix the issue of displaying chart area under the left tool bar when loading
                    var size = infChart.structureManager.rearrangeStructure(containerId, containerElem[0]);
                    infChart.util.console.debug('chart :: height => ' + (( size && size.height) || "undefined") + ', width => ' + ((size && size.width) || "undefined"));

                    //chart = new H.StockChart(config);
                    //
                    //if (settings.config.mouseWheelController /*&& settings.config.navigator*/) {
                    //    mouseWheelController = new infChart.MouseWheelController(chart);
                    //}

                    chartObj.createHighchartInstance(chartId, chartContainer, config, settings);

                    containerElem.data("infChart", chartObj);

                    //if (settings.config.mouseWheelController /*&& settings.config.navigator*/) {
                    //    mouseWheelController.initialize();
                    //}

                    //$("#" + chartId + " .highcharts-container").append('<div class="tt_panelDiv" style="overflow : hidden; position: absolute; margin: 0px !important; top: 0px; left: 0px; width: 854px; height: 273px; z-index: -10"></div>');
                    //chartObj.setProviderProperties(settings.dataProvider);
//                chartObj.setProperties(settings.config);

                    //_initializeFullScreen();

                    //if (settings.toolbar.enable) {
                    //    infChart.toolbar.createToolbar(containerElem, containerId, settings.toolbar);
                    //}

//                if (infChart.toolbar) {
//                    infChart.toolbar.setDefaultValues(containerElem, settings.config);
//                }
                    _setSymbol(containerId, settings.symbol, settings.config, true, setDefaultProperties);

                    //if (settings.toolbar && settings.toolbar.config) {
                    //    chartObj.setMinMaxOptions(settings.toolbar.config.minMax);
                    //    chartObj.initNews(settings.toolbar.config.news);
                    //    settings.toolbar.config.interval && chartObj.setIntervalOptions(settings.toolbar.config.interval.options);
                    //}
                    //
                    //chartObj.updateMinMax();
                    //chartObj.updatePriceLines();
                }
            }
            catch (ex) {
                infChart.util.console.error(ex);
                //} finally {
                //    if(chartObj.localized) {
                //         to re arrange tool bar after setting the initial values
                //infChart.structureManager.rearrangeStructure(containerId, containerElem[0]);
                //}
            }
        };

        var _setSymbol = function (containerId, symbol, config, reset, setDefaultChartSettings) {
            if (reset) {
                config.setProperties = true;
            }
            if(config.setProperties){
                if (typeof infChart.drawingsManager !== 'undefined') {
                    infChart.drawingsManager.removeAllDrawings(containerId);
                }
            }
            var chart = _charts[containerId];
            if (chart) {
                chart.setSymbol(symbol, true, false, config, setDefaultChartSettings);
            }
            
        };

        //var _updateChartObj = function (containerId, chart, chartId, mouseWheelController, settings) {
        //    if (_charts[containerId]) {
        //        _charts[containerId].resetProperties(chart, mouseWheelController, settings);
        //    } else {
        //        var dataManager = infChart.dataProviderManager.createDataManager(settings.dataProvider);
        //        var chartObj = new infChart.StockChart(containerId, chart, chartId, dataManager, mouseWheelController, settings);
        //        _charts[containerId] = chartObj;
        //    }
        //};

        var _initializeChartComponents = function (containerId, containerElem, settings) {
            if (settings.config.trading && infChart.tradingManager) {
                infChart.tradingManager.createTrader(containerId, settings.dataProvider.tradingService, settings.tradingOptions);
                if (settings.toolbar.enable && settings.toolbar.tradingTb) {
                    infChart.tradingManager.createTradingToolbar(containerElem, containerId, settings.toolbar);
                }
            }
            
            if(settings.config.isMobile){
                if (infChart.mobileDrawingsManager) {
                    infChart.mobileDrawingsManager.initialize(containerId, settings.dataProvider.drawingService, settings.config.disableDrawingSettingsPanel);
                    if (settings.toolbar.enable && settings.toolbar.leftTb) {
                        infChart.mobileDrawingsManager.createDrawingToolbar(containerElem, containerId, settings.toolbar.leftTb, settings.toolbar.config, settings.toolbar.left, settings.config.showDrawingToolbarButtons, false, undefined, settings.config.isGloballyLocked);
                        if(settings.config.favoriteMenuEnabled){
                            infChart.mobileDrawingsManager.createDrawingToolbar(containerElem, containerId, settings.toolbar.leftTb, settings.toolbar.config, settings.toolbar.left, settings.config.showDrawingToolbarButtons, true, undefined, settings.config.isGloballyLocked);
                        }
                    }
                    if(settings.config.isMobile){
                        infChart.drawingsManager = infChart.mobileDrawingsManager;
                    }
                }
            } else {
                if (infChart.drawingsManager) {
                    infChart.drawingsManager.initialize(containerId, settings.dataProvider.drawingService, settings.config.disableDrawingSettingsPanel);
                    if (settings.toolbar.enable && settings.toolbar.leftTb) {
                        infChart.drawingsManager.createDrawingToolbar(containerElem, containerId, settings.toolbar.leftTb, settings.toolbar.config, settings.toolbar.left, settings.config.showDrawingToolbarButtons, false, undefined, settings.config.isGloballyLocked);
                        if(settings.config.favoriteMenuEnabled){
                            infChart.drawingsManager.createDrawingToolbar(containerElem, containerId, settings.toolbar.leftTb, settings.toolbar.config, settings.toolbar.left, settings.config.showDrawingToolbarButtons, true, undefined, settings.config.isGloballyLocked);
                        }
                    }
                }
            }

            if (infChart.indicatorMgr) {
                infChart.indicatorMgr.initialize(containerId, settings.indicatorOptions);
            }

            if (infChart.depthManager) {
                var depthToolbarCfg = settings && settings.toolbar && settings.toolbar.config && settings.toolbar.config.depth;
                infChart.depthManager.initialize(containerId, containerElem[0], depthToolbarCfg, settings.config.depth);
            }

            if (settings.config.alert && infChart.alertManager ) {
                infChart.alertManager.initialize(containerId, settings.dataProvider.alertService, settings.alertOptions);
            }

            if (infChart.templatesManager) {
                infChart.templatesManager.initialize(containerId, settings.dataProvider.templateService);
            }

            if (infChart.favouriteColorManager) {
                infChart.favouriteColorManager.initialize(settings.dataProvider.favoriteColorService);
            }

            if (infChart.intradayChartManager) {
                infChart.intradayChartManager.initialize(containerId, containerElem, settings);
            }
            if (infChart.globalSettingsManager) {
                infChart.globalSettingsManager.initialize(settings.dataProvider.globalUserSettingsService);
            }

            if (infChart.intradayChartManager) {
                infChart.intradayChartManager.initialize(containerId, containerElem, settings);
            }
            if (infChart.globalSettingsManager) {
                infChart.globalSettingsManager.initialize(settings.dataProvider.globalUserSettingsService);
            }
        };

        /**
         * generate chart container and other containers related to chart
         * @param containerElem
         * @param uniqueId
         * @param toolbarProperties
         * @param settings
         * @param config
         * @private
         */
        var _generateContainers = function (containerElem, uniqueId, toolbarProperties, settings, config) {
            containerElem[0].setAttribute("inf-unique-id", uniqueId);

            var toolbarEnabled = toolbarProperties && toolbarProperties.enable === true && infChart.toolbar;
            containerElem.html(infChart.structureManager.getStructure(toolbarEnabled, toolbarProperties));

            var legendHtml = '';
            if (config && config.legend && config.legend.enabled) {
                legendHtml = infChart.structureManager.legend.getStructureHTML();
            }

            containerElem.find('div[inf-container="chart_top"]').html(legendHtml);

            if (toolbarEnabled) {
                infChart.toolbar.setHTML(containerElem, toolbarProperties, uniqueId, settings.config);
                containerElem.find('div[inf-ref="chart_row"]').addClass(toolbarProperties.left ? 'left-toolbar' : 'no-left-toolbar');
                containerElem.addClass("full-screen-container");
            }

            containerElem.find('div[inf-container="chart"]').addClass('mainchart_chart clearfix');
            containerElem.find('div[inf-container="chart"]').attr('id', _getChartId(uniqueId));
            containerElem.addClass("inf-chart");
        };

        /**
         * Generate and return chart container ID
         * @param uniqueId
         * @returns {string}
         * @private
         */
        var _getChartId = function (uniqueId) {
            return uniqueId + '_chart';
        };

        var _getContainerIdFromChart = function (chartId) {

            return chartId.indexOf("_") >= 0 ? chartId.slice(0, chartId.lastIndexOf("_")) : chartId;
        };

        /**
         * Returns chart highstock chart object
         * @param container
         * @returns {*}
         * @private
         */
        var _getChart = function (container) {
            return _charts[container]
        };

        /**
         * Returns all chart objects available
         * @returns {object} array of charts
         * @private
         */
        var _getAllAvailableCharts = function () {
            return _charts;
        };

        var _exportChart = function (containerId, exportType, afterPrintCallback) {
            if (infChart.util.isSafari() && _isFullScreen) {
                _addFullScreenListeners(containerId, "exit", function () {
                    _export(containerId, exportType, afterPrintCallback);
                });
                _exitFullscreen();
            } else {
                _export(containerId, exportType, afterPrintCallback);
            }
        };

        /**
         * export chart as binary data
         * @param {string} containerId - chart id
         * @returns {string} - binary data
         */
        var _exportChartAsBinaryData = function (containerId) {
            var chart = _charts[containerId], exportData;
            if (chart) {
                exportData = chart.exportChartAsBinaryData();
            }
            return exportData;
        };

        var _export = function (containerId, exportType, afterPrintCallback) {
            var chart = _charts[containerId];
            if (chart) {
                switch (exportType) {
                    case 'print':
                        chart.printChart(afterPrintCallback);
                        break;
                    default:
                        chart.exportChartToImage(exportType);
                        break;
                }
            }
        };

        /***
         * Removes the given series from given chart instance
         * @param event
         * @param chartId
         * @param seriesId
         * @param type
         * @private
         */
        var _removeSeries = function (chartId, seriesId, type, event) {
            var contId = _getContainerIdFromChart(chartId);
            var chart = _charts[contId];
            if (chart) {
                chart.removeSeriesFromChart(seriesId, type);
            }
            if (event) {
                event.stopPropagation();
            }
        };

        /***
         * Refresh the given series of given chart instance
         * @param event
         * @param chartId
         * @param seriesId
         * @private
         */
        var _refreshSeries = function (event, chartId, seriesId) {
            _charts[_getContainerIdFromChart(chartId)].refreshSeries(seriesId);
            event.stopPropagation();
        };
        /***
         * Reload given chart instance
         * @param event
         * @param chartId
         * @param seriesId
         * @private
         */
        var _reloadData = function (chartId) {
            var iChart = _charts[_getContainerIdFromChart(chartId)];
            iChart && iChart.reloadData();
        };

        // /**
        //  * Update tool tip of given series
        //  * @param chartId
        //  * @param seriesId
        //  * @param x
        //  * @private
        //  */
        // var _updateSeriesToolTip = function (chartId, seriesId, x) {
        //     _charts[_getContainerIdFromChart(chartId)].updateToolTip(seriesId, x);
        // };

        /**
         * get legend for series
         * @param {object} series - series
         * @returns {string} '' - used this method as labelFormatter in legend(HC). And this method needs to return string value
         * @private
         */
        var _getLegend = function (series) {
            _setLegend(series);
            return '';
        };

        /**
         * set series legend
         * @param {object} series - series
         */
        var _setLegend = function (series) {
            if (infChart.util.isLegendAvailable(series.options)) {
                var chartId = series.chart.renderTo.id,
                    containerId = _getContainerIdFromChart(chartId),
                    seriesId = series.options.id,
                    seriesInfType = series.options.infType,
                    title = _getLegendTitle(chartId, series, seriesInfType),
                    color = series.color,
                    seriesType = series.type,
                    showSettings = !series.options.infHideSettings,
                    showRefresh = seriesInfType == 'base' && series.options.infRefresh,
                    showClose = seriesInfType != 'base',
                    showHide = seriesInfType != 'base',
                    iChart = _getChart(_getContainerIdFromChart(chartId));

                var onSettingsClick, onRefreshClick, onClose, onHide, onSymbolTitleLegendClicked;
                if (showSettings) {
                    onSettingsClick = function (e) {
                        _legendSeriesClick(chartId, seriesId, seriesInfType);
                        if (infChart.toolbar) {
                            infChart.toolbar.setSelectedControls(containerId, "rightPanel", true);
                        }

                        e.stopPropagation();
                    };
                }
                if (showRefresh) {
                    onRefreshClick = function (e) {
                        _refreshSeries(e, chartId, seriesId, seriesInfType);
                    };
                }
                if (showClose) {
                    onClose = function (e) {
                        _removeSeries(chartId, seriesId, seriesInfType, e);
                    };
                }
                if (showHide) {
                    onHide = function (e) {
                        let legend = $(e.currentTarget);
                        let icon = legend.find("i[rel=hide-icon]");

                        icon.removeClass("fa-eye fa-eye-slash");

                        let chart = _getContainerIdFromChart(chartId);

                        if(series.userOptions.infType == "compare"){
                            if (series.visible) {
                                icon.addClass("fa-eye-slash");
                                infChart.manager.showHideCompareSymbol(chart, series, false, true);
                                e.data.legend.addClass("legend-items--hide");
                            } else {
                                icon.addClass("fa-eye");
                                infChart.manager.showHideCompareSymbol(chart, series, true, true);
                                e.data.legend.removeClass("legend-items--hide");
                            }
                        }
                        if(series.userOptions.infType == "indicator"){
                            if (series.visible) {
                                icon.addClass("fa-eye-slash");
                                infChart.indicatorMgr.showHideIndicator(chart, seriesId, false, true);
                                e.data.legend.addClass("legend-items--hide");
                            } else {
                                icon.addClass("fa-eye");
                                infChart.indicatorMgr.showHideIndicator(chart, seriesId, true, true);
                                e.data.legend.removeClass("legend-items--hide");
                            }
                        }

                        e.stopPropagation();
                    };
                }
                if (title === undefined) {
                    title = "";
                }
                onSymbolTitleLegendClicked = function(event) {
                    var ichart = _charts[_getContainerIdFromChart(chartId)];
                    ichart._fireRegisteredMethod('onClickLegendSymbolTitle', [event]);
                }
                infChart.structureManager.legend.setLegendForSeries(containerId, seriesId, seriesInfType, title, color, seriesType, onSettingsClick, onRefreshClick, onClose, iChart.isTooltipEnabled(), onSymbolTitleLegendClicked, onHide, series.visible);
            }
        };

        var _showHideCompareSymbol = function (chartId, series, isShow, isPropertyChange) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if(chart && chart.container){
                var legendItem = $(chart.container).find('[inf-legend-item][inf-series="' + series.userOptions.id + '"]').find('[inf-legend-items]');
                if(isShow){
                    series.show();
                    series.visible = true;
                    if(legendItem){
                        legendItem.removeClass("legend-items--hide");
                    }
                } else {
                    series.hide();
                    series.visible = false;
                    if(legendItem){
                        legendItem.addClass("legend-items--hide");
                    }
                }
                if(isPropertyChange) {
                    chart._onPropertyChange("compareSymbol");
                }
            }
        };

        /**
         * get description to show in legend
         * @param chartId
         * @param series series object
         * @param type series type
         * @returns {*}
         * @private
         */
        var _getLegendTitle = function (chartId, series, type) {
            var containerId = _getContainerIdFromChart(chartId);
            var title;
            if (type === 'indicator') {
                title = infChart.indicatorMgr.getLegendTitle(containerId, series);
            } else {
                var chart = _charts[containerId];
                if (chart) {
                    title = chart.getLegendTitle(series);
                } else {
                    title = series.options.name;
                }
            }
            
            return  (!title) ? "" : title;
        };

        /**
         * update cross hair line
         * @param chartId
         * @param x
         * @param y
         * @param points
         * @returns {*}
         * @private
         */
        var _updateCrosshair = function (chartId, x, y, points) {
            return _charts[_getContainerIdFromChart(chartId)].updateCrosshair(x, y, points);
        };

        /**
         * update cross hair line
         * @param chartId
         * @param x
         * @param y
         * @param points
         * @returns {*}
         * @private
         */
        var _updateCrosshairFromToolTip = function (chartId, x, y, points) {
            return _charts[_getContainerIdFromChart(chartId)].updateCrosshairFromToolTip(x, y, points);
        };

        /**
         * set cross hair visibility
         * @param {Highcharts} chart - highcharts obj
         * @private
         */
        var _chartMouseOutEvent = function (chart) {
            var chartId = chart.renderTo.id,
                ichart = _charts[_getContainerIdFromChart(chartId)];

            ichart.showCrosshair(false);
            if (ichart._hasRegisteredMethod('onChartMouseOut')) {
                ichart._fireRegisteredMethod('onChartMouseOut');
            }
            _updateTooltipToLastPoint(ichart);
        };

        /**
         * Executes when mouse is leaving a a series
         * @param {Highcharts} chart - highcharts obj
         * @param {string} eventType - event type
         * @param {object} target - target object of the event type
         * @private
         */
        var _seriesMouseOutEvent = function (chart, eventType, target) {
            var chartId = chart.renderTo.id,
                ichart = _charts[_getContainerIdFromChart(chartId)];

            if (eventType == "series") {
                ichart.onSeriesMouseOut(target)
            }
        };

        /**
         * Execute on mouse over of a series
         * @param chart
         * @param series
         * @returns {*}
         * @private
         */
        var _seriesMouseOverEvent = function (chart, series) {
            var chartId = chart.renderTo.id,
                ichart = _charts[_getContainerIdFromChart(chartId)];

            ichart.onSeriesMouseOver(series);
        };

        /**
         * Returns the list of point aligned with given  point or point array
         * @param pointObj
         * @returns {Array}
         * @private
         */
        var _getPointsOfToolTip = function (pointObj) {
            var point = pointObj.points && pointObj.points[0] && pointObj.points[0].point || pointObj.point,
                series = point && point.series, basePoint;
            var points = [], pointHash = {};
            if (pointObj.points && pointObj.points.length > 0) {
                infChart.util.forEach(pointObj.points, function (indx, value) {
                    pointHash[value.series.index] = indx;
                    points.xPush(value.point);
                    if (value.series.options.infType == "base") {
                        basePoint = value.point ? value.point : value;
                    }

                });
            } else if (point) {
                points.xPush(point);
            }
            /*if (point && series.options.type == "flags" && series.options.type == "infsignal"  ) {
             series.chart.series.forEach(function (sr, indx) {
             if (pointHash[sr.index] == undefined && sr.index != series.index && sr.name.toLowerCase().indexOf("navigator") < 0) {
             var pointIdx = sr.processedXData.indexOf(pointObj.x);
             if (pointIdx != -1 && sr.points && sr.points[pointIdx]) {
             points.push(sr.points[pointIdx]);
             }
             }
             });
             } else */
            if (point && (
                (series.chart.options.navigator.enabled && points.length != series.chart.series.length - series.chart.options.navigator.series.length ) ||
                (!series.chart.options.navigator.enabled && points.length != series.chart.series.length) )) {
                infChart.util.forEach(series.chart.series, function (indx, sr) {
                    if (sr && pointHash[sr.index] == undefined && sr.index != series.index && sr.name.toLowerCase().indexOf("navigator") < 0) {
                        var pointIdx = sr.processedXData && sr.processedXData.indexOf(pointObj.x);
                        if (pointIdx >= 0 && sr.points && sr.points[pointIdx] && !sr.points[pointIdx].isNull) {
                            points.xPush(sr.points[pointIdx]);
                            if (sr.options.infType == "base") {
                                basePoint = sr.points[pointIdx];
                            }
                        } else if (sr.points && basePoint && basePoint.series.hasGroupedData && basePoint.dataGroup) {
                            var basePointGrp = basePoint.dataGroup;
                            for (var i = basePointGrp.start; i < (basePointGrp.start + basePointGrp.length); i++) {
                                var srIndx = sr.processedXData && sr.processedXData.indexOf(basePoint.series.xData[i]);
                                if (srIndx >= 0 && !sr.points[srIndx].isNull) {
                                    points.xPush(sr.points[srIndx]);
                                }
                            }
                        }
                    }
                });
            }
            return points;
        };

        /**
         * Update the tooltip data of symbols with the last point
         * @private
         */
        var _updateTooltipToLastPoint = function (chart, force) {
            chart && chart.updateTooltipToLastPoint(force);
        };

        /**
         * get value for tooltips for given point
         * @param pointObj tooltip point
         * @returns {*}
         * @private
         */
        var _getTooltipValue = function (pointObj) {
            var chart, baseSymbolData = {}, compareSymData = {}, indicatorData = {};

            var points = _getPointsOfToolTip(pointObj);

            if (points) {
                infChart.util.forEach(points, function (i, point) {
                    if (typeof chart === 'undefined') {
                        chart = _charts[_getContainerIdFromChart(point.series.chart.renderTo.id)];
                    }
                    if (point.series) {
                        switch (point.series.options.infType) {
                            case 'news':
                                infChart.util.console.log(point);
                                //newsHtml.push(chart.getNewsTooltipValue(point));
                                break;
                            case 'flags':
                                infChart.util.console.log(point);
                                //newsHtml.push(chart.getFlagTooltipValue(point));
                                break;
                            case 'indicator':
                                if (!point.series.options.hideToolTip) {
                                    indicatorData[point.series.options.id] = chart.getIndicatorTooltipValue(point);
                                }
                                break;
                            case 'compare':
                                compareSymData[point.series.options.id] = chart.getTooltipValue(point, false);
                                break;
                            case 'base':
                                baseSymbolData = chart.getTooltipValue(point, true);
                                break;
                            case 'dummy':
                                if (point.series.options.id == infChart.constants.dummySeries.forwardId) {
                                    var lastPoint = chart.getLastPoint();
                                    if (lastPoint) {
                                        baseSymbolData = chart.getTooltipValue(chart.getLastPoint(), true);
                                    }
                                }
                                break;
                            default :
                                break;

                        }
                    }
                });
            }
            return {
                base: baseSymbolData,
                compare: compareSymData,
                indicator: indicatorData
            };
        };

        /**
         * get value for tooltips for given point
         * @param tooltipData tooltip data
         * @returns {*}
         * @private
         */
        var _getTooltipHTML = function (tooltipData) {
            var baseHtmlMap = {};
            if (tooltipData.base && tooltipData.base.formatted !== 'undefined') {
                var isPositiveChange;
                if (tooltipData.base.raw && tooltipData.base.raw.open && tooltipData.base.raw.close) {
                    isPositiveChange = tooltipData.base.raw.open < tooltipData.base.raw.close;
                }

                tooltipData.base.displayItems &&
                infChart.util.forEach(tooltipData.base.displayItems, function (i, value) {
                    baseHtmlMap[value] = infChart.structureManager.tooltip.getTooltipValueItemHtml(value, tooltipData.base.formatted[value], isPositiveChange);
                });

            }

            var compareSymHtmlMap = {};
            if (tooltipData.compare) {
                for (var compareSymbol in tooltipData.compare) {
                    if (tooltipData.compare.hasOwnProperty(compareSymbol)) {
                        var compareData = tooltipData.compare[compareSymbol];
                        if (compareData && compareData.formatted !== 'undefined') {
                            var htmlMap = {};
                            var isComparePositiveChange;
                            /*if (compareData.raw && compareData.raw.open && compareData.raw.close) {
                             isComparePositiveChange = compareData.raw.open < compareData.raw.close;
                             }*/
                            compareData.displayItems && infChart.util.forEach(compareData.displayItems, function (i, value) {
                                if (value == "volume") {
                                    htmlMap[value] = infChart.structureManager.tooltip.getTooltipValueItemHtml(value, compareData.formatted[value], isComparePositiveChange, false, true);
                                } else {
                                    htmlMap[value] = infChart.structureManager.tooltip.getTooltipValueItemHtml(value, compareData.formatted[value], isComparePositiveChange, true);
                                }
                            });
                            compareSymHtmlMap[compareSymbol] = htmlMap;
                        }
                    }
                }
            }

            var indicatorHtmlMap = {};
            if (tooltipData.indicator) {
                for (var indicator in tooltipData.indicator) {
                    if (tooltipData.indicator.hasOwnProperty(indicator)) {
                        var indicatorData = tooltipData.indicator[indicator];
                        if (indicatorData && typeof indicatorData.formatted !== 'undefined') {
                            if (indicatorData.formatted.time) {
                                indicatorHtmlMap['time'] = infChart.structureManager.tooltip.getIndicatorTooltipValueItemHtml('time', indicatorData.formatted.time);
                            }
                            if (indicatorData.formatted.value) {
                                indicatorHtmlMap[indicatorData.label] = infChart.structureManager.tooltip.getIndicatorTooltipValueItemHtml(indicatorData.label, indicatorData.formatted.value, indicatorData.color);
                            }
                        }
                    }
                }
            }

            //infChart.structureManager.getNewsTooltipValueItemHtml(this.getNewsTooltipValue(point).formatted);

            //var tooltipData = this.getFlagToolTipValue(point);
            //return infChart.structureManager.getFlagsTooltipValueItemHtml(tooltipData.formatted, tooltipData.color);

            return {
                baseHTML: baseHtmlMap,
                compareSymHTML: compareSymHtmlMap,
                indHTML: indicatorHtmlMap
            };
        };

        var _localize = function (referenceId) {
            infChart.langManager.localize(_getLocalizationOptions(referenceId));
        };

        var _getLocalizationOptions = function (referenceId) {
            return $.extend(_localizationOptions, {referenceId: referenceId});
        };

        ////todo : remove
        //var _setLanguage = function (lang) {
        //    if (_supportedLanguages.indexOf(lang) >= 0) {
        //        _localizationOptions.language = lang;
        //        _localize();
        //    }
        //};

        /**
         * rearrange structure after localize
         * @param referenceId
         * @private
         */
        var _afterLocalize = function (referenceId) {

            function rearrangeStructure(uniqueId) {
                _charts[uniqueId].localized = true;
                var containerElem = $('#' + uniqueId);
                infChart.structureManager.rearrangeStructure(uniqueId, containerElem[0]);
            }

            if (referenceId) {
                if (_charts[referenceId]) {
                    rearrangeStructure(referenceId);
                }
            } else {
                for (var uniqueId in _charts) {
                    if (_charts.hasOwnProperty(uniqueId)) {
                        rearrangeStructure(uniqueId);
                    }
                }
            }
        };

        var _legendSeriesClick = function (chartId, seriesId, infType) {
            if (infType === 'indicator') {
                infChart.indicatorMgr.indicatorLegendClick(_getContainerIdFromChart(chartId), seriesId);
            } else {
                _charts[_getContainerIdFromChart(chartId)].seriesLegendClick(seriesId, infType);
            }
        };

        var _afterRedraw = function (chartId) {
            var iChart = _charts[_getContainerIdFromChart(chartId)];

            if (iChart && iChart.afterRedraw && iChart.isAfterRedrawRequired()) {
                setTimeout(function () {
                    iChart.afterRedraw(chartId);
                }, 1);
            }
        };

        /**
         * Save Chart as a template
         * @param chartId
         * @param name
         * @param type
         * @private
         */
        var _saveTemplate = function (chartId, name, type) {
            var containerId = _getContainerIdFromChart(chartId);
            var properties = _getProperties(containerId, type);
            var templates = _getTemplates(type, chartId);
            templates = (templates) ? templates : {};
            name = (type == infChart.constants.fileTemplateTypes.file) ? containerId : name;
            templates[name] = properties;
            infChart.templatesManager.saveChartTemplates(chartId, type, templates);
        };

        var _getProperties = function (containerId, type) {
            var properties = {}, chart = _charts[containerId];
            if (chart) {
                properties = chart.getProperties();
                var indicators = [];
                if (typeof infChart.indicatorMgr !== "undefined") {
                    indicators = infChart.indicatorMgr.getAllIndicatorProperties(containerId);
                }
                properties.indicators = indicators;
                if (typeof infChart.drawingsManager !== "undefined") {
                    if (type == infChart.constants.fileTemplateTypes.all) {
                        properties.drawings = infChart.drawingsManager.getAllDrawingProperties(containerId);
                    }
                    properties.showDrawingToolbarButtons = infChart.drawingsManager.getDrawingToolbarProperties(containerId);
                }
                if (typeof infChart.depthManager !== "undefined") {
                    properties.depth = infChart.depthManager.getProperties(containerId);
                }
            }
            return properties;
        };

        var _updateProperties = function (containerId, properties, setDefaultChartSettings) {
            var chart = _charts[containerId];
            var settingsProperties = infChart.util.merge({}, infChart.settings.config, properties); //CCA-3038
            _chartCustomSettings[containerId].settings.config = settingsProperties;
            if (chart) {
                if (typeof infChart.drawingsManager !== 'undefined') {
                    infChart.drawingsManager.removeAllDrawings(containerId);
                }
                chart.updateProperties(settingsProperties, setDefaultChartSettings);
                if (infChart.depthManager) {
                    var container = $('#' + containerId)[0];
                    var resizeRequired = infChart.depthManager.setProperties(containerId, infChart.structureManager.getContainer(container, 'chartContainer'), properties.depth);
                    if (resizeRequired) { //&& !this.isFirstLoadInprogress()
                        chart.resizeChart();
                    }
                }
            }
        };

        /**
         * Load given template
         * @param chartId
         * @param name
         * @param type
         * @param template
         * @private
         */
        var _loadTemplate = function (chartId, name, type, template) {
            var containerId = _getContainerIdFromChart(chartId),
                chart = _charts[containerId],
                customSettings = _chartCustomSettings[containerId];

            if (!template) {
                if (type === infChart.constants.fileTemplateTypes.file) {
                    name = containerId;
                }
                var templates = _getTemplates(type, chartId);
                template = (templates) ? templates[name] : undefined;
            }
            

            if (template) {
                // var toolbarEnabled = (typeof infChart.toolbar !== 'undefined');
                // var navigator = template.navigator;
                // template.navigator = false;
                // template = infChart.util.merge({}, infChart.settings.config, template);

                var properties = $.extend(true, {}, chart.settings, {
                    config: template,
                    symbol: template.useMainSymbol ? template.mainSymbol : chart.symbol
                });

                if(chart.interval){
                    properties.config.interval = chart.interval;
                }

                if(chart.period){
                    properties.config.period = chart.period;
                }

                if (chart.mouseWheelController) { //CCA-3353
                    properties.config.mouseWheelController = true;
                }

                if (type !== infChart.constants.fileTemplateTypes.all) {
                    properties.config.drawings = infChart.drawingsManager.getAllDrawingProperties(containerId);
                }

                var currentIndicators = infChart.indicatorMgr.getAllIndicatorProperties(chartId);
                var currentIndicatorTypes = currentIndicators.map(indicator=>indicator.type);                
                var templateIndicatorTypes = template.indicators.map(indicator=>indicator.type);

                var indicators = template.indicators;

                if (template.hasOwnProperty("replaceIndicators")) {
                    if (!template.replaceIndicators) {
                        var commonIndicators = _.intersection(currentIndicatorTypes, templateIndicatorTypes);
                        var filteredCurrentIndicators = currentIndicators.filter(function (indicator) {
                            return !commonIndicators.includes(indicator.type);
                        });
                        indicators = [].concat(filteredCurrentIndicators, template.indicators);
                    }
                } else {
                    if (currentIndicators.length === 0 || template.indicators.length === 0) {
                        indicators = [].concat(currentIndicators, template.indicators);
                    }
                }
                
                properties.config.indicators = indicators;

                var currentCompareSymbols = chart.getProperties().compareSymbols;
                var allCompareSymbols = [].concat(currentCompareSymbols, template.compareSymbols);
                properties.config.compareSymbols = allCompareSymbols;

                // var xAxis, yAxis, series;
                // if ((chart.chart && chart.chart.userOptions && chart.chart.userOptions.xAxis)) {
                //     xAxis = infChart.util.merge({}, infChart.config.xAxis, chart.chart.userOptions.xAxis[0]);
                // }
                // if ((chart.chart && chart.chart.userOptions && chart.chart.userOptions.yAxis)) {
                //     yAxis = [];
                //     for (var i = 0, iLen = infChart.config.yAxis.length; i < iLen; i++) {
                //         yAxis[i] = infChart.util.merge({}, infChart.config.yAxis[i], chart.chart.userOptions.yAxis[i]);
                //     }
                // }
                // series = (chart.chart && chart.chart.userOptions.series) ? chart.chart.userOptions.series[0] : util({}, infChart.config.series[0]);

                //var config = infChart.util.merge({}, infChart.config, customSettings.config);//(chart.chart && chart.chart.userOptions) || {}
                var config = $.extend(true, {}, infChart.config, customSettings.config);

                // config.xAxis = xAxis;
                // config.yAxis = yAxis;
                // config.series = [series];

                // config.navigator.enabled = false;
                // template.navigatorHeight = chart.settings.config.navigatorHeight;

                //chart.reLoading = true;
                chart.destroy(true);

                chart._setDefaultProperties(true);

                // var containerId = _getContainerIdFromChart(chartId);
                //chart.forcedLoad = true;
                _createChart($('#' + containerId), containerId, config, properties);
                //chart.reLoading = false;
                //chart.forcedLoad = false;
                //  if (navigator) {
                // TODO ::there is an issue when loading a template with navigator and then hiding the navigator and changing the periods. this
                // fix has been done to avoid loading templated with the navigator. This is not a proper solution. Need to address the root course later
                //_toggleNavigator(chartId);
                // }
                chart._onPropertyChange("loadTemplate",type);
            }
            
        };

        /**
         * returns template saved by given name
         * @param type
         * @returns {*}
         * @private
         */
        var _getTemplates = function (type, chartId) {
            return infChart.templatesManager.getChartTemplates(chartId, type);
        };

        /**
         * returns an array of all the saved templates for the given type
         * @param type
         * @returns {Array}
         * @private
         */
        var _getTemplateNames = function (type, chartId) {
            var templates = _getTemplates(type, chartId);
            var templateNames = [];
            if (templates) {
                infChart.util.forEach(templates, function (i) {
                    templateNames.xPush(i);
                });
            }
            return templateNames;
        };

        /**
         * Delete given template from chart
         * @param container
         * @param textName
         * @param type
         * @private
         */
        var _deleteTemplate = function (container, textName, type) {
            var templates = _getTemplates(type, container);
            if (templates) {
                var name;
                switch (type) {
                    case infChart.constants.fileTemplateTypes.file:
                        name = container;
                        break;
                    default :
                        name = textName;
                        break;
                }
                if (templates[name]) {
                    delete templates[name];
                    infChart.templatesManager.saveChartTemplates(container, type, templates);
                }
            }
        };

        // /**
        //  * Show/ hide navigator
        //  * @param chartId
        //  * @returns {boolean}
        //  * @private
        //  */
        // var _toggleNavigator = function (chartId, isSizeChange, isPropertyChange) {
        //     var containerId = _getContainerIdFromChart(chartId);
        //     var chart = _charts[containerId];
        //     var enabled = (isSizeChange) ? chart.chart.options.navigator.enabled : !(chart.chart.options.navigator.enabled);

        //     if (chart) {

        //         var navigatorHeight = chart.settings.config.navigatorHeight ? chart.settings.config.navigatorHeight :
        //             chart.navigator ? chart.navigator.height : infChart.util.getNavigatorHeight(chart.chart.chartHeight, chart.chart.options);

        //         chart.chart.update({navigator: {enabled: enabled, height: navigatorHeight}}, true);

        //         if (chart.rangeSelectorEl) {
        //             if (enabled) {
        //                 chart.rangeSelectorEl.show();
        //                 chart.adjustRangeSelectorMinMax();
        //                 chart.setRangeSelectorValues();
        //             } else {
        //                 chart.rangeSelectorEl.hide();
        //             }
        //         } else {
        //             chart.setRangeSelectorValues();
        //         }

        //         if (isPropertyChange) {
        //             chart._onPropertyChange("navigator");
        //         }
        //     }
        //     return enabled;
        // };

        var _getLabel = function (key) {
            return infChart.langManager.getLabel(_getLocalizationOptions().language, key)
        };

        var _removeChart = function (containerId) {
            var chart = _charts[containerId];
            if (chart) {
                _removeChartComponents(containerId);
                chart.destroy();
                delete _chartCustomSettings[containerId];
                delete _charts[containerId];
                $("[inf-unique-id='" + containerId + "']").removeData("infChart");
            }
        };

        var _removeChartComponents = function (containerId) {
            if (infChart.indicatorMgr) {
                infChart.indicatorMgr.destroy(containerId);
            }
            if (infChart.drawingsManager) {
                infChart.drawingsManager.destroy(containerId);
            }
            if (infChart.tradingManager) {
                infChart.tradingManager.destroyTrader(containerId);
            }
            if (infChart.depthManager) {
                infChart.depthManager.destroy(containerId);
            }
        };

        var _getMaxZoomRange = function (hchart) {
            var chartId = hchart.renderTo.id,
                iChart = _charts[_getContainerIdFromChart(chartId)];
            return iChart && iChart.getMaxZoomRange();

        };

        /**
         * Returns the maximums zoom range in pixels which will be benifitted in non-linear axes
         * @param {Highcharts} hchart highcharts object
         * @returns {number|undefined} range in pixels
         */
        var getMaxZoomRangePx = function (hchart) {
            var chartId = hchart.renderTo.id,
                iChart = _charts[_getContainerIdFromChart(chartId)];
            return iChart && iChart.getMaxZoomRangePx();
        };

        /**
         * Returns the time ticks map of the chart
         * @param {Highcharts} hchart highcharts object
         * @returns {object} time map
         */
        var getAllTimeTicks = function (hchart) {
            var chartId = hchart.renderTo.id,
                iChart = _charts[_getContainerIdFromChart(chartId)];
            return iChart && iChart.getAllTimeTicks();
        };

        /**
         * Returns the maximums number of points that can be shown in the current display space
         * @param {Highcharts} hchart highcharts object
         * @returns {number|undefined} number of points
         */
        var getMaxPointCount = function (hchart) {
            var chartId = hchart.renderTo.id,
                iChart = _charts[_getContainerIdFromChart(chartId)];
            return iChart && iChart._getMaxPointCount();
        };

        /**
         * Retusn whehter the chart is linear or not
         * @param {Highcharts} hchart highcharts object
         * @returns {boolean} linearity
         */
        var isLinearData = function (hchart) {
            var chartId = hchart.renderTo.id,
                iChart = _charts[_getContainerIdFromChart(chartId)];
            return iChart && iChart.isLinearData();
        };

        //region =================== Highcharts Events/Methods==========================================================
        /**
         * Handles the chart click event here
         * @param hchart
         * @param event
         * @private
         */
        var _chartClick = function (hchart, event) {

            var chartId = hchart.renderTo.id,
                containerId = _getContainerIdFromChart(chartId),
                iChart = _charts[containerId],
                zoom = false;

            if (event.point) {
                zoom = iChart.pointClick(event.point);
            }

            if (zoom) {
                // Zoom in on ctrl + mouse click
                if (event.ctrlKey || event.metaKey) {
                    var zoomInExtremes = iChart.getZoomExtremesOnCtrlClick(event);
                    if (zoomInExtremes.min && zoomInExtremes.max) {
                        _setUserDefinedXAxisExtremes(chartId, zoomInExtremes.min, zoomInExtremes.max, true);
                    }
                }
                // Zoom out on alt + mouse click
                else if (event.altKey) {
                    var zoomOutExtremes = iChart.getZoomExtremes(false);
                    if (zoomOutExtremes.min && zoomOutExtremes.max) {
                        _setUserDefinedXAxisExtremes(chartId, zoomOutExtremes.min, zoomOutExtremes.max, true);
                    }
                    // iChart.zoomOutOnAltlClick(event);
                }
            }
        };

        /**_initializeChartComponents
         * Set positions of the tooltip
         * @param chart
         * @param labelWidth
         * @param labelHeight
         * @param point
         * @returns {{x: *, y: (number|*)}}
         * @private
         */
        var _tooltipPositioner = function (chart, labelWidth, labelHeight, point) {

            var tooltipX,
                tooltipY;

            if (point.plotX > chart.plotWidth - labelWidth) {
                tooltipX = chart.plotLeft;
            } else {
                tooltipX = chart.plotLeft + chart.plotWidth - labelWidth;
            }

            tooltipY = chart.plotTop + chart.plotHeight - labelHeight;

            return {
                x: tooltipX,
                y: tooltipY
            };
        };

        /**
         * Creates the tooltip
         * @param pointObj
         * @param tooltip
         * @returns {*}
         * @private
         */
        var _tooltipFormatter = function (pointObj, tooltip) {
            var chartId = tooltip.chart.renderTo.id,
                containerId = _getContainerIdFromChart(chartId),
                chart = _getChart(containerId);

            if (!chart) {
                return;
            }

            if (chart.tooltip ) {
                if(!chart.isUserInteractionInprogress()) {
                    chart.unRegisterLastPointTooltipEvents();
                    var tooltipObj = _getTooltipValue(pointObj), tooltipHtml = _getTooltipHTML(tooltipObj),
                        container = $('#' + containerId)[0];
                    infChart.structureManager.legend.updateSymbolDataInLegend($(infChart.structureManager.getContainer(container, 'chart_top')), tooltipHtml.baseHTML, tooltipHtml.compareSymHTML);
                    return infChart.settings.indicatorOptions.disableIndicatorToolTip ? '' : infChart.structureManager.tooltip.getIndicatorTooltipHtml(tooltipHtml.indHTML);
                } else {
                    return "";
                }
            }
        };

        /**
         * Returns the xAxis' tick positions if specific logic available for the period or interval
         * @param axis
         * @param min
         * @param max
         * @returns {*}
         * @private
         */
        var _xAxisTickPositioner = function (axis, min, max) {

            var chartId = axis.chart.renderTo.id,
                ichart = _getChart(_getContainerIdFromChart(chartId));

            if (ichart) {
                return ichart.xAxisTickPositioner(axis, min, max);
            }
        };

        /**
         * Returns the yAxis' tick positions
         * @param axis
         * @param min
         * @param max
         * @returns {*}
         * @private
         */
        var _yAxisTickPositioner = function (axis, min, max) {

            var chartId = axis.chart.renderTo.id,
                ichart = _getChart(_getContainerIdFromChart(chartId));

            if (ichart) {
                return ichart.yAxisTickPositioner(axis, min, max);
            }
        };

        /**
         * Return the x Axis label for given value
         * @param labelObj
         * @private
         */
        var _xAxisLabelFormatter = function (labelObj) {
            var chartId = labelObj.chart.renderTo.id;
            var ichart = _getChart(_getContainerIdFromChart(chartId));
            var theme = infChart.themeManager.getTheme();
            var labelColor = theme && theme.xAxis && theme.xAxis.labels.style.color;

            if (ichart) {
                var labelValue = ichart.getXAxisLabel(labelObj);
                var label = infChart.structureManager.common.getAxisLabelHtml(labelColor, labelValue);
                return label; 
            }
        };

        /**
         * Return the y Axis label for given value
         * @param labelObj
         * @param isAxis
         * @private
         */
        var _yAxisLabelFormatter = function (labelObj, isAxis) {
            var chartId = labelObj.chart.renderTo.id;
            var ichart = _getChart(_getContainerIdFromChart(chartId));
            var theme = infChart.themeManager.getTheme();
            var labelColor = theme && theme.yAxis && theme.yAxis.labels && theme.yAxis.labels.style.color;

            if (ichart) {
                var labelValue = ichart.getYAxisLabel(labelObj, isAxis);
                var label = infChart.structureManager.common.getAxisLabelHtml(labelColor, labelValue);
                return label; //ichart.getYAxisLabel(labelObj, isAxis);
            }
        };

        /**
         * get cross hair label
         * @param {string} chartContainerId - container id
         * @param {number} value - y value
         * @returns {string} formatted label
         */
        var _getMainYAxisCrosshairLabel = function(chartContainerId, value){
            var labelValue = "";
            if(!isNaN(value)){
                var chartId = _getContainerIdFromChart(chartContainerId), 
                    chart = _getChart(chartId), labelValue;
                if(chart){
                    if(infChart.alertManager && infChart.alertManager.overrideCrosshairLabelValue(chartId)){
                        labelValue = infChart.alertManager.getCrosshairLabelValue(chartId, value);
                    } else{
                        labelValue = chart.formatValue(value, chart.getMainSeries().options.dp, undefined, true, false);
                    }
                }
            }
            return labelValue;
        };

        /**
         * Returns y Label for given actual y Value
         * @param hchart
         * @param yValue
         * @param isAxisLabel
         * @returns {*}
         * @private
         */
        var _getYLabel = function (hchart, yValue, isAxisLabel) {

            var chartId = hchart.renderTo.id,
                ichart = _getChart(_getContainerIdFromChart(chartId));

            if (ichart) {
                return ichart.getYLabel(yValue, isAxisLabel);
            }
        };

        /**
         * Executes after y axis extremes are set by highcharts
         * @param chartId
         * @param yAxis
         * @private
         */
        var _afterYSetExtremes = function (chartId, yAxis) {
            var containerId = _getContainerIdFromChart(chartId),
                chartObj = _getChart(containerId),
                ext = yAxis.getExtremes();

            chartObj.afterYSetExtremes(ext);
        };

        /**
         * Executes after x axis extremes are set by highcharts
         * @param chartId
         * @param xAxis
         * @private
         */
        var _afterXSetExtremes = function (chartId, xAxis) {
            var containerId = _getContainerIdFromChart(chartId),
                chartObj = _getChart(containerId),
                ext = xAxis.getExtremes();

            chartObj.afterSetExtremes(ext);
        };

        // /**
        //  * Executes before scaling starts when dragging the chart container
        //  * @param chartId
        //  * @private
        //  */
        // var _beforeScalingAxis = function (chartId) {
        //     var chartObj = _getChart(_getContainerIdFromChart(chartId));
        //     _pauseScaleDrawings(chartId);
        //     chartObj.beforeScalingAxis();
        // };

        // /**
        //  * Executes after scaling the chart by dragging the chart container
        //  * @param chartId
        //  * @param args
        //  * @private
        //  */
        // var _afterScalingAxis = function (chartId, args) {
        //     var chartObj = _getChart(_getContainerIdFromChart(chartId));
        //     _unPauseScaleDrawings(chartId);
        //     chartObj.afterScalingAxis(args);
        // };

        var _isDefaultXAxisExtremes = function (chartId) {
            //var chartObj = _getChart(_getContainerIdFromChart(chartId));
            //return ext ? chartObj.isDefaultXAxisExtremes(ext) : false;
            var status = false, containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                status = chart.isUserDefinedXAxisExtremes();
            }
            return !status || (chart && chart.isDefaultXAxisExtremes());
        };

        var _isLastPointExtremes = function (chartId) {
            var status = false, containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart && chart.chart && chart.chart.xAxis[0]) {
                var axis = chart.chart.xAxis[0];
                var extremes = axis.getExtremes();
                if(chart.defaultXAxisExtremes && extremes.max){
                    if(chart.defaultXAxisExtremes.max <= extremes.max){
                        status = true;
                    }
                }
            }
            return status;
        };

        var _setUserDefinedXAxisExtremes = function (chartId, userMin, userMax, redraw, userInteraction) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                if (typeof userInteraction === "undefined") {
                    userInteraction = true;
                }
                chart.setXAxisExtremes(userMin, userMax, redraw, userInteraction);
                if (userInteraction) {
                    chart._onPropertyChange("userXAxisExtremes", {userMin: userMin, userMax: userMax});
                }
            }
        };

        var _resetUserDefinedXAxisExtremes = function (chartId) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.resetXAxisExtremesToDefault();
                chart._onPropertyChange("resetUserXAxisExtremes");
            }
        };

        var _resetToLastPointExtremes = function (chartId) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if(chart && chart.chart && chart.chart.xAxis && chart.chart.xAxis[0]){
                var xAxis = chart.chart.xAxis[0];
                var extremes = xAxis.getExtremes();
                var max = extremes.max;
                var min = extremes.min;
                if (chart.defaultXAxisExtremes) {
                    var defaultMax = chart.defaultXAxisExtremes.max;
                    var maxIndex = _getIndexOfTime(max, chart.chart);
                    var minIndex = _getIndexOfTime(min, chart.chart);
                    var indexGap = maxIndex - minIndex;
                    var lastPointIndex = _getIndexOfTime(defaultMax, chart.chart);
                    var lastFirstPointIndex = lastPointIndex - indexGap;

                    if(lastPointIndex && lastFirstPointIndex && chart.chart){
                        var lastPointTime = chart.chart.series[0].xData[lastPointIndex];
                        var lastFirstPointTime = chart.chart.series[0].xData[lastFirstPointIndex];

                        _setUserDefinedXAxisExtremes(chartId, lastFirstPointTime, defaultMax, true);
                    }
                }
            }
        };

        var _getIndexOfTime = function (time, chart) {
            var xTimeMap = infChart.manager.getAllTimeTicks(chart);
            var xData = Object.keys(xTimeMap);
            var indexOfNearestXValue = infChart.util.binaryIndexOf(xData, undefined, time);
        
            if (indexOfNearestXValue < 0) {
                var absIndex = Math.abs(indexOfNearestXValue);
        
                if (absIndex >= xData.length) {
                    absIndex = xData.length - 1;
                }
        
                var rangeMaxValue = parseInt(xData[absIndex], 10);
                var rangeMinValue = parseInt(xData[absIndex - 1], 10);
        
                if (time > (((rangeMaxValue - rangeMinValue) / 2) + rangeMinValue)) {
                    indexOfNearestXValue = absIndex;
                } else {
                    indexOfNearestXValue = absIndex - 1;
                }
            }
            return indexOfNearestXValue;
        };

        var _isDefaultYAxisExtremes = function (chartId) {
            var status = false, containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                status = chart.isUserDefinedYAxisExtremes();
            }
            return !status;
        };

        /**
         * set y axis extremes by zooming
         * mouse wheel or scalable axis
         * @param {string} chartId unique chart id
         * @param {number} userMin new min
         * @param {number} userMax new max
         * @param {boolean} redraw redraw required or not
         * @param {boolean|undefined} isUserInteraction user interacted action or not
         */
        var _setUserDefinedYAxisExtremes = function (chartId, userMin, userMax, redraw, isUserInteraction) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.setUserDefinedYAxisExtremes(userMin, userMax, redraw, isUserInteraction);
                if (isUserInteraction) {
                    chart._onPropertyChange("userYAxisExtremes", {userMin: userMin, userMax: userMax});
                }
            }
        };

        var _resetUserDefinedYAxisExtremes = function (chartId, redraw) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.resetYAxisExtremes(redraw);
                chart._onPropertyChange("resetUserYAxisExtremes");
            }
        };

        //endregion

        /**
         * Method to get actual min/max of the given series or whole chart
         * @param chartId
         * @param seriesId
         * @private
         */
        var _getSeriesActualExtremes = function (chartId, seriesId) {

            var containerId = infChart.manager.getContainerIdFromChart(chartId),
                chartObj = _getChart(containerId);
            return chartObj && chartObj.getSeriesActualExtremes(seriesId);
        };

        //endregion =================== Highcharts Events/Methods==========================================================

        var _enableMouseWheel = function (chartId, enable) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.setMouseWheel(enable);
            }
        };

        //region full screen

        var _bindEnterKeyToCancelFullScreen = function (e) {
            switch (e.keyCode) {
                case 13: // ENTER. ESC should also take you out of fullscreen by default.
                    e.preventDefault();
                    _exitFullscreen(); // explicitly go out of fs.
                    break;
                /*case 70: // f
                 enterFullscreen();
                 break;*/
            }
        };

        var _onFullScreenEnter = function (event) {
            infChart.util.console.log("onFullScreenEnter*******");
            _isFullScreen = true;
            document.onwebkitfullscreenchange = _onFullScreenExit;
            document.onmozfullscreenchange = _onFullScreenExit;
            document.onfullscreenchange = _onFullScreenExit;
            document.onmsfullscreenchange = _onFullScreenExit;

            var targetEl;
            if (document.webkitFullscreenElement) {
                targetEl = document.webkitFullscreenElement;
            } else if (document.mozFullScreenElement) {
                targetEl = document.mozFullScreenElement;
            } else if (document.msFullscreenElement) {
                targetEl = document.msFullscreenElement;
            } else {
                targetEl = event.target;
            }

            document.addEventListener('keydown', _bindEnterKeyToCancelFullScreen, false);

            _sizeBeforeFullScreen.height = targetEl.style.height;
            $(targetEl).css('height', "100%");
            _resizeChartOnFullScreen(targetEl);
            if (_fsListeners['enter'].length > 0) {
                _fsListeners['enter'].forEach(function (callback) {
                    callback();
                });
                _fsListeners['enter'] = [];
            }
            if (infChart.toolbar) {
                infChart.toolbar.setSelectedControls(targetEl.id, 'full-screen', true);
            }
        };

        var _resizeChartOnFullScreen = function (container) {
            var chartContainerEl = $(container);
            if (!isNaN(chartContainerEl.data("infFSTimer"))) {
                clearTimeout(chartContainerEl.data("infFSTimer"));
                chartContainerEl.removeData("infFSTimer")
            }
            chartContainerEl.data("infFSTimer", setTimeout(function () {
                var chart = _getChart(container.id);
                chart.resizeChart();
            }, 200));
        };

        // Called whenever the browser exits fullscreen.
        var _onFullScreenExit = function (event) {
            infChart.util.console.log("onFullScreenExit*******");
            _isFullScreen = false;//chart is in full screen
            var targetEl;
            if (document.webkitFullscreenElement) {
                targetEl = document.webkitFullscreenElement;
            } else if (document.mozFullScreenElement) {
                targetEl = document.mozFullScreenElement;
            } else if (document.msFullscreenElement) {
                targetEl = document.msFullscreenElement;
                //} else if (document.infFullScreenEl) {
                //    targetEl = document.infFullScreenEl;
            } else {
                targetEl = event.target;
            }
            document.removeEventListener('keydown', _bindEnterKeyToCancelFullScreen, false);

            $(targetEl).css('height', _sizeBeforeFullScreen.height);
            _sizeBeforeFullScreen = {};
            _resizeChartOnFullScreen(targetEl);
            if (_fsListeners['exit'].length > 0) {
                _fsListeners['exit'].forEach(function (callback) {
                    callback();
                });
                _fsListeners['exit'] = [];
            }
            if (infChart.toolbar) {
                infChart.toolbar.setSelectedControls(targetEl.id, 'full-screen', false);
            }
        };

        // Note: FF nightly needs about:config full-screen-api.enabled set to true.
        var _enterFullscreen = function (elem) {
            document.onwebkitfullscreenchange = _onFullScreenEnter;
            document.onmozfullscreenchange = _onFullScreenEnter;
            document.onfullscreenchange = _onFullScreenEnter;
            document.onmsfullscreenchange = _onFullScreenEnter;

            if (elem[0].requestFullscreen) {
                elem[0].requestFullscreen();
            } else if (elem[0].webkitRequestFullscreen) {
                elem[0].webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                //Safari silent fails with the above, use workaround:
                setTimeout(function () {
                    if (!document.webkitCurrentFullScreenElement) {
                        elem[0].webkitRequestFullScreen();
                    }
                }, 200);
            } else if (elem[0].mozRequestFullScreen) {
                elem[0].mozRequestFullScreen();
            } else if (elem[0].msRequestFullscreen) {
                elem[0].msRequestFullscreen();
            } else {
                infChart.util.console.log('full screen not supported');
            }
            //document.infFullScreenEl = elem[0];
        };

        var _exitFullscreen = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        };

        var _handleFullscreen = function (element) {
            if (_isFullScreen) {
                _exitFullscreen();
            } else {
                _enterFullscreen(element);
            }
        };

        var _addFullScreenListeners = function (containerId, action, callbackFn) {
            _fsListeners[action].push(callbackFn);
        };

        //endregion

        var _onUrlChange = function (chartId, newUrl) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.onUrlChange(newUrl);
            }
        };

        //var _pauseScaleDrawings = function (chartId) {
        //    if (infChart.drawingsManager) {
        //        infChart.drawingsManager.pauseScaleDrawings(chartId);
        //    }
        //};
        //
        //var _unPauseScaleDrawings = function (chartId) {
        //    if (infChart.drawingsManager) {
        //        infChart.drawingsManager.unPauseScaleDrawings(chartId);
        //    }
        //};

        var _onAnnotationStore = function (chartId, drawing) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                if (infChart.tradingManager) {
                    infChart.tradingManager.onAnnotationStore(containerId, drawing);
                }
                if (infChart.alertManager) {
                    infChart.alertManager.onAnnotationStore(containerId, drawing);
                }
            }
        };

        var _onAnnotationRelease = function (chartId, drawing) {
            var containerId = _getContainerIdFromChart(chartId);
            var chart = _charts[containerId];
            if (chart) {
                chart.onAnnotationRelease();
                if (infChart.tradingManager) {
                    infChart.tradingManager.onAnnotationRelease(containerId, drawing);
                }
                if (infChart.alertManager) {
                    infChart.alertManager.onAnnotationRelease(containerId, drawing);
                }
            }
        };

        var _getMainSeries = function (containerId) {
            var series, chart = _charts[containerId];
            if (chart) {
                series = chart.getMainSeries();
            }
            return series;
        };

        var _getCompareSeriesBySymbol = function (containerId, symbol) {
            var series, chart = _charts[containerId];
            if (chart) {
                series = chart.getCompareSeriesFromId(chart.getCompareSeriesId(symbol));
            }
            return series;
        };

        /**
         * add compare symbol to the chart
         * @param {string} containerId - chart container id
         * @param {object} symbol - symbol object
         * @param {object} config - config
         * @param {boolean} isPropertyChange - true, if property change
         */
        var _addCompareSymbol = function (containerId, symbol, config, isPropertyChange) {
            var chart = _charts[containerId];
            if (chart) {
                chart.addCompareSymbol(symbol, config, !!isPropertyChange);
            }
        };

        /**
         * remove compare symbol from the chart
         * @param {string} containerId - chart container id
         * @param {object} symbol - symbol object
         */
        var _removeCompareSymbol = function (containerId, symbol) {
            var chart = _charts[containerId];
            if (chart) {
                chart.removeCompareSymbol(symbol, true);
            }
        };

        /**
         * add indicator to the chart
         * @param {string} containerId - chart container id
         * @param {string} indicatorType - indicator type
         */
        var _addIndicator = function (containerId, indicatorType) {
            var chart = _charts[containerId];
            if (chart) {
                if (infChart.indicatorMgr) {
                    var maxCount = (chart.settings && chart.settings.config.maxIndicatorCount);
                    if (infChart.indicatorMgr.hasMaxIndicatorCountReached(containerId, maxCount, indicatorType)) {
                        infChart.util.showMessage(containerId, _getLabel("msg.indicatorLimitExceeded").replace("{0}", maxCount));
                    } else {
                        var indicator = infChart.indicatorMgr.createIndicator(containerId, indicatorType);

                        var indData = chart.getDataForIndicators(indicator),
                            baseData = indData.base && indData.base.ohlcv && indData.base;

                        if (baseData && baseData.ohlcv && baseData.data && baseData.data.length) {
                            indicator.calculate(baseData.ohlcv, baseData.data, true, undefined, indData);
                        }

                        chart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'add'});
                    }
                }
            }
        };

        /**
         * remove given indicator from the chart
         * @param {string} containerId - chart container id
         * @param {string} indicatorId - indicator id
         */
        var _removeIndicator = function (containerId, indicatorId) {
            var chart = _charts[containerId];
            if (chart) {
                if (infChart.indicatorMgr) {
                    var indicator = infChart.indicatorMgr.getIndicatorById(containerId, indicatorId);
                    //infChart.structureManager.legend.removeLegendItem(containerId, indicator.id, 'indicator');
                    infChart.indicatorMgr.removeIndicator(containerId, indicator.id);
                    _updateChartOnIndicatorRemove(containerId, indicator);
                }
            }
        };

        var _resizeMainYAxis = function (containerId, height) {
            var chart = _charts[containerId];
            if (chart) {
                chart.resizeMainYAxis(height);
            }
        };

        var _updateChartOnIndicatorRemove = function (containerId, indicator) {
            var chart = _charts[containerId];
            chart._onPropertyChange("indicators", {id: indicator.id, type: indicator.type, action: 'remove'});
        };

        var _setPeriod = function (containerId, period) {
            var chart = _charts[containerId];
            if (chart) {
                chart.setPeriod(period, true, false, undefined, true);
            }
        };

        var _setChartStyle = function (containerId, type) {
            var chartObj = _charts[containerId];
            chartObj.isManualChartType = true;
            chartObj.setChartStyle(type, true, true);
        };

        var _zoom = function (containerId, val) {
            var chartObj = _charts[containerId];
            if (chartObj) {
                var isZoomIn = val === "in";
                var extremes = chartObj.getZoomExtremes(isZoomIn);
                if (extremes.min && extremes.max) {
                    _setUserDefinedXAxisExtremes(chartObj.chartId, extremes.min, extremes.max, true);
                }
            }
        };

        /**
         * To check whether the given symbol is a compare symbol or not
         * @param containerId
         * @param symbol
         * @returns {*|boolean}
         * @private
         */
        var _isCompareSymbol = function (containerId, symbol) {
            var chartObj = _charts[containerId];
            return chartObj && chartObj._isCompareSymbol(symbol);
        };

        /**
         * Re apply tooltip formatters or which ever the listeners listen to 'onReApplyFormatters' when pocked from outside
         * @param containerId
         * @returns {*}
         * @private
         */
        var _reApplyFormatters = function (containerId) {
            var chartObj = _charts[containerId];
            return chartObj && chartObj.reApplyFormatters();
        };

        /**
         * Returns the Axis label offset that occupies from the drawing tools
         * @param containerId chart id
         * @param axis  Axis which need the offset
         * @returns {*|number}
         * @private
         */
        var _getAxisLabelOffset = function (containerId, axis) {
            var chartObj = _charts[containerId];
            var drawingOffset = infChart.drawingsManager && infChart.drawingsManager.getAxisLabelOffset(containerId, axis);
            var labelOffset = chartObj && chartObj.getMaxLastLabelWidth();
            return Math.max(drawingOffset, labelOffset);
        };

        /**
         * adjust chart of provided id
         * @param {string} containerId - chart id
         * @private
         */
        var _adjustChart = function (containerId) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.adjustChartSize();
            }
        };

        /**
         * set chart interval
         * @param {string} containerId - chart container id
         * @param {string} interval - chart interval
         * @param {boolean} isFixedPeriod - true, if period is fixed
         * @param {string} period - - chart period
         */
        var _setInterval = function (containerId, interval, isFixedPeriod, period) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.setInterval(interval, undefined, true, isFixedPeriod, period);
            }
        };

        /**
         * Set interval while selecting the best suited period automatically
         * @param {string} containerId - chart container id
         * @param {string} interval - chart interval
         */
        var _setIntervalManually = function (containerId, interval) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.setIntervalManually(interval, undefined, true);
            }
        };

        /**
         * Set period and a predefined interval (used in mini chart of index overview)
         * @param {string} containerId - chart container id
         * @param {string} period - chart period
         * @param {string} interval - chart interval
         * @public
         */
        var _setPeriodAndIntervalManually = function (containerId, period, interval) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.setPeriodAndIntervalManually(period, interval, true);
            }
        };

        /**
         * Set chart mode
         * @param {string} containerId - chart container id
         * @param {string} type - chart mode
         * @param {boolean} enable - if given mode is enabled
         * @public
         */
        var _setChartMode = function (containerId, type, enable) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.setChartMode(type, enable);
            }
        };

        /**
         * update chart series options
         * @param {string} containerId - chart container id
         * @param {object} series - series object
         * @param {object} options - options
         * @param {object} options
         */
        var _updateChartSeriesOptions = function (containerId, series, options) {
            var chartInstance = _charts[containerId];
            if (chartInstance && series) {
                chartInstance.updateSeriesOptions(series, options);
            }
        };

        /**
         * Set scaling factor of the chart after scaling
         * @param {string} containerId - chart container id
         * @public
         */
        var _applyScaling = function (containerId) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.setScaleFactors();
            }
        };

        /**
         * get current chart data of the provided symbol
         * @param {string} containerId - chart container id
         * @param {object} symbol - symbol object
         * @param symbol
         */
        var _getCurrentData = function (containerId, symbol) {
            var currentData;
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                currentData = chartInstance.getCurrentData(symbol);
            }
            return currentData;
        };

        /**
         * add chart tick
         * @param {string} containerId - chart container id
         * @param {object} data - data
         */
        var _addTick = function (containerId, data) {
            var chartInstance = _charts[containerId];
            if (chartInstance) {
                chartInstance.addTick(data);
            }
        };

        /**
         * remove all drawing from the chart
         * @param {string} containerId - chart container id
         */
        var _removeAllDrawings = function (containerId) {
            if (typeof infChart.drawingsManager !== 'undefined') {
                infChart.drawingsManager.removeAllDrawings(containerId);
            }
        };

        /**
         * check if depth chart available
         * @param {string} containerId - chart container id
         * @returns boolean
         */
        var _isDepthAvailable = function (containerId) {
            var available = false;
            if (infChart.depthManager) {
                available = infChart.depthManager.isDepthAvailable(containerId);
            }
            return available;
        };

        /**
         * update chart depth data
         * @param {string} containerId - chart container id
         * @param {object} data - depth data
         */
        var _updateDepthData = function (containerId, data) {
            if (_isDepthAvailable(containerId)) {
                infChart.depthManager.updateData(containerId, data);
            }
        };

        /**
         * get depth extremes
         * @param {string} containerId - chart container id
         * @returns object
         */
        var _getDepthExtremes = function (containerId) {
            var extremes;
            if (_isDepthAvailable(containerId)) {
                extremes = infChart.depthManager.getExtremes(containerId);
            }
            return extremes;
        };

        /**
         * get depth extremes
         * @param {string} containerId - chart container id
         * @param {object} extremes - depth extremes
         * @returns object
         */
        var _setDepthExtremes = function (containerId, extremes) {
            if (_isDepthAvailable(containerId)) {
                infChart.depthManager.setExtremes(containerId, extremes);
            }
        };

        var _setLoadingStatus = function(chartId, isLoading) {    
            _loadingMap[chartId] = isLoading;
        }
        
        var _getLoadingStatus = function(chartId) {   
            return _loadingMap[chartId];
        }

        var _openContextMenu = function (containerId, event, contextMenuType) {
            let chartId = _getContainerIdFromChart(containerId);
            if (infChart.contextMenuManager.isContextMenuEnabled(chartId)) {
                if (_getChart(chartId).settings.contextMenu.default.enabled) {
                    infChart.contextMenuManager.openContextMenu(chartId, {
                        top: event.clientY,
                        left: event.clientX
                    }, contextMenuType ? contextMenuType : infChart.constants.contextMenuTypes.default, {}, event);
                }
            }

            event.stopPropagation();
            event.preventDefault();
        };

        var _getDefaultContextMenuOptions = function (chartId, event) {
            let chart = _getChart(chartId);
            let options = chart.settings.contextMenu.default.options;
            var contextMenu =  {
                "showSettings" : {
                    icon : options.settings.icon,
                    displayText :options.settings.displayText,
                    action : function () {
                        _legendSeriesClick(chartId, chart.chart.series[0].options.id, "base");
                        if (infChart.toolbar) {
                            infChart.toolbar.setSelectedControls(_getContainerIdFromChart(chartId), "rightPanel", true);
                        }
                    }
                },
                "gridLines": {
                    icon : options.gridLines.icon,
                    displayText :options.gridLines.displayText,
                    disabled: false,
                    subMenus: [
                        {
                            type: "all",
                            icon: options.gridLines.all.icon,
                            displayText: options.gridLines.all.displayText,
                            disabled: chart.gridType === "all",
                            action: function (event, value) {
                                chart.setGridType(value, true, true);
                            }
                        },
                        {
                            type: "horizontal",
                            icon: options.gridLines.horizontal.icon,
                            displayText: options.gridLines.horizontal.displayText,
                            disabled: chart.gridType === "horizontal",
                            action: function (event, value) {
                                chart.setGridType(value, true, true);
                            }
                        },
                        {
                            type: "vertical",
                            icon: options.gridLines.vertical.icon,
                            displayText: options.gridLines.vertical.displayText,
                            disabled: chart.gridType === "vertical",
                            action: function (event, value) {
                                chart.setGridType(value, true, true);
                            }
                        },
                        {
                            type: "none",
                            icon: options.gridLines.none.icon,
                            displayText: options.gridLines.none.displayText,
                            disabled: chart.gridType === "none",
                            action: function (event, value) {
                                chart.setGridType(value, true, true);
                            }
                        }
                    ]
                },
                "resetX": {
                    icon : options.resetX.icon,
                    displayText :options.resetX.displayText,
                    disabled: infChart.manager.isDefaultXAxisExtremes(chartId),
                    action : function () {
                        infChart.manager.resetUserDefinedXAxisExtremes(chartId);
                    }
                },
                "resetY": {
                    icon : options.resetY.icon,
                    displayText :options.resetY.displayText,
                    disabled: infChart.manager.isDefaultYAxisExtremes(chartId),
                    action : function () {
                        infChart.manager.resetUserDefinedYAxisExtremes(chartId);
                    }
                },
                "eraseDrawings": {
                    icon : options.eraseDrawings.icon,
                    displayText :options.eraseDrawings.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action : function () {
                        var chartInstance = infChart.manager.getChart(chartId);
                        _removeAllDrawings(chartId);
                        infChart.drawingsManager.updateIsGloballyLockInDelete(chartId);
                        var leftPanel = $(chartInstance.container).find('div[inf-pnl=tb-drawing-nav-container]');
                        infChart.drawingsManager.setActiveDrawingToolOptions(chartId, leftPanel);
                    }
                },
                "removeIndicators": {
                    icon : options.removeIndicators.icon,
                    displayText :options.removeIndicators.displayText,
                    disabled: !infChart.indicatorMgr.isAddedIndicatorsAvailable(chartId, ["VOLUME", "SessionTimeBreaks"]),
                    action : function (event) {
                        infChart.indicatorMgr.removeAllIndicators(chartId, ["VOLUME", "SessionTimeBreaks"]);
                        chart._setIndicatorFrames(true);
                    }
                },
            };
            if(infChart.drawingsManager.getIsActiveEraseMode(chartId)){
                var eraseModeOFF = {
                    icon : options.eraseModeOFF.icon,
                    displayText : options.eraseModeOFF.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action : function () {
                        infChart.drawingsManager.offDeleteMode(chartId);
                    }
                };
                contextMenu["eraseModeOFF"] = eraseModeOFF;
            } else {
                var eraseModeON = {
                    icon : options.eraseModeON.icon,
                    displayText : options.eraseModeON.displayText,
                    disabled: !infChart.drawingsManager.isDrawnDrawingsAvailable(chartId),
                    action : function () {
                        infChart.drawingsManager.setDeleteMode(chartId);
                    }
                };
                contextMenu["eraseModeON"] = eraseModeON;
            }
            if (infChart.intradayChartManager && infChart.intradayChartManager.eligibleForIntradayChart(chartId)) {
                if (infChart.intradayChartManager.getIsActiveIntradayChart(chartId)) {
                    let intradayChartOFF = {
                        icon : options.intradayChartOFF.icon,
                        displayText : options.intradayChartOFF.displayText,
                        action : function () {
                            infChart.intradayChartManager.deactivateIntradayChart(chartId);
                        }
                    };
                    contextMenu["intradayChartOFF"] = intradayChartOFF;
                } else {
                    let intradayChartON = {
                        icon : options.intradayChartON.icon,
                        displayText : options.intradayChartON.displayText,
                        action : function () {
                            infChart.intradayChartManager.activateIntradayChart(chartId);
                        }
                    };
                    contextMenu["intradayChartON"] = intradayChartON;
                }
            }
            contextMenu = _reorderContextMenu(contextMenu);
            return contextMenu;
        };

        var _getXAxisContextMenuOptions = function (chartId, event) {
            let chart = _getChart(chartId);
            let options = chart.settings.contextMenu.xAxis.options;
            let sessionTimeBreakSettings = chart.sessionTimeBreakSettings;
            let sessionTimeBreakSelected = false;

            for (let type in sessionTimeBreakSettings) {
                if (Object.prototype.hasOwnProperty.call(sessionTimeBreakSettings, type)) {
                    if (sessionTimeBreakSettings[type].show) {
                        sessionTimeBreakSelected = true;
                    }
                }
            }

            let intervals = ["I_1", "I_2", "I_3", "I_5", "I_10", "I_15", "I_30", "I_60", "I_120", "I_240", "I_360", "D", "W", "M", "4M", "Y"];
            let selectedInterval = intervals.indexOf(chart.interval);
            let supportedSessionTimeBreaks = Object.values(infChart.settings.config.sessionTimeBreakSettings);
            let timeBreakOptions = [];
            supportedSessionTimeBreaks.reverse();

            supportedSessionTimeBreaks.forEach(function (sessionTimeBreak) {
                let isSupported = selectedInterval + 1 < intervals.indexOf(sessionTimeBreak.key);

                if (isSupported) {
                    timeBreakOptions.push({
                        type: sessionTimeBreak.key,
                        icon: sessionTimeBreakSettings[sessionTimeBreak.key].show ? options.timeBreaks.icon : "",
                        displayText: sessionTimeBreakSettings[sessionTimeBreak.key].label,
                        action: function () {
                            infChart.indicatorMgr.createSessionTimeBreakIndicator(sessionTimeBreak.key, chartId);
                            infChart.structureManager.settings.updateSessionTimeBreakSettingsWhenOpen(chartId);
                        }
                    });
                }
            });

            timeBreakOptions.push({
                type: "none",
                icon: sessionTimeBreakSelected ? "" : options.timeBreaks.icon,
                displayText: options.timeBreaks.none.displayText,
                action: function () {
                    infChart.indicatorMgr.removeSessionTimeBreakIndicator(chartId);
                    infChart.structureManager.settings.updateSessionTimeBreakSettingsWhenOpen(chartId);
                }
            });

            var contextMenu =  {
                "timeBreaks": {
                    icon : sessionTimeBreakSelected ? options.timeBreaks.icon : "",
                    displayText :options.timeBreaks.displayText,
                    disabled: false,
                    subMenus: timeBreakOptions
                },
                "resetX": {
                    icon : options.resetX.icon,
                    displayText :options.resetX.displayText,
                    disabled: infChart.manager.isDefaultXAxisExtremes(chartId),
                    action : function () {
                        infChart.manager.resetUserDefinedXAxisExtremes(chartId);
                    }
                }
            };
            return contextMenu;
        };

        var _getYAxisContextMenuOptions = function (chartId, event) {
            let chart = _getChart(chartId);
            let iChart = infChart.manager.getChart(chartId);
            let options = chart.settings.contextMenu.yAxis.options;
            var contextMenu =  {
                "lines": {
                    displayText :options.lines.displayText,
                    disabled: false,
                    subMenus: [
                        {
                            type: "lastPriceLine",
                            icon : iChart && iChart.enabledLastLine ? options.lastPriceLine.icon : '',
                            displayText :options.lastPriceLine.displayText,
                            action : function () {
                                infChart.manager.toggleLastPriceLine(chartId, true);
                            }
                        },
                        {
                            type: "bidAskPriceLine",
                            icon : iChart && iChart.bidAskLineEnabled ? options.bidAskLine.icon : '',
                            displayText : options.bidAskLine.displayText,
                            action : function () {
                                infChart.manager.toggleBidAskPriceLine(chartId, true);
                            }
                        }
                    ]
                },
                "labels": {
                    displayText :options.labels.displayText,
                    disabled: false,
                    subMenus: [
                        {
                            type: "lastPriceLabel",
                            icon : iChart && iChart.enabledLastLabel ? options.lastPriceLabel.icon : '',
                            displayText :options.lastPriceLabel.displayText,
                            action : function () {
                                infChart.manager.toggleLastPriceLabel(chartId, true);
                            }
                        },
                        {
                            type: "bidAskPriceLabel",
                            icon : iChart && iChart.bidAskLabelsEnabled ? options.bidAskLabel.icon : '',
                            displayText : options.bidAskLabel.displayText,
                            action : function () {
                                infChart.manager.toggleBidAskPriceLabels(chartId, true);
                            }
                        }
                    ]
                },
                "barClosureTime": {
                    icon : iChart && iChart.enableBarClosure ? options.barClosureTime.icon : '',
                    displayText :options.barClosureTime.displayText,
                    action : function () {
                        infChart.manager.toggleBarClosureTime(chartId, true);
                    }
                },
                "resetYAxis": {
                    icon : options.resetYAxis.icon,
                    displayText :options.resetYAxis.displayText,
                    disabled: infChart.manager.isDefaultYAxisExtremes(chartId),
                    action : function () {
                        infChart.manager.resetUserDefinedYAxisExtremes(chartId, true);
                    }
                },
            };
            //contextMenu = _reorderContextMenu(contextMenu);
            return contextMenu;
        };

        var _toggleBarClosureTime = function(chartId, isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);
            if(iChart.enableBarClosure){
                if(iChart.barClosureLabel){
                    iChart._removeBarClosureLabel();
                }
                iChart.enableBarClosure = false;
                clearInterval(iChart.updateTickTimeValue);
                iChart.updateTickTimeValue = undefined;
                clearInterval(iChart.updateBarClosureLabelTimer);
                iChart.updateBarClosureLabelTimer = undefined;
                iChart._updateBidAskLabels();
                if (isPropertyChange) {
                    iChart._onPropertyChange();
                }
            } else {
                iChart.updateTickTimeValue = setInterval(function () {
                    var currentTime = new Date().getTime();
                    var timestampOffset = new Date().getTimezoneOffset();
                    timestampOffsetInMinutes = timestampOffset%60;
                    timestampOffsetInHours = timestampOffset > 0 ? Math.floor(timestampOffset/60) : Math.ceil(timestampOffset/60);
                    correctionParameter = timestampOffsetInHours*60*60*1000 + timestampOffsetInMinutes*60*1000;
                    currentTime = currentTime - correctionParameter;
                    var interval = iChart.interval;
                    switch (interval) {
                        case 'I_1':
                            var representTime = 60*1000;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var showTime = '00:'+(remainingTime < 10 ? '0'+ remainingTime : remainingTime);
                            break;
                        case 'I_2':
                            var representTime = 60*1000*2;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_3':
                            var representTime = 60*1000*3;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_5':
                            var representTime = 60*1000*5;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_10':
                            var representTime = 60*1000*10;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_15':
                            var representTime = 60*1000*15;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_30':
                            var representTime = 60*1000*30;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_60':
                            var representTime = 60*1000*60;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainMinutes = Math.floor(remainingTime/60);
                            var remainingSeconds = remainingTime%60;
                            var showTime = (remainMinutes < 10 ? '0'+ remainMinutes : remainMinutes) + ':' + (remainingSeconds < 10 ? '0'+ remainingSeconds : remainingSeconds);
                            break;
                        case 'I_120':
                            var representTime = 60*1000*120;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var remainingSeconds = remainingTime%(60*60);
                            var remainingMinutes = Math.floor(remainingSeconds/60);
                            var remainingSec = remainingSeconds%60;
                            var showTime = (remainHours < 10 ? '0'+ remainHours : remainHours) + ':' + (remainingMinutes < 10 ? '0'+ remainingMinutes : remainingMinutes) + ':' + (remainingSec < 10 ? '0'+ remainingSec : remainingSec);
                            break;
                        case 'I_240':
                            var representTime = 60*1000*240;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var remainingSeconds = remainingTime%(60*60);
                            var remainingMinutes = Math.floor(remainingSeconds/60);
                            var remainingSec = remainingSeconds%60;
                            var showTime = (remainHours < 10 ? '0'+ remainHours : remainHours) + ':' + (remainingMinutes < 10 ? '0'+ remainingMinutes : remainingMinutes) + ':' + (remainingSec < 10 ? '0'+ remainingSec : remainingSec);
                            break;
                        case 'I_360':
                            var representTime = 60*1000*360;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var remainingSeconds = remainingTime%(60*60);
                            var remainingMinutes = Math.floor(remainingSeconds/60);
                            var remainingSec = remainingSeconds%60;
                            var showTime = (remainHours < 10 ? '0'+ remainHours : remainHours) + ':' + (remainingMinutes < 10 ? '0'+ remainingMinutes : remainingMinutes) + ':' + (remainingSec < 10 ? '0'+ remainingSec : remainingSec);
                            break;
                        case 'D':
                            var representTime = 60*1000*60*24;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var remainingSeconds = remainingTime%(60*60);
                            var remainingMinutes = Math.floor(remainingSeconds/60);
                            var remainingSec = remainingSeconds%60;
                            var showTime = (remainHours < 10 ? '0'+ remainHours : remainHours) + ':' + (remainingMinutes < 10 ? '0'+ remainingMinutes : remainingMinutes) + ':' + (remainingSec < 10 ? '0'+ remainingSec : remainingSec);
                            break;
                        case 'W':
                            var representTime = 60*1000*60*24;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var currentDate = new Date().getDay();
                            var remainDays = (currentDate == 0) ? currentDate : 7 - currentDate;
                            var showTime = ('0'+ remainDays) + 'd ' + (remainHours < 10 ? '0'+ remainHours : remainHours) + 'h';
                            break;
                        case 'M':
                            var representTime = 60*1000*60*24;
                            var remaining = representTime - (currentTime % representTime);
                            var remainingTime = Math.ceil(remaining/1000);
                            var remainHours = Math.floor(remainingTime/(60*60));
                            var currentYear = new Date().getFullYear();
                            var currentMonth = new Date().getMonth();
                            var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                            var todayDate = new Date().getDate();
                            var remainingDays = daysInMonth - todayDate;
                            var showTime = (remainingDays < 10 ? '0'+ remainingDays : remainingDays) + 'd ' + (remainHours < 10 ? '0'+ remainHours : remainHours) + 'h';
                            break;
                        case 'Y':
                            var currentYear = new Date().getFullYear();
                            var currentMonth = new Date().getMonth();
                            var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                            var todayDate = new Date().getDate();
                            var remainingMonths = 12 - (currentMonth + 1);
                            var remainingDays = daysInMonth - todayDate;
                            var showTime = (remainingMonths < 10 ? '0'+ remainingMonths : remainingMonths) + 'M ' + (remainingDays < 10 ? '0'+ remainingDays : remainingDays) + 'd';
                            break;
                        default:
                            break;
                    }
                    iChart.barClosureTimeRemaining = showTime;
                }, 500);
                iChart.enableBarClosure = true;
                iChart._drawBarClosureLabel();

                var isFirstTime = true;

                iChart.updateBarClosureLabelTimer = setInterval(function () {
                    if(iChart.enableBarClosure){
                        if(iChart.hasLastLine){
                            iChart._drawLastLine();
                        }
                        iChart._drawBarClosureLabel();

                        if (isFirstTime && iChart.bidAskLabelsEnabled) {
                            iChart._updateBidAskLabels();
                        }
                    }

                    isFirstTime = false;
                }, 500);
                if (isPropertyChange) {
                    iChart._onPropertyChange();
                }
            }
        }

        var _toggleLastPriceLabel = function(chartId, isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);
            if(iChart.enabledLastLabel){
                if(iChart.lastLabel){
                    iChart._removeLastLabel();
                    if(iChart.enableBarClosure){
                        iChart._drawBarClosureLabel();
                    }
                }
                iChart.enabledLastLabel = false;
                if(_checkLastPriceAndLabelBothDisabled(chartId)){
                    iChart.hasLastLine = false;
                    if (isPropertyChange) {
                        iChart._onPropertyChange("last", iChart.hasLastLine);
                    }
                }
            } else {
                iChart.enabledLastLabel = true;
                iChart.hasLastLine = true;
                iChart._drawLastLine();
                if(iChart.enableBarClosure){
                    iChart._drawBarClosureLabel();
                }
                if (isPropertyChange) {
                    iChart._onPropertyChange("last", iChart.hasLastLine);
                }
            }

            iChart._updateBidAskLabels();
        }

        var _toggleLastPriceLine = function(chartId, isPropertyChange){
            let iChart = infChart.manager.getChart(chartId);
            if(iChart.enabledLastLine){
                if(iChart.lastPriceLine && iChart.lastPriceLine.svgElem){
                    iChart._removeLastPriceLine();
                }
                iChart.enabledLastLine = false;
                if(_checkLastPriceAndLabelBothDisabled(chartId)){
                    iChart.hasLastLine = false;
                    if (isPropertyChange) {
                        iChart._onPropertyChange("last", iChart.hasLastLine);
                    }
                }
            }else{
                if(iChart.lastPriceLine && iChart.lastPriceLine.svgElem){
                    iChart._drawLastLine();
                }
                iChart.enabledLastLine = true;
                if (isPropertyChange) {
                    iChart._onPropertyChange("last", iChart.hasLastLine);
                }
            }
        }

        var _toggleBidAskPriceLine = function(chartId, isPropertyChange){
            let iChart = infChart.manager.getChart(chartId);

            if (iChart.bidAskLineEnabled) {
                iChart._removeBidAskLines();
            } else {
                iChart._drawBidAskLines();
            }

            if (isPropertyChange) {
                iChart._onPropertyChange("bidAskLineEnabled", iChart.bidAskLineEnabled);
            }
        };

        var _toggleBidAskPriceLabels = function(chartId, isPropertyChange){
            let iChart = infChart.manager.getChart(chartId);

            if (iChart.bidAskLabelsEnabled) {
                iChart._removeBidAskLabels();
            } else {
                iChart._drawBidAskLabels();
            }

            if (isPropertyChange) {
                iChart._onPropertyChange("bidAskLabelsEnabled", iChart.bidAskLabelsEnabled);
            }
        };

        var _checkLastPriceAndLabelBothDisabled = function(chartId){
            let iChart = infChart.manager.getChart(chartId);
            var priceAndLabelBothDisabled = false;
            if(!iChart.enabledLastLabel && !iChart.enabledLastLine){
                priceAndLabelBothDisabled = true;
            }
            return priceAndLabelBothDisabled;
        }

        var _getCustomContextMenuOptions = function (event) {
            let options = infChart.settings.contextMenu.custom.options;
            let contextMenu = {
                "eraseColor": {
                    icon: options.eraseColor.icon,
                    displayText: options.eraseColor.displayText,
                    action: function () {
                        _removeColorPalette(event);
                    }
                }
            }
            return contextMenu = _reorderContextMenu(contextMenu);
        }
        var _reorderContextMenu = function(contextMenu){
            var newContextMenu = {};
            // var contextMenuOrder = ["eraseColor", "eraseModeON", "eraseModeOFF", "gridLines", "resetX", "resetY", "eraseDrawings", "removeIndicators", "showSettings"];
            $.each(_contextMenuOrder, function (key, menuItem) {
                if(contextMenu[menuItem]){
                    newContextMenu[menuItem] = contextMenu[menuItem];
                }
            });
            return newContextMenu;
        };

        var _removeColorPalette = function (event) {
            var favColors = infChart.favouriteColorManager.getFavouriteColors(); 
            var index = favColors.indexOf(event.target.dataset.colorValue);
            if (index !== -1) {
                favColors.splice(index, 1);
            }
            if(infChart.favouriteColorManager.setFavoriteColors) {
                infChart.favouriteColorManager.setFavoriteColors(favColors);
                if ( typeof event.data.addElementsToFavouritePanel === "function") {
                    event.data.addElementsToFavouritePanel (event.currentTarget);
                }
            }
        }

        var _setCustomCandleCount = function (chartId, candleCount){
            let stockChart = _getChart(chartId);
            stockChart.setCustomCandleCount(undefined, candleCount, true, true, true)
        }

        var _getNearestXDataPointWithGaps = function (chartId, xValue, seriesIndex, useAllXDataToFindNearestPoint, useFutureDate, gapCandles) {
            let stockChart = _getChart(chartId);
            if (stockChart) {
                let hChart = stockChart.chart;
                let nearestXDataPoint = infChart.math.findNearestDataPoint(hChart, xValue, seriesIndex, useAllXDataToFindNearestPoint, useFutureDate);
                let totalPoints = _getTotalPoints(hChart);
                let nearestXDataPointWithGap;
                if (gapCandles && totalPoints[nearestXDataPoint.dataIndex + gapCandles]) {
                    nearestXDataPointWithGap = parseInt(totalPoints[nearestXDataPoint.dataIndex + gapCandles]);
                } else {
                    nearestXDataPointWithGap = parseInt(totalPoints[nearestXDataPoint.dataIndex]);
                }
                return {
                    nearestXDataPoint: nearestXDataPoint,
                    nearestXDataPointWithGap: nearestXDataPointWithGap
                }
            }
        };

        var _getYAxisExtremes = function (chartId) {
            let chart = _getChart(chartId);
            return chart.getMainYAxis().getExtremes();
        };

        var _getTotalPoints = function (chart) {
            var stockChart = chart && infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id));
            var totalPoints = stockChart.calculateTotalPoints(chart);
            return totalPoints;
        }
        
        var _alignChartPosition = function(chartId){
            var chart = _charts[chartId];
            if(chart){
                var minYValue = chart.chart.userOptions.chart.viewBoxMinY;
                chart.chart.renderer.box.viewBox.baseVal.y = minYValue;
            } 
        };

        var _createInstance = function () {
            return {
                initChart: _initChart,
                renderChart: _renderChart,
                changeChartTheme: _changeChartTheme,
                changeChartThemeByChartId: _changeChartThemeByChartId,
                setChartTheme: _setChartTheme,
                getChart: _getChart,
                getAllAvailableCharts: _getAllAvailableCharts,
                exportChart: _exportChart,
                exportChartAsBinaryData: _exportChartAsBinaryData,
                removeSeries: _removeSeries,
                getContainerIdFromChart: _getContainerIdFromChart,
                getLegend: _getLegend,
                setLegend:_setLegend,
                getTooltipValue: _getTooltipValue,
                getTooltipHTML: _getTooltipHTML,
                getLabel: _getLabel,
                getLocalizationOptions: _getLocalizationOptions,
                getYLabel: _getYLabel,
                getMainYAxisCrosshairLabel: _getMainYAxisCrosshairLabel,
                afterRedraw: _afterRedraw,
                getTemplateNames: _getTemplateNames,
                saveTemplate: _saveTemplate,
                loadTemplate: _loadTemplate,
                deleteTemplate: _deleteTemplate,
                updateCrosshair: _updateCrosshair,
                updateCrosshairFromToolTip: _updateCrosshairFromToolTip,
                seriesMouseOutEvent: _seriesMouseOutEvent,
                seriesMouseOverEvent: _seriesMouseOverEvent,
                removeChart: _removeChart,
                chartClick: _chartClick,
                tooltipPositioner: _tooltipPositioner,
                tooltipFormatter: _tooltipFormatter,
                xAxisTickPositioner: _xAxisTickPositioner,
                yAxisTickPositioner: _yAxisTickPositioner,
                xAxisLabelFormatter: _xAxisLabelFormatter,
                yAxisLabelFormatter: _yAxisLabelFormatter,
                getMaxZoomRange: _getMaxZoomRange,
                enableMouseWheel: _enableMouseWheel,
                afterYSetExtremes: _afterYSetExtremes,
                afterXSetExtremes: _afterXSetExtremes,
                getSeriesActualExtremes: _getSeriesActualExtremes,
                handleFullscreen: _handleFullscreen,
                onUrlChange: _onUrlChange,
                onAnnotationStore: _onAnnotationStore,
                onAnnotationRelease: _onAnnotationRelease,
                isDefaultXAxisExtremes: _isDefaultXAxisExtremes,
                resetUserDefinedXAxisExtremes: _resetUserDefinedXAxisExtremes,
                resetToLastPointExtremes: _resetToLastPointExtremes,
                setUserDefinedXAxisExtremes: _setUserDefinedXAxisExtremes,
                isDefaultYAxisExtremes: _isDefaultYAxisExtremes,
                isLastPointExtremes: _isLastPointExtremes,
                resetUserDefinedYAxisExtremes: _resetUserDefinedYAxisExtremes,
                setUserDefinedYAxisExtremes: _setUserDefinedYAxisExtremes,
                getMainSeries: _getMainSeries,
                getCompareSeriesBySymbol: _getCompareSeriesBySymbol,
                setSymbol: _setSymbol,
                setPeriod: _setPeriod,
                addCompareSymbol: _addCompareSymbol,
                removeCompareSymbol: _removeCompareSymbol,
                getProperties: _getProperties,
                updateProperties: _updateProperties,
                setChartStyle: _setChartStyle,
                zoom: _zoom,
                removeIndicator: _removeIndicator,
                addIndicator: _addIndicator,
                reloadData: _reloadData,
                isCompareSymbol: _isCompareSymbol,
                reApplyFormatters: _reApplyFormatters,
                getAxisLabelOffset: _getAxisLabelOffset,
                chartMouseOutEvent: _chartMouseOutEvent,
                getMaxZoomRangePx: getMaxZoomRangePx,
                getAllTimeTicks: getAllTimeTicks,
                getMaxPointCount: getMaxPointCount,
                isLinearData: isLinearData,
                adjustChart: _adjustChart,
                setInterval : _setInterval,
                setIntervalManually : _setIntervalManually,
                setPeriodAndIntervalManually : _setPeriodAndIntervalManually,
                setChartMode : _setChartMode,
                updateChartSeriesOptions : _updateChartSeriesOptions,
                applyScaling : _applyScaling,
                getCurrentData : _getCurrentData,
                addTick : _addTick,
                isDepthAvailable : _isDepthAvailable,
                updateDepthData : _updateDepthData,
                getDepthExtremes : _getDepthExtremes,
                setDepthExtremes : _setDepthExtremes,
                removeAllDrawings : _removeAllDrawings,
                setLoadingStatus: _setLoadingStatus,
                getLoadingStatus: _getLoadingStatus,
                getTotalPoints: _getTotalPoints,
                openContextMenu: _openContextMenu,
                getDefaultContextMenuOptions: _getDefaultContextMenuOptions,
                getCustomContextMenuOptions: _getCustomContextMenuOptions,
                getXAxisContextMenuOptions: _getXAxisContextMenuOptions,
                getYAxisContextMenuOptions: _getYAxisContextMenuOptions,
                setSelectToolbarIconOnReset: _setSelectToolbarIconOnReset,
                alignChartPosition: _alignChartPosition,
                updateChartAxisColors: _updateChartAxisColors,
                getNearestXDataPointWithGaps: _getNearestXDataPointWithGaps,
                getYAxisExtremes: _getYAxisExtremes,
                getFavoriteToolBarConfigs: _getFavoriteToolBarConfigs,
                toggleLastPriceLabel: _toggleLastPriceLabel,
                toggleLastPriceLine: _toggleLastPriceLine,
                toggleBarClosureTime: _toggleBarClosureTime,
                setCustomCandleCount: _setCustomCandleCount,
                showHideCompareSymbol: _showHideCompareSymbol,
                toggleBidAskPriceLine: _toggleBidAskPriceLine,
                toggleBidAskPriceLabels: _toggleBidAskPriceLabels
            };
        };

        var _getInstance = function () {
            if (!_instance) {
                _instance = _createInstance();
                //$("[data-localize]").localize("lang", _localizationOptions);
            }
            return _instance;
        };

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Shift') {
                shiftKeyPressed = true;
            }
            infChart.manager.shiftKeyPressed = shiftKeyPressed;
        });
          
        document.addEventListener('keyup', function(event) {
            if (event.key === 'Shift') {
                shiftKeyPressed = false;
            }
            infChart.manager.shiftKeyPressed = shiftKeyPressed;
        });

        return _getInstance();
})(jQuery, Highcharts);
