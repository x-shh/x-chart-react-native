/**
 * Created by Hasarinda on 21/3/19.
 * Interface for chart to communicate with depth
 * depth should be independent of the chart
 */
infChart.depthManager = (function ($, infChart) {

    var _depthInstances = {}, _depthPropertyMap = {}, _depthSizes = {}, _listeners = {}, _depthData = {}, _extremeArray = [];

    var _defaultSizeData = {
        maxWidth: 300,
        minWidth: 100,
        minHeight: 100,
        maxHeight: 200
    };

    /**
     * get inline styles to apply
     * @param {boolean} visible
     * @param {string} side
     * @param {object} sizeData
     * @returns {{}}
     * @private
     */
    var _getDepthContainerStyles = function (visible, side, sizeData) {
        var style = {};
        if (!visible) {
            style['display'] = 'none';
        } else {
            style['display'] = 'block';
        }
        if (side === "right") {
            style['max-width'] = sizeData.maxWidth + 'px';
            style['min-width'] = sizeData.minWidth + 'px';
            style['max-height'] = '';
            style['min-height'] = '';
        } else {
            style['max-height'] = sizeData.maxHeight + 'px';
            style['min-height'] = sizeData.minHeight + 'px';
            style['max-width'] = '';
            style['min-width'] = '';
        }
        return style;
    };

    /**
     * Check whether chart has enough space to display depth
     * @param id
     * @param side
     * @returns {boolean|*}
     * @private
     */
    var _hasSpace = function (id, side) {
        var chartInstance = infChart.manager.getChart(id),
            height,
            width;

        if (chartInstance.isResizeRequired()) {
            var dimensions = infChart.structureManager.getHighChartContainerDimensions(id, chartInstance.getContainer(), undefined, true);
            height = dimensions.height;
            width = dimensions.width;
        } else {
            var highChartContainerEl = infChart.structureManager.getContainer(chartInstance.getContainer(), "chartContainer");
            height = highChartContainerEl.clientHeight;
            width = highChartContainerEl.clientWidth;
        }

        return _getSize(id, side, width, height).hasSpace;

    };

    /**
     * Returns the size of the depth panel and whether chart has enough space to show
     * @param id
     * @param side
     * @param width
     * @param height
     * @returns {{depthHeight: number, depthWidth: number, usedHeight: number, usedWidth: number, hasSpace: boolean}}
     * @private
     */
    var _getSize = function (id, side, width, height) {
        var sizeData = _depthPropertyMap[id].sizeData, usedWidth = 0, usedHeight = 0, depthHeight = 0, depthWidth = 0, hasSpace = false;

        if (side === "right") {
            usedWidth = Math.floor(Math.min(sizeData.maxWidth, Math.max(sizeData.minWidth, width / 6)));
            depthWidth = usedWidth;
            depthHeight = height;
            hasSpace = width / 3 >= depthWidth;
        } else {
            usedHeight = Math.floor(Math.min(sizeData.maxHeight, Math.max(sizeData.minHeight, height / 6)));
            depthHeight = usedHeight;
            depthWidth = width;
            hasSpace = height / 3 >= depthHeight;
        }
        return {
            depthHeight: depthHeight,
            depthWidth: depthWidth,
            usedHeight: usedHeight,
            usedWidth: usedWidth,
            hasSpace: hasSpace
        };
    };

    /**
     * Resize the container of the depth (order book volume ) chart
     * @param {string} id - container id or chart.id
     * @param container
     * @param {number} width
     * @param {number} height
     * @returns {{width: number, height: number}}
     * @private
     */
    var _setContainerSize = function (id, container, width, height) {
        var depthContainer = $(infChart.structureManager.getContainer(container, 'depthContainer'));
        var depthSettings = _depthPropertyMap[id].settings, size;
        var usedWidth = 0, usedHeight = 0, depthHeight = 0, depthWidth = 0;

        if (depthSettings && depthSettings.show) {
            size = _getSize(id, depthSettings.side, width, height);
            usedWidth = size.usedWidth;
            usedHeight = size.usedHeight;
            depthHeight = size.depthHeight;
            depthWidth = size.depthWidth;
            depthContainer.width(depthWidth).height(depthHeight);
        }

        _depthSizes[id] = {'width': depthWidth, 'height': depthHeight};
        return {'width': usedWidth, 'height': usedHeight};
    };

    /**
     * Returns the wrapper class of the depth (order book volume ) side
     * @param {string} side
     * @returns {string}
     * @private
     */
    var _getDepthWrapper = function (side) {
        return side === 'right' ? 'order-book-volume-right' : '';
    };

    /**
     * config for depth
     * @returns {{mode: string}}
     * @private
     */
    var _getDepthConfigOptions = function () {
        return {'mode': 'aggregated'};
    };

    /**
     * create depth chart
     * @param {string} id - container id or chart.id
     * @param container
     * @param {object} depthSettings
     * @returns {infChart.Depth}
     * @private
     */
    var _createDepthChartInstance = function (id, container, depthSettings) {
        var chartInstance = infChart.manager.getChart(id), depthChart = undefined;
        if (chartInstance) {
            depthChart = new infChart.Depth(container, id, _getDepthConfigOptions(), chartInstance.symbol);

            var chartOptions = _getChartOptions(depthSettings.side, chartInstance, id);
            var scaleFactors = chartInstance.getScaleFactors();

            depthChart.initialize(chartOptions, scaleFactors);//element size not set yet
            _setXAxisExtremes(id, chartInstance, depthChart);
            _resize(id);
        }

        return depthChart;
    };

    /**
     * initialize
     * called when chart is initialized
     * @param {string} id - container id or chart.id
     * @param container
     * @param {object} sizeDataConfig
     * @param {object} depthSettings
     * @private
     */
    var _initialize = function (id, container, sizeDataConfig, depthSettings) {
        var sizeData = $.extend({}, _defaultSizeData, sizeDataConfig);
        _depthPropertyMap[id] = {'sizeData': sizeData, 'settings': depthSettings};
        _addListeners(id);
    };

    /**
     * initialize depth chart
     * @param {string} id - container id or chart.id
     * @param container
     * @param {object} depthSettings
     * @param {object} sizeData
     * @private
     */
    var _initializeWithSettings = function (id, container, depthSettings, sizeData) {
        var depthContainer = $(infChart.structureManager.getContainer(container, 'depthContainer'));
        if (depthSettings && depthSettings.enabled) {
            container.xRemoveClass('order-book-volume-right');
            depthContainer.css(_getDepthContainerStyles(depthSettings.show, depthSettings.side, sizeData));
            if (depthSettings.show) {
                var cls = _getDepthWrapper(depthSettings.side);
                if (cls) {
                    container.xAddClass(cls);
                }
                depthContainer.addClass('order-book-volume');
                var depthChart = _createDepthChartInstance(id, depthContainer[0], depthSettings);
                if (depthChart) {
                    _depthInstances[id] = depthChart;
                }
            }
        } else {
            depthContainer.hide();
        }
    };

    /**
     * update extremes when x-axis range changes if depth has set the extremes
     * @param {string} id - container id or chart.id
     * @param {infChart.StockChart} chartInstance
     * @private
     */
    var _onXAxisExtremes = function (id, chartInstance) {
        if (_depthPropertyMap[id].settings.side === 'right') {
            var index = _extremeArray.indexOf(id);
            if (index > -1 && _depthData[id]) {
                var yAxis = chartInstance.getMainYAxis(), yAxisDataMinMax = _getYAxisDataMinMax(chartInstance);
                var data = _getProcessedData(_depthData[id], chartInstance.isLog);
                if (_shouldResetExtremes(data, yAxisDataMinMax)) {
                    _resetExtremes(id);
                } else if (yAxis.min > yAxis.dataMin) {
                    yAxis.setExtremes(yAxis.dataMin, (yAxis.userMax || yAxis.dataMax), true, false);
                } else if (yAxis.max < yAxis.dataMax) {
                    yAxis.setExtremes((yAxis.userMin || yAxis.dataMin), yAxis.dataMax, true, false);
                }
            }
        }
    };

    /**
     * set x axis extremes
     * @param {string} id - container id or chart.id
     * @param {infChart.StockChart} chartInstance
     * @param {infChart.Depth} depthChart
     * @private
     */
    var _setXAxisExtremes = function (id, chartInstance, depthChart) {
        if (_depthPropertyMap[id].settings.side === 'right') {
            var yAxisMinMax = _getYAxisMinMax(chartInstance), extremesSet = false;
            if (yAxisMinMax) {
                var index = _extremeArray.indexOf(id);
                if (_depthData[id]) {
                    var data = _getProcessedData(_depthData[id], chartInstance.isLog);
                    if (infChart.manager.isDefaultYAxisExtremes(id)) {
                        var newExtremes = _getDepthExtremes(data, yAxisMinMax);
                        if (newExtremes) {
                            extremesSet = true;
                            _setExtremes(id, newExtremes);
                        } else {//draw to full range
                            if (index > -1) {
                                var yAxisDataMinMax = _getYAxisDataMinMax(chartInstance);
                                if (_shouldResetExtremes(data, yAxisDataMinMax)) {
                                    extremesSet = true;
                                    _resetExtremes(id);
                                }
                            }
                        }
                    }
                    if (!extremesSet) {
                        var added = _addDummyDataToMatchExtremes(data, yAxisMinMax);
                        if (added) {
                            depthChart.updateData(data);
                        }
                    }
                }
                if (!extremesSet) {
                    depthChart.setXExtremes(yAxisMinMax.min, yAxisMinMax.max);
                    //if(index > -1) {
                    //    _extremeArray.splice(index);
                    //}
                }
            }
        }
    };

    /**
     * get extremes required for order book data
     * requirement is to always show bid ask data in depth chart(when on right side)
     * @param {object} data - order book data
     * @param {object} yAxisMinMax - object with min and max
     * @returns {object} - min, max of extremes to be set
     * @private
     */
    var _getDepthExtremes = function (data, yAxisMinMax) {
        var newExtremes;
        if (data.data.bid.length > 0 && data.data.ask.length > 0) {
            var bestBid = data.data.bid[data.data.bid.length - 1],
                bestAsk = data.data.ask[0].x;

            if (yAxisMinMax.min > bestBid) {
                newExtremes = {};
                newExtremes.min = bestBid * (1 - 0.002);
            }

            if (yAxisMinMax.max < bestAsk) {
                if (!newExtremes) {
                    newExtremes = {};
                }
                newExtremes.max = bestAsk * (1 + 0.002);
            }
        }

        return newExtremes;
    };

    /**
     * whether to reset the extremes set by order book data
     * @param {object} data - order book data
     * @param {object} yAxisDataMinMax - object with min and max
     * @returns {boolean} whether we should reset the extremes set by order book data
     * @private
     */
    var _shouldResetExtremes = function (data, yAxisDataMinMax) {
        var minReset = false, maxReset = false;
        if (yAxisDataMinMax && data.data.bid.length > 0 && data.data.ask.length > 0) {
            var bestBid = data.data.bid[data.data.bid.length - 1].x,
                bestAsk = data.data.ask[0].x;
            //first validate best bid/ask is shown
            if (yAxisDataMinMax.min < bestBid) {
                minReset = true;
            }
            if (minReset && yAxisDataMinMax.max > bestAsk) {
                maxReset = true;
            }
        }
        return minReset && maxReset;
    };

    /**
     * reset extremes
     * @param {string} id - container id or chart.id
     */
    var _resetExtremes = function (id) {
        _extremeArray.splice(_extremeArray.indexOf(id));
        //if (infChart.manager.isDefaultYAxisExtremes(id)) {
        infChart.manager.getChart(id).getMainYAxis().setExtremes(undefined, undefined, true, false);
        //}
    };

    /**
     * handle chart mode change
     * @param {string} id - container id or chart.id
     * @param {string} mode - chart mode
     * @private
     */
    var _handleChartModeChange = function (id, mode) {
        if (_isDepthAvailable(id) && _depthPropertyMap[id].settings.side === 'right') {
            var data, yAxisMinMax = _getYAxisMinMax(infChart.manager.getChart(id));
            switch (mode) {
                case 'log':
                case 'percentToLog':
                    if (_depthData[id]) {
                        data = _getProcessedData(_depthData[id], true);
                        _addDummyDataToMatchExtremes(data, yAxisMinMax);
                        _depthInstances[id].updateData(data);
                    }
                    break;
                case 'logToNormal':
                case 'logToPercent':
                    if (_depthData[id]) {
                        data = _getProcessedData(_depthData[id], false);
                        _addDummyDataToMatchExtremes(data, yAxisMinMax);
                        _depthInstances[id].updateData(data);
                    }
                    break;
            }
        }
    };

    /**
     * destroy
     * called when chart is destroyed
     * @param {string} id - container id or chart.id
     * @private
     */
    var _destroy = function (id) {
        if (_isDepthAvailable(id)) {
            _depthInstances[id] && _depthInstances[id].destroy();
            delete _depthInstances[id];
        }
        var iChart = infChart.manager.getChart(id);
        if (iChart) {
            _listeners[id].forEach(function (val) {
                iChart.removeRegisteredEvent(val.method, val.id);
            });
        }
        delete _listeners[id];
        delete _depthSizes[id];
        delete _depthPropertyMap[id];
    };

    /**
     * remove only the depth instance
     * @param {string} id - container id or chart.id
     * @param container
     * @private
     */
    var _removeDepthInstance = function (id, container) {
        _depthInstances[id].destroy();
        delete _depthInstances[id];
        container.xRemoveClass('order-book-volume-right');
        var depthContainer = $(infChart.structureManager.getContainer(container, 'depthContainer')),
            depthSettings = _depthPropertyMap[id].settings, sizeData = _depthPropertyMap[id].sizeData;
        depthContainer.css(_getDepthContainerStyles(depthSettings.show, depthSettings.side, sizeData));
    };

    /**
     * set properties
     * @param {string} id - container id or chart.id
     * @param container
     * @param {object} depthSettings
     * @private
     */
    var _setProperties = function (id, container, depthSettings) {
        var resizeRequired = false;
        _depthPropertyMap[id].noData = false;
        if (_isDepthAvailable(id)) {
            var previousSettings = _depthPropertyMap[id].settings;
            _depthPropertyMap[id].settings = depthSettings;
            if (typeof depthSettings === 'undefined' || depthSettings.enabled === false || depthSettings.show === false) {
                _removeDepthInstance(id, container);
                resizeRequired = true;
            } else {
                _depthInstances[id].resetData(false);
                if (depthSettings.side !== previousSettings.side) {
                    _changeDepthChartSide(id, container, depthSettings, _depthPropertyMap[id].sizeData);
                    resizeRequired = true;
                } else {
                    _setXAxisExtremes(id, infChart.manager.getChart(id), _depthInstances[id]);
                }
            }
        } else {
            _depthPropertyMap[id].settings = depthSettings;
            _initializeWithSettings(id, container, depthSettings, _depthPropertyMap[id].sizeData);
            resizeRequired = depthSettings && depthSettings.enabled && depthSettings.show;
        }
        return resizeRequired;
    };

    /**
     * when no data
     * @param {string} id - container id or chart.id
     * @param container
     * @param {boolean} noData
     * @private
     */
    var _onNoData = function (id, container, noData) {
        var depthContainer = $(infChart.structureManager.getContainer(container, 'depthContainer'));
        _depthPropertyMap[id].noData = noData;
        if (noData) {
            depthContainer.hide();
        } else {
            if (_isDepthAvailable(id)) {
                depthContainer.show();
            } else {
                _initializeWithSettings(id, container, _depthPropertyMap[id].settings, _depthPropertyMap[id].sizeData);
            }
        }
    };

    /**
     * get settings
     * @param {string} id - container id or chart.id
     * @returns {*}
     * @private
     */
    var _getProperties = function (id) {
        return _depthPropertyMap[id] && _depthPropertyMap[id].settings;
    };

    /**
     * change side
     * @param {string} id - container id or chart.id
     * @param container
     * @param {string} side
     * @returns {*}
     * @private
     */
    var _changeSide = function (id, container, side) {
        var depthSettings = _depthPropertyMap[id].settings, isSideChange = false;

        if ((depthSettings.show && depthSettings.side === side) || _hasSpace(id, side)) {

            if (_depthPropertyMap[id].noData !== true) {
                if (depthSettings.side === side) {
                    depthSettings.show = !depthSettings.show;
                } else {
                    depthSettings.show = true;
                    depthSettings.side = side;
                    isSideChange = true;
                }
            } else {
                depthSettings.side = side;
                depthSettings.show = false;
            }

            if (_isDepthAvailable(id)) {
                var index;
                if (isSideChange) {
                    if (side !== 'right') {
                        index = _extremeArray.indexOf(id);
                        if (index > -1) {
                            _resetExtremes(id);
                        }
                    }
                    _changeDepthChartSide(id, container, depthSettings, _depthPropertyMap[id].sizeData);
                } else {
                    if (!depthSettings.show) {
                        _removeDepthInstance(id, container);
                        index = _extremeArray.indexOf(id);
                        if (index > -1) {
                            _resetExtremes(id);
                        }
                    }
                }
            } else {
                if (depthSettings.show) {
                    _initializeWithSettings(id, container, depthSettings, _depthPropertyMap[id].sizeData);
                }
            }
        } else {
            infChart.util.showMessage(id, infChart.manager.getLabel("msg.depthNotEnoughSpace"));
        }
        return depthSettings;
    };

    /**
     * change depth side
     * @param {string} id - container id or chart.id
     * @param container
     * @param depthSettings
     * @param sizeData
     * @private
     */
    var _changeDepthChartSide = function (id, container, depthSettings, sizeData) {
        container.xRemoveClass('order-book-volume-right');
        var cls = _getDepthWrapper(depthSettings.side);
        if (cls) {
            container.xAddClass(cls);
        }
        var depthContainer = $(infChart.structureManager.getContainer(container, 'depthContainer'));
        depthContainer.css(_getDepthContainerStyles(depthSettings.show, depthSettings.side, sizeData));

        var chartInstance = infChart.manager.getChart(id);
        var chartOptions = _getChartOptions(depthSettings.side, chartInstance, id);
        var scaleFactors = chartInstance.getScaleFactors();
        _depthInstances[id].redrawChart(chartOptions, scaleFactors);
        _setXAxisExtremes(id, chartInstance, _depthInstances[id]);
    };

    /**
     * resize depth chart
     * @param {string} id - container id or chart.id
     * @private
     */
    var _resize = function (id) {
        setTimeout(function () {
            if (_isDepthAvailable(id)) {
                //to use axis height
                var iChart = infChart.manager.getChart(id);
                if (iChart) {
                    var scaleFactors = iChart.getScaleFactors(), width = undefined, height = undefined;
                    if (_depthSizes[id]) {
                        width = _depthSizes[id].width;
                        height = _depthSizes[id].height;
                    }
                    if (_depthPropertyMap[id].settings.side === 'right') {
                        height = iChart.getMainYAxis().height;//set y-axis height
                        //iChart.chart.plotHeight + iChart.chart.margin[0];
                    }
                    _depthInstances[id].resize(width, height, scaleFactors);
                }
            }
        }, 10);
    };

    /**
     * get highcharts options
     * @param {string} side
     * @param {infChart.StockChart} chartInstance
     * @returns {{}}
     * @private
     */
    var _getChartOptions = function (side, chartInstance, id) {
        var options = {}, highChartInstance = chartInstance.chart;
        if (side === 'right') {
            options.chart = {
                //"spacingLeft": 0,
                //"spacingRight": 0,
                //"spacingBottom": highChartInstance.spacingBottom,
                //"spacingTop": highChartInstance.spacingTop,
                "marginLeft": 0,
                "marginRight": 0,
                "marginBottom": 0,
                "marginTop": 0,
                "inverted": true
            };
            options.xAxis = {
                "left": 0,
                "width": 0,
                "labels": {
                    "enabled": false
                },
                "reversed": false
            };
            options.yAxis = {
                "labels": {
                    "enabled": false
                }
            };
            options.legend = {
                "enabled": false
            };
            options.series = [{'step': 'right'}, {'step': 'left'}];
        } else {
            options.chart = {
                "marginTop": 5,
                "inverted": false
            };
            if (highChartInstance.userOptions.marginLeft) {
                options.chart.marginLeft = highChartInstance.marginLeft;
            }
            if (highChartInstance.userOptions.marginRight) {
                options.chart.marginRight = highChartInstance.marginRight;
            }
            options.xAxis = {
                "left": highChartInstance.plotLeft,
                //"width": null,
                "labels": {
                    "enabled": true
                },
                "reversed": false
            };
            options.yAxis = {
                "labels": {
                    "enabled": true
                }
            };
            options.legend = {
                "enabled": true
            };
            options.series = [{'step': 'left'}, {'step': 'right'}];
        }
        options.chart.infChartType = "depth";
        options.chart.infChartId = id;
        options.xAxis.type = chartInstance.isLog ? 'logarithmic' : 'linear';
        return options;
    };

    /**
     * get extremes
     * @param {infChart.StockChart} chart
     * @returns {undefined}
     * @private
     */
    var _getYAxisMinMax = function (chart) {
        var mainYAxis = chart.getMainYAxis(), axisOptions = undefined;
        if (mainYAxis) {
            //we are converting values to log - so log is set to false
            var min = chart.getBaseValue(mainYAxis.min, false, chart.isCompare, chart.isPercent),
                max = chart.getBaseValue(mainYAxis.max, false, chart.isCompare, chart.isPercent);
            if (min || max) {
                axisOptions = {
                    min: min,
                    max: max
                };
            }
        }
        return axisOptions;
    };

    /**
     * get extremes
     * @param {infChart.StockChart} chart
     * @returns {undefined}
     * @private
     */
    var _getYAxisDataMinMax = function (chart) {
        var mainYAxis = chart.getMainYAxis(), axisOptions = undefined;
        if (mainYAxis && mainYAxis.dataMin && mainYAxis.dataMax) {
            //we are converting values to log - so log is set to false
            var min = chart.getBaseValue(mainYAxis.dataMin, false, chart.isCompare, chart.isPercent),
                max = chart.getBaseValue(mainYAxis.dataMax, false, chart.isCompare, chart.isPercent);
            axisOptions = {
                min: min,
                max: max
            };
        }
        return axisOptions;
    };

    /**
     * update depth data
     * @param {string} id - container id or chart.id
     * @param {object} data - bids, asks arrays
     * @private
     */
    var _updateData = function (id, data) {
        if (_isDepthAvailable(id)) {
            _depthData[id] = data;
            var update = true, processedData;
            if (_depthPropertyMap[id].settings.side === 'right') {
                var chartInstance = infChart.manager.getChart(id);
                processedData = _getProcessedData(data, chartInstance.isLog);
                var yAxisMinMax = _getYAxisMinMax(chartInstance);
                if (yAxisMinMax) {
                    if (infChart.manager.isDefaultYAxisExtremes(id)) {
                        var newExtremes = _getDepthExtremes(processedData, yAxisMinMax);
                        if (newExtremes) {
                            _setExtremes(id, newExtremes);
                        }
                    }
                    _addDummyDataToMatchExtremes(processedData, yAxisMinMax);
                }
            } else {
                processedData = data;
            }
            if (update) {
                _depthInstances[id].updateData(processedData);
            }
        }
    };

    /**
     * convert order book data to log mode
     * @param {object} data - order book data
     * @param {boolean} isLog - is chart in log mode
     * @returns {object}
     */
    var _getProcessedData = function (data, isLog) {
        var processedData = {'data': {}, 'mid': data.mid};
        if (isLog) {
            processedData.data.bid = [];
            processedData.data.ask = [];
            data.data.bid.forEach(function (obj) {
                processedData.data.bid.push($.extend({}, obj, {'x': infChart.util.num2Log(obj.x)}));
            });
            data.data.ask.forEach(function (obj) {
                processedData.data.ask.push($.extend({}, obj, {'x': infChart.util.num2Log(obj.x)}));
            });
        } else {
            processedData.data.bid = data.data.bid.slice();
            processedData.data.ask = data.data.ask.slice();
        }
        return processedData;
    };

    /**
     * add dummy data to extend the order book to show until the chart y axis extremes
     * @param {object} data - order book data
     * @param {object} yAxisMinMax - object with min and max
     * @returns {boolean} whether dummy data is added
     * @private
     */
    var _addDummyDataToMatchExtremes = function (data, yAxisMinMax) {
        var added = false;
        if (data.data.bid.length > 0 && data.data.ask.length > 0) {
            var extremeBid = data.data.bid[0],
                extremeAsk = data.data.ask[data.data.ask.length - 1];

            if (extremeBid.x > yAxisMinMax.min) {
                data.data.bid.unshift({
                    'x': yAxisMinMax.min,
                    'price': extremeBid.x,
                    'y': extremeBid.y,
                    'bid': true,
                    'volume': 0,
                    'cumulativeValue': extremeBid.y
                });
                added = true;
            }
            if (extremeAsk.x < yAxisMinMax.max) {
                data.data.ask.push({
                    'x': yAxisMinMax.max,
                    'price': extremeAsk.x,
                    'y': extremeAsk.y,
                    'bid': false,
                    'volume': 0,
                    'cumulativeValue': extremeAsk.y
                });
                added = true;
            }
        }
        return added;
    };

    /**
     * is depth chart created
     * @param {string} id - container id or chart.id
     * @returns {boolean}
     * @private
     */
    var _isDepthAvailable = function (id) {
        return _depthInstances.hasOwnProperty(id);
    };

    /**
     * add listeners to get data from chart instance
     * @param {string} id - container id or chart.id
     * @private
     */
    var _addListeners = function (id) {
        if (!_listeners[id]) {
            var chartInstance = infChart.manager.getChart(id);
            if (chartInstance) {
                _listeners[id] = [];
                _listeners[id].push({
                    method: 'afterYSetExtremes', id: chartInstance.registerForEvents('afterYSetExtremes', function () {
                        if (_isDepthAvailable(id)) {
                            _setXAxisExtremes(id, chartInstance, _depthInstances[id]);
                        }
                    })
                });
                _listeners[id].push({
                    method: 'afterXSetExtremes', id: chartInstance.registerForEvents('afterXSetExtremes', function () {
                        if (_isDepthAvailable(id)) {
                            _onXAxisExtremes(id, chartInstance);
                        }
                    })
                });
                _listeners[id].push({
                    method: 'setSymbol',
                    id: chartInstance.registerForEvents('setSymbol', function (symbol, previousSymbol, config) {
                        if (config.setProperties) {
                            var resizeRequired = _setProperties(id, infChart.structureManager.getContainer(chartInstance.getContainer(), 'chartContainer'), config.depth);
                            if (resizeRequired) {
                                chartInstance.resizeChart();
                            }
                        }
                        if (_isDepthAvailable(id)) {
                            delete _depthData[id];
                            _depthInstances[id].onBaseSymbolChange(symbol);
                            //_setXAxisExtremes(id, chartInstance, _depthInstances[id]);
                        }
                    })
                });
                _listeners[id].push({
                    method: 'onBaseAxisResize', id: chartInstance.registerForEvents('onBaseAxisResize', function () {
                        _resize(id);
                    })
                });
                _listeners[id].push({
                    method: 'resize', id: chartInstance.registerForEvents('resize', function () {
                        _resize(id);
                    })
                });
                //_listeners[id].push({
                //    method: 'destroy', id: chartInstance.registerForEvents('destroy', function () {
                //        _destroy(id);
                //    })
                //});
                _listeners[id].push({
                    method: 'modeChange', id: chartInstance.registerForEvents('modeChange', function (value) {
                        _handleChartModeChange(id, value);
                    })
                });
            }
        }
    };

    /**
     * set extremes
     * @param {string} id - container id or chart.id
     * @param {object} extremes - object with min, max
     * @private
     */
    var _setExtremes = function (id, extremes) {
        var chartInstance = infChart.manager.getChart(id);
        if (chartInstance) {
            var mainSeries = chartInstance.getMainSeries();
            if (mainSeries && mainSeries.options.data.length > 0) {
                var data = chartInstance.getSeriesData(mainSeries, false);
                if (data.length > 0) {
                    var min, max, yAxis = chartInstance.getMainYAxis();
                    //we are converting values to log - so when log no need to get y value
                    if (extremes.min) {
                        min = chartInstance.convertBaseYValue(extremes.min, false, chartInstance.isCompare, chartInstance.isPercent);
                    } else {
                        min = yAxis.userMin || yAxis.dataMin;
                    }
                    if (extremes.max) {
                        max = chartInstance.convertBaseYValue(extremes.max, false, chartInstance.isCompare, chartInstance.isPercent);
                    } else {
                        max = yAxis.userMax || yAxis.dataMax;
                    }
                    //console.error("chart depth :: _setExtremes min@" + min + ', max@' + max);
                    var index = _extremeArray.indexOf(id);
                    if (index === -1) {
                        _extremeArray.push(id);
                    }
                    yAxis.setExtremes(min, max, true, false);
                }
            }
        }
    };

    /**
     * Check whether the given chart is a depth chart or not
     * @param {object} chart - highchart object
     * @returns {*|boolean} - is depth chart
     * @private
     */
    var _isDepthChart = function (chart) {
        return chart && chart.userOptions.chart && chart.userOptions.chart.infChartType === "depth";
    };

    /**
     * To set the yAxis width according to the main chart
     * This method is called when ewdrawing the yAxis
     * @param {object} chart - highcharts object
     * @param {object} axis - axis of the chart which offset is required
     * @returns {number} axis offset
     * @private
     */
    var _getAxisLabelOffset = function (chart, axis) {
        var id = chart.userOptions.chart.infChartId;
        var chartInstance = infChart.manager.getChart(id);
        var depthSettings = _depthPropertyMap[id].settings;
        var offset = 0;

        if (depthSettings.side === "bottom") {
            offset = chartInstance.chart.axisOffset[axis.side];
        }
        return offset;
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

    return {
        initialize: _initialize,
        destroy: _destroy,
        setProperties: _setProperties,
        getProperties: _getProperties,
        updateData: _updateData,
        changeSide: _changeSide,
        resize: _resize,
        //onPlotHeightChange: _resize,
        onNoData: _onNoData,
        isDepthAvailable: _isDepthAvailable,
        setContainerSize: _setContainerSize,
        isDepthChart: _isDepthChart,
        getAxisLabelOffset: _getAxisLabelOffset,
        getDepthContainer: _getDepthContainer
        //getExtremes: _getExtremes,
        //setExtremes: _setExtremes
    }
})(jQuery, infChart);