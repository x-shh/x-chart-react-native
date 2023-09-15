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
var infChart = window.infChart || {};
/**
 * @constructor
 */
infChart.Commands = function () {
    this.undoStack = [];
    this.redoStack = [];
};

/**
 * Executes an action and adds it to the undo stack.
 * @param {function()} action Action function.
 * @param {function()} reverse Reverse function.
 * @param {Object=} ctx The 'this' argument for the action/reverse functions.
 * @param {boolean} executeAction whether to execute the action immediately or not
 * @param {string} actionType type to uniquely identify the actions
 * @param {string} callbackOptions callback Options if anything to be set as params
 */
infChart.Commands.prototype.execute = function (action, reverse, ctx, executeAction, actionType, callbackOptions) {
    this.undoStack.push({
        action: action,
        reverse: reverse,
        ctx: ctx,
        actionType: actionType,
        callbackOptions: callbackOptions
    });
    if (executeAction) {
        action.call(ctx);
    }
    console.debug("================execute================");
    console.debug(this.undoStack[this.undoStack.length - 1]);
    this.redoStack.length = 0;
    console.debug(new Error().stack);
};

/**
 * Undo the action
 */
infChart.Commands.prototype.undo = function () {
    var c = this.undoStack.pop();
    console.debug("================undo================");
    console.debug(c);
    if (c) {
        var redoObject = Object.assign({}, c);
        if (c.callbackOptions && c.callbackOptions.redoProperties) {
            var redoProp = JSON.parse(JSON.stringify(c.callbackOptions.redoProperties));
            redoObject.callbackOptions.redoProperties = redoProp;
        }
        c.reverse.call(c.ctx, c.callbackOptions);
        this.redoStack.push(redoObject);
    }
};

/**
 * Redo the action if any
 */
infChart.Commands.prototype.redo = function () {
    var c = this.redoStack.pop();
    console.debug("================redo================");
    console.debug(c);
    if (c) {
        var newStackItem = c.action.call(c.ctx, c.callbackOptions);
        if (newStackItem) {
            c = $.extend(c, newStackItem);
        }
        this.undoStack.push(c);
    }
};

/**
 * Returns true if there are redo actions
 * @returns {null|boolean} has redo
 */
infChart.Commands.prototype.hasRedo = function () {
    return this.redoStack && this.redoStack.length > 0;
};

/**
 * Returns true if there are undo actions
 * @returns {null|boolean} has undo
 */
infChart.Commands.prototype.hasUndo = function () {
    return this.undoStack && this.undoStack.length > 0;
};

/**
 *
 */
infChart.Commands.prototype.destroy = function () {
    this.undoStack = null;
    this.redoStack = null;
};

/***
 * Clean the given action type from the given stack or remove all if not specified
 * @param {string} actionType unique key of the action
 * @param {string} type type of the command
 */
infChart.Commands.prototype.clearStack = function (actionType, type) {
    if (actionType) {
        function clearStack(stack) {
            for (var i = stack.length - 1; i >= 0; i--) {
                if (stack[i].actionType === actionType) {
                    stack.splice(i, 1);
                }
            }
        }

        if (type === "undo" || !type) {
            clearStack(this.undoStack);
        }
        if (type === "redo" || !type) {
            clearStack(this.redoStack);
        }

    } else {

        if (type === "undo" || !type) {
            this.undoStack = [];
        }
        if (type === "redo" || !type) {
            this.redoStack = [];
        }
    }
};

/**
 * Update the last undo action from given options
 * @param update
 */
infChart.Commands.prototype.updateLastUndo = function (update) {
    if (this.undoStack.length) {
        var lastUndo = this.undoStack[this.undoStack.length - 1];
        $.extend(lastUndo, update);
    }
};

/**
 * Whether the last action is frozen to update or not
 * @returns {boolean}
 */
infChart.Commands.prototype.isLastUpdateFrozen = function () {
    if (this.undoStack.length) {
        var lastUndo = this.undoStack[this.undoStack.length - 1];
        return lastUndo && lastUndo.freezeUpdatingSame;
    }
    return false
};

/**
 * Returns the last undo action
 * @returns {object}
 */
infChart.Commands.prototype.getLastAction = function () {
    if (this.undoStack.length) {
        return this.undoStack[this.undoStack.length - 1];
    }
};

/**
 * Remove the last undo action
 * @returns {object}
 */
infChart.Commands.prototype.removeLastAction = function () {
    if (this.undoStack.length) {
        this.undoStack.pop();
    }
};

/**
 * Management of commands(undo/redo) of the chart goes here
 * @type {*|{}}
 */
var infChart = window.infChart || {};

infChart.commandsManager = (function ($, infChart) {

    var _commands = {};
    var _mouseIsDown = false;
    var _lastRegisteredCommand;
    var _keyDownFunction = {};
    var mouseWheelInProgress = false;
    var _lastRegisteredChartId;

    /**
     * Returns the StockChart object of the given container
     * @param chartContainerId
     * @returns {*}
     * @private
     */
    var _getChartObj = function (chartContainerId) {
        return infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartContainerId));
    };

    /**
     * Initializing commands for the given chart
     * Note that this should be executed when initializing the chart
     * @param {string} chartId chart id
     */
    var initializeCommands = function (chartId) {
        _commands[chartId] = new infChart.Commands();
        _bindMouseMove(chartId);
        _bindKeyDown(chartId);
    };

    /**
     * Track whether the mouse is inside the chart
     * @param chartId
     * @private
     */
    var _bindMouseMove = function (chartId) {
        var xChart = _getChartObj(chartId);
        var container = xChart.getContainer();
        var $container = $(container);
        $container.on("mousemove", function (e) {
            container.xMouseIn = true;
            if (mouseWheelInProgress) {
                mouseWheelInProgress = false;
                _lastRegisteredCommand && _lastRegisteredCommand.updateLastUndo({freezeUpdatingSame: true});
            }
        });
        $container.on("mouseleave", function (e) {
            container.xMouseIn = false;
        });
    };

    /**
     * Bind key down for keyboard commands
     * @param {string} chartId chart id
     * @private
     */
    var _bindKeyDown = function (chartId) {
        function onKeyDown(event) {
            var xChart = _getChartObj(chartId);
            var container = xChart.getContainer();
            if (!xChart || (!xChart.chart || !container.xMouseIn)) {
                return;
            }

            var key = event.which || event.keyCode;
            var ctrl = event.ctrlKey || event.metaKey || ((key === 17) ? true : false);
            var shift = !!event.shiftKey;

            if (key == 90) {
                if (shift && ctrl) {
                    executeCommand(chartId, "redo");
                } else if (ctrl) {
                    executeCommand(chartId, "undo");
                    event.preventDefault();
                }
            }
        }

        _keyDownFunction[chartId] = onKeyDown;
        $(document).on('keydown', onKeyDown);
    };

    /**
     * unbinding key down
     * @param {string} chartId chart id
     * @private
     */
    var _unbindKeyDown = function (chartId) {
        if (_keyDownFunction[chartId]) {
            $(document).off('keydown', _keyDownFunction[chartId]);
            delete _keyDownFunction[chartId];
        }
    };

    /**
     * set mousewheel status here since  chart mousewheel to avoid stops the event propogation
     */
    var setMouseWheel = function () {
        mouseWheelInProgress = true;
    };

    /**
     * Destroying commands when destroy the chart
     * @param {string} chartId chart id
     */
    var destroyCommands = function (chartId) {
        if (_commands[chartId]) {
            _commands[chartId].destroy();
            delete _commands[chartId];
        }
        _unbindKeyDown(chartId);
        _removeLastRegisteredCommands(chartId);
    };

    /**
     * Returns the commands object related to the given chart
     * @param {string} chartId chart id
     * @returns {infChart.commands} commands object
     */
    var getCommands = function (chartId) {
        return _commands[chartId];
    };

    /**
     * Register for undo/redo commands for the given chart
     * @param {string} chartId chart id
     * @param {function} action function to redo the action
     * @param {function} reverse function to undo the action
     * @param {object} ctx context
     * @param {boolean} executeImmediately
     * @param {string} actionType
     * @param {string} callbackOptions callbackOptions if any
     */
    var registerCommand = function (chartId, action, reverse, ctx, executeImmediately, actionType, callbackOptions) {
        var xChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
        var commands = _commands[chartId];
        if (commands) {
            commands.execute(action, reverse, ctx, executeImmediately, actionType, callbackOptions);
            if (xChart._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(chartId, "undo", commands.hasUndo());
            }
            _lastRegisteredCommand = commands;
            _lastRegisteredChartId = chartId;
        }
    };

    /**
     * Execute undo or redo command
     * @param {string} chartId chart id
     * @param {string} type command type undo/redo
     * @returns {boolean} whether to enable or disable btn
     */
    var executeCommand = function (chartId, type) {
        var command = _commands[chartId],
            enableBtn = false;
        if (command) {
            switch (type) {
                case "undo":
                    command.undo();
                    enableBtn = command.hasUndo();
                    infChart.toolbar.setSelectedControls(chartId, "redo", command.hasRedo());
                    break;
                case "redo":
                    command.redo();
                    enableBtn = command.hasRedo();
                    infChart.toolbar.setSelectedControls(chartId, "undo", command.hasUndo());
                    break;
                default :
                    break;
            }
        }
        return enableBtn;
    };

    /**
     * Clear undo or redo commands for specific actions
     * @param {string} chartId chart id
     * @param {string} actionType actionType
     * @param {string} type command type undo/redo
     */
    var clearFromCommandStacks = function (chartId, actionType, type) {
        var xChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
        var command = _commands[chartId];
        if (command) {
            command.clearStack(actionType, type);
            if (xChart._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(chartId, "redo", command.hasRedo());
                infChart.toolbar.setSelectedControls(chartId, "undo", command.hasUndo());
            }
        }
    };

    /**
     * Bind mouse events to catch the whether the mouse move events has been finished or not
     * (useful in setColor which is triggered from colorpicker
     * @private
     */
    var _initialBindings = function () {
        $(document).ready(function () {
            _mouseIsDown = false;
            $(document).mousedown(function () {
                _mouseIsDown = true;
            }).mouseup(function () {
                _mouseIsDown = false;
                // this is done to use in 'setColor' to avoid updating the colors changed before (from clicks and previous colorpicker movements)
                _lastRegisteredCommand && _lastRegisteredCommand.updateLastUndo({freezeUpdatingSame: true});
            });
        });
    };

    /**
     * Returns the last action in the cammand of the given chart
     * @param {string} chartId chart id
     * @returns {object} last action
     */
    var getLastAction = function (chartId) {
        var command = _commands[chartId];
        if (command) {
            return command.getLastAction();
        }
    };

    /**
     * Update the last action of the given chart from given options
     */
    var updateLastActionOptions = function (chartId, options) {
        var command = _commands[chartId];
        if (command) {
            return command.updateLastUndo({callbackOptions: options});
        }
    };

    /**
     * remove the last action of the given chart
     */
    var removeLastAction = function (chartId) {
        var command = _commands[chartId];
        if (command) {
            return command.removeLastAction();
        }
    };

    /**
     * remove last registered commands and chart id when destroy chart
     * to fix mouse up/down event issue
     * @param {string} chartId
     */
    var _removeLastRegisteredCommands = function (chartId) {
        if(chartId == _lastRegisteredChartId) {
            _lastRegisteredCommand = undefined;
            _lastRegisteredChartId = undefined;
        }
    };

    _initialBindings();

    return {
        initializeCommands: initializeCommands,
        setMouseWheel: setMouseWheel,
        destroyCommands: destroyCommands,
        getCommands: getCommands,
        executeCommand: executeCommand,
        registerCommand: registerCommand,
        clearFromCommandStacks: clearFromCommandStacks,
        getLastAction: getLastAction,
        updateLastActionOptions: updateLastActionOptions,
        removeLastAction: removeLastAction
    };
})(jQuery, infChart);
var infChart = window.infChart || {};

(function ($, infChart) {

    /**
     * Returns the chart id of given highchart instance
     * @param {Highcharts} highchartInstance chart
     * @returns {string} chart id
     * @private
     */
    var _getChartIdFromHighchartInstance = function (highchartInstance) {
        return infChart.manager.getContainerIdFromChart(highchartInstance.renderTo.id);
    };

    /**
     * Returns the StockChart object of the given container
     * @param chartContainerId
     * @returns {*}
     * @private
     */
    var _getChartObj = function (chartContainerId) {
        return infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartContainerId));
    };

    /**
     * Check whether the given annotation is from a undo/redo enabled drawing
     * @param {object} annotation annotation being checked
     * @returns {*|boolean}
     * @private
     */
    var _isTrackHistoryEnabledDrawing = function (annotation) {
        return annotation && annotation.options && (annotation.options.drawingType === infChart.constants.drawingTypes.shape);
    };

    /**
     * Check whether the given annotation is from a undo/redo enabled indicator drawing
     * @param {object} annotation annotation being checked
     * @returns {*|boolean}
     * @private
     */
    var _isIndicatorDrawing = function (annotation) {
        return annotation && annotation.options && (annotation.options.drawingType === infChart.constants.drawingTypes.indicator);
    };

    /**
     * Wrapping up the infChart.manager.initChart to initialize commands fot the chart
     */
    infChart.util.wrap(infChart.manager, 'initChart', function (proceed, uniqueId, properties) {
        var xChart = proceed.call(this, uniqueId, properties);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.initializeCommands(uniqueId);
        }
        return xChart;
    });

    /**
     * Wrapping up the infChart.manager.renderChart to initialize commands fot the chart
     */
    infChart.util.wrap(infChart.manager, 'renderChart', function (proceed, container, uniqueId, properties, setDefaultProperties) {
        var xChart = proceed.call(this, container, uniqueId, properties, setDefaultProperties);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.initializeCommands(uniqueId);
        }
        return xChart;
    });

    /**
     * Wrapping up the loadTemplate to clear the history
     */
    infChart.util.wrap(infChart.manager, 'loadTemplate', function (proceed, chartId, name, type, template) {
        infChart.commandsManager.clearFromCommandStacks(chartId);
        return proceed.call(this, chartId, name, type, template);
    });

    /**
     * Wrapping up the resetUserDefinedXAxisExtremes to catch the reset buttons for x-axis
     */
    infChart.util.wrap(infChart.manager, 'resetUserDefinedXAxisExtremes', function (proceed, chartId, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getRange();

            infChart.commandsManager.registerCommand(xChart.id, function () {
                extremes = xChart.getRange();
                proceed.call(xChart, xChart.id, true);
            }, function () {
                xChart.setXAxisExtremes(extremes.min, extremes.max, true, false);
            }, undefined, false, 'resetUserDefinedXAxisExtremes');
        }
        return proceed.call(this, chartId);
    });

    /**
     * Wrapping up the resetUserDefinedYAxisExtremes to catch the reset buttons for y-axis
     */
    infChart.util.wrap(infChart.manager, 'resetUserDefinedYAxisExtremes', function (proceed, chartId, redraw, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainYAxis().getExtremes();

            infChart.commandsManager.registerCommand(xChart.id, function () {
                extremes = xChart.getRange();
                proceed.call(xChart, xChart.id, true);
            }, function () {
                xChart.setUserDefinedYAxisExtremes(extremes.min, extremes.max, true);
            }, undefined, false, 'resetUserDefinedYAxisExtremes');

        }

        return proceed.call(this, chartId, redraw);
    });

    /**
     * Wrapping up the setUserDefinedXAxisExtremes to catch the musewheel for x axis
     */
    infChart.util.wrap(infChart.manager, 'setUserDefinedXAxisExtremes', function (proceed, chartId, userMin, userMax, redraw, isUserInteraction, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainXAxis().getExtremes(),
                yExtremes = xChart.getMainYAxis().getExtremes();
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var infManualExtreme = xChart.chart.infManualExtreme;

            if (lastAction && (lastAction.actionType === 'setUserDefinedYAxisExtremes' || lastAction.actionType === 'setUserDefinedXAxisExtremes' ) && !lastAction.freezeUpdatingSame) {
                if (lastAction.actionType === 'setUserDefinedXAxisExtremes') {
                    lastAction.action = function (callbackOptions) {
                        proceed.call(xChart, chartId, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction, true);
                        if (callbackOptions.otherRedoAction) { // y Axis is also changed in that action and redo that as well
                            callbackOptions.otherRedoAction.call(this);
                        }
                    }
                } else {
                    // To avoid dragging alone both the axis to be in separte actions,
                    // included the other axis' undo redo action to the last one and will execute it the main undo/redo actions if available.
                    lastAction.callbackOptions.otherRedoAction = function () {
                        infChart.manager.setUserDefinedXAxisExtremes.call(xChart, chartId, userMin, userMax, true, isUserInteraction, true);
                    };

                    if (!lastAction.callbackOptions.otherUndoAction) {
                        var otherUndoXExtremes = lastAction.callbackOptions.xExtremes;
                        lastAction.callbackOptions.otherUndoAction = function () {
                            infChart.manager.setUserDefinedXAxisExtremes.call(xChart, xChart.id, otherUndoXExtremes.min, otherUndoXExtremes.max, true, infManualExtreme, true);
                        };
                    }
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function (callbackOptions) {
                    extremes = xChart.getRange();
                    proceed.call(xChart, xChart.id, userMin, userMax, true, isUserInteraction, true);
                    if (callbackOptions.otherRedoAction) {  // y Axis is also changed in that action and redo that as well
                        callbackOptions.otherRedoAction.call(this);
                    }
                }, function (callbackOptions) {
                    proceed.call(xChart, xChart.id, extremes.min, extremes.max, !callbackOptions.otherUndoAction, infManualExtreme, true);
                    if (callbackOptions.otherUndoAction) {  // y Axis is also changed in that action and undo that as well
                        callbackOptions.otherUndoAction.call(this);
                    }
                }, undefined, false, 'setUserDefinedXAxisExtremes', {yExtremes: yExtremes});
            }
        }

        return proceed.call(this, chartId, userMin, userMax, redraw, isUserInteraction);
    });

    /**
     * Wrapping up the setUserDefinedYAxisExtremes to catch the mousewheel for y axis
     */
    infChart.util.wrap(infChart.manager, 'setUserDefinedYAxisExtremes', function (proceed, chartId, userMin, userMax, redraw, isUserInteraction, fromCommands) {
        if (!fromCommands) {
            var xChart = _getChartObj(chartId),
                extremes = xChart.getMainYAxis().getExtremes(),
                xExtremes = xChart.getMainXAxis().getExtremes();
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var infManualExtreme = xChart.chart.infIsUserYExt;

            if (lastAction && (lastAction.actionType === 'setUserDefinedYAxisExtremes' || lastAction.actionType === 'setUserDefinedXAxisExtremes' ) && !lastAction.freezeUpdatingSame) {
                if (lastAction.actionType === 'setUserDefinedYAxisExtremes') {
                    lastAction.action = function (callbackOptions) {
                        proceed.call(xChart, chartId, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction);
                        if (callbackOptions.otherRedoAction) {  // x Axis is also changed in that action and redo that as well
                            callbackOptions.otherRedoAction.call(this);
                        }
                    }
                } else {
                    // To avoid dragging alone both the axis to be in separte actions,
                    // included the other axis' undo redo action to the last one and will execute it the main undo/redo actions if available.
                    lastAction.callbackOptions.otherRedoAction = function () {
                        infChart.manager.setUserDefinedYAxisExtremes.call(xChart, chartId, userMin, userMax, true, isUserInteraction, true);
                    };

                    if (!lastAction.callbackOptions.otherUndoAction) {
                        var otherUndoYExtremes = lastAction.callbackOptions.yExtremes;
                        lastAction.callbackOptions.otherUndoAction = function () {
                            infChart.manager.setUserDefinedYAxisExtremes.call(xChart, xChart.id, otherUndoYExtremes.min, otherUndoYExtremes.max, true, infManualExtreme, true);
                        };
                    }
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function (callbackOptions) {
                    extremes = xChart.getMainYAxis().getExtremes();
                    proceed.call(xChart, xChart.id, userMin, userMax, !callbackOptions.otherRedoAction, isUserInteraction, true);
                    if (callbackOptions.otherRedoAction) {  // x Axis is also changed in that action and redo that as well
                        callbackOptions.otherRedoAction.call(this);
                    }
                }, function (callbackOptions) {
                    proceed.call(xChart, xChart.id, extremes.min, extremes.max, !callbackOptions.otherUndoAction, infManualExtreme, true);
                    if (callbackOptions.otherUndoAction) {  // x Axis is also changed in that action and undo that as well
                        callbackOptions.otherUndoAction.call(this);
                    }
                }, undefined, false, 'setUserDefinedYAxisExtremes', {xExtremes: xExtremes});
            }
        }

        return proceed.call(this, chartId, userMin, userMax, redraw, isUserInteraction);
    });

    //region=======================mouseWheel=======================

    /**
     * Wrapping up the infChart.MouseWheelController.prototype to initialize mousewheel binding before the chart to avoid stop propagation
     */
    infChart.util.wrap(infChart.MouseWheelController.prototype, 'onMouseWheel', function (proceed, event) {
        var xChartId = _getChartIdFromHighchartInstance(this.chart);
        var xChart = _getChartObj(xChartId);
        if (xChart.settings.config.enableUndoRedo) {
            infChart.commandsManager.setMouseWheel();
        }
        return proceed.call(this, event);
    });
    //endregion===================end of mousewheel===============

    //region========================Stock Chart Wrappers================================================================

    /**
     * Wrapping up the infChart.StockChart.prototype.setSymbol to catch the symbol change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setSymbol', function (proceed, symbolProperties, load, redraw, config, setDefaultChartSettings) {
        if (!this.isFirstLoadInprogress()) {
            var xChart = this;
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'addDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'pasteDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'removeDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAnnotationStore');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange_regressionChannel');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineColorChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFillColorChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLineWidthChange_andrewsPitchfork');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibArcsLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibFansLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFontSizeChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFontStyleChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onToggleText');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onVerticalPositionSelect');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onHorizontalPositionSelect');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onBackgroundColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onBorderColorChange_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onApplyBorderColor_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onApplyBackgroundColor_label');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelValueChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibLevelLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleOptionChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibModeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onXabcdLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onAbcdLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fibVerRetrancement');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fib2PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'eraseFibLevel_fib3PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onFibSingleFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'changeAllFibLines');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onElliotWaveDegreeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onChangeSnapToHighLow');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPriceLineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPriceLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onPolylineFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelFontWeightChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelValueChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibLevelChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleLineColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFillColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleLineWidthChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleFontWeightChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibSingleOptionChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onFibApplyAllButtonClick');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'genericTool_onAlignStyleChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGridLineWidth');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGridLineColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setChartBackgroundColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'setGradientChartBackgroundColor');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onExtendToRight');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onExtendToLeft');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLabelTextColorChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextColorChange_basic');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTextSizeChange_basic');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fibRetracementsDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointPriceProjectionDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointPriceProjectionGenericDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fibVerRetracementsDrawing');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onTrendLineToggleShow_fib3PointTimeProjection');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'onLabelTextSizeChange');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleLastPriceLabel');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleLastPriceLine');
            infChart.commandsManager.clearFromCommandStacks(xChart.id, 'toggleBarClosureTime');
        }
        return proceed.call(this, symbolProperties, load, redraw, config, true, setDefaultChartSettings);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setPeriod to catch the period change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setPeriod', function (proceed, period, isManually, setControl, range, isPropertyChange, redraw, isIntervalChange) {
        if (isPropertyChange) {
            var currentPeriod = this.period;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, period, isManually, true, range, isPropertyChange, true);
                xChart._onPropertyChange("period"); // doing this manually since isPropertyChange is used to fill the command stack and it should not refill from the same action again
            }, function () {
                proceed.call(xChart, currentPeriod, isManually, true, range, isPropertyChange, true);
                xChart._onPropertyChange("period");
            }, undefined, false, 'setPeriod');
        }
        return proceed.call(this, period, isManually, setControl, range, isPropertyChange, redraw, isIntervalChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setInterval to catch the interval change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setIntervalManually', function (proceed, interval, subInterval, redraw, range, isPropertyChange) {
        if (isPropertyChange) {
            var currentInterval = this.interval;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, interval, subInterval, true, undefined, false);
                xChart._onPropertyChange("interval");
            }, function () {
                proceed.call(xChart, currentInterval, undefined, true, undefined, false);
                xChart._onPropertyChange("interval");
            }, undefined, false, 'setIntervalManually');
        }
        return proceed.call(this, interval, subInterval, redraw, range, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setChartStyle to catch the chart style change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_changeSeriesType', function (proceed, series, type, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var currentType = this.type;
            var xChart = this;
            var mainSeries = xChart.getMainSeries();
            var mainSeriesId = mainSeries.options.id;
            var seriesId = series.options.id;

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(newType) {
                var settingPanel = xChart.settingsPopups[mainSeriesId];
                if (settingPanel) {
                    settingPanel.data("infUndoRedo", true);
                    settingPanel.find("[ind-ind-type=" + newType + "]").trigger('click');
                } else {
                    var undoRedoSeries = xChart.chart.get(seriesId);
                    xChart._changeSeriesType(undoRedoSeries, newType, redraw, false);
                }
                xChart._onPropertyChange("type", [newType]);
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(type);
            }, function () {
                undoRedo(currentType);
            }, undefined, false, '_changeSeriesType');
        }
        return proceed.call(this, series, type, redraw, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setLineWidth to catch the line width change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setLineWidth', function (proceed, series, width, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var seriesProperties = xChart._getSeriesProperties(series);
            var lineWidth = seriesProperties.lineWidth;
            var seriesId = series.options.id;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xChart.chart.get(seriesId), width, true, false);
                //xChart._onPropertyChange("type", [type]);
            }, function () {
                proceed.call(xChart, xChart.chart.get(seriesId), lineWidth, true, false);
                //xChart._onPropertyChange("type", [currentType]);
            }, undefined, false, 'setLineWidth');
        }
        return proceed.call(this, series, width, redraw, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGridLineWidth', function (proceed, xGridLineWidth, yGridLineWidth, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentXGridLineWidth = this.chart.options.xAxis[0].gridLineWidth;
            var currentYGridLineWidth = this.chart.options.yAxis[0].gridLineWidth;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xGridLineWidth, yGridLineWidth, true, false);
            }, function () {
                proceed.call(xChart, currentXGridLineWidth, currentYGridLineWidth, true, false);
                //xChart._onPropertyChange("type", [currentType]);
            }, undefined, false, 'setGridLineWidth');
        }
        return proceed.call(this, xGridLineWidth, yGridLineWidth, redraw, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGridLineColor', function (proceed, xGridLineColor, yGridLineColor, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentXGridLineColor = this.chart.options.xAxis[0].gridLineColor;
            var currentYGridLineColor = this.chart.options.yAxis[0].gridLineColor;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, xGridLineColor, yGridLineColor, false);
            }, function () {
                proceed.call(xChart, currentXGridLineColor, currentYGridLineColor, false);
            }, undefined, false, 'setGridLineColor');
        }
        return proceed.call(this, xGridLineColor, yGridLineColor, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setChartBackgroundColor', function (proceed, color, opacity, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentBackgroundColor = typeof this.chart.options.chart.backgroundColor === 'string' ? this.chart.options.chart.backgroundColor : "transparent";
             var currentBackgroundColorOpacity = this.backgroundColorOpacity;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, color, opacity, false);
            }, function () {
                proceed.call(xChart, currentBackgroundColor, currentBackgroundColorOpacity, false);
            }, undefined, false, 'setChartBackgroundColor');
        }
        return proceed.call(this, color, opacity, isPropertyChange);
    });

    infChart.util.wrap(infChart.StockChart.prototype, 'setGradientChartBackgroundColor', function (proceed, topColor, bottomColor, topColorOpacity, bottomColorOpacity, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;
            var currentTopGradientColor = this.chart.options.chart.backgroundColor && this.chart.options.chart.backgroundColor.stops ? this.chart.options.chart.backgroundColor.stops[0][1] : "transparent";
            var currentBottomGradientColor = this.chart.options.chart.backgroundColor && this.chart.options.chart.backgroundColor.stops ? this.chart.options.chart.backgroundColor.stops[1][1] : "transparent";
            var currentTopOpacity = this.chartBgTopGradientColorOpacity;
            var currentBottomOpacity = this.chartBgBottomGradientColorOpacity;


            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, topColor, bottomColor, topColorOpacity, bottomColorOpacity, false);
            }, function () {
                proceed.call(xChart, currentTopGradientColor, currentBottomGradientColor, currentTopOpacity, currentBottomOpacity,  false);
            }, undefined, false, 'setGradientChartBackgroundColor');
        }
        return proceed.call(this, topColor, bottomColor, topColorOpacity, bottomColorOpacity, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.setColor to catch the series color change and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setColor', function (proceed, series, hexColor, upColor, downColor, redraw, isPropertyChange, useSeriesLineColor) {
        if (isPropertyChange) {
            var colorProperties = this._getColorPropertiesFromOptions(series.options, series.type, series, useSeriesLineColor);
            var xChart = this;
            var lastAction = infChart.commandsManager.getLastAction(xChart.id);
            var seriesId = series.options.id;

            if (lastAction && lastAction.actionType === 'setColor' && !lastAction.freezeUpdatingSame) {
                lastAction.action = function () {
                    proceed.call(xChart, series, hexColor, upColor, downColor, true, false, useSeriesLineColor);
                }
            } else {
                infChart.commandsManager.registerCommand(xChart.id, function () {
                    proceed.call(xChart, xChart.chart.get(seriesId), hexColor, upColor, downColor, true, false, useSeriesLineColor);
                }, function () {
                    xChart._setSeriesProperties(xChart.chart.get(seriesId), colorProperties, true);
                }, undefined, false, 'setColor', {undoColorProperties: colorProperties});
            }
        }
        return proceed.call(this, series, hexColor, upColor, downColor, redraw, isPropertyChange, useSeriesLineColor);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.onNavigatorScrollStart to catch the navigator scrollingand set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'onNavigatorScrollStart', function (proceed, navigator) {
        var xChart = this;
        var extremes = $.extend({}, xChart.getRange());
        var userInteraction = xChart.chart.infManualExtreme;

        infChart.commandsManager.registerCommand(xChart.id, function (options) {
            if (options.redoExtremes) {
                xChart.setXAxisExtremes(options.redoExtremes.min, options.redoExtremes.max, true, true);
            }
        }, function () {
            xChart.setXAxisExtremes(extremes.min, extremes.max, true, userInteraction, true);
        }, undefined, false, 'onNavigatorScrollStart', {redoExtremes: extremes});

        return proceed.call(this, navigator);
    });

    /**
     * Wrapping up the infChart.StockChart.prototype.onNavigatorScrollStop to catch the navigator scrolling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'onNavigatorScrollStop', function (proceed, navigator) {
        var xChart = this;
        var extremes = $.extend({}, xChart.getRange());
        var lastAction = infChart.commandsManager.getLastAction(xChart.id);

        if (lastAction && lastAction.actionType === 'onNavigatorScrollStart') {
            infChart.commandsManager.updateLastActionOptions(xChart.id, {redoExtremes: extremes});
        }
        return proceed.call(this, navigator);
    });

    /**
     * Wrapping up the setGridType to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'setGridType', function (proceed, type, redraw, isPropertyChange) {
        if (isPropertyChange) {
            var currentType = this.gridType;
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, type, true, false);
                xChart._onPropertyChange("grid");
            }, function () {
                proceed.call(xChart, currentType, true, false);
                xChart._onPropertyChange("grid");
            }, undefined, false, 'setGridType');
        }
        return proceed.call(this, type, redraw, isPropertyChange);
    });

    /**
     * Wrapping up the addCompareSymbol to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'addCompareSymbol', function (proceed, symbol, config, isPropertyChange) {
        if (isPropertyChange) {
            var xChart = this;

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, symbol, config, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "add"});
            }, function () {
                if (!config) {
                    var series = xChart.chart.get(xChart.getCompareSeriesId(symbol));
                    config = {'seriesOptions': xChart._getSeriesProperties(series)}; // to keep the same color config when adding also
                }
                xChart.removeCompareSymbol(symbol, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "remove"});
            }, undefined, false, 'addCompareSymbol');
        }
        return proceed.call(this, symbol, config, isPropertyChange);
    });

    /**
     * Wrapping up the removeCompareSymbol to catch the function and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'removeCompareSymbol', function (proceed, symbol, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var series = xChart.chart.get(xChart.getCompareSeriesId(symbol));
            var config = xChart._getSeriesProperties(series);
            var hasSpread = false;
            if (infChart.indicatorMgr) {
                var indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, "SPREAD");
                hasSpread = !!indicator;
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                proceed.call(xChart, symbol, false);
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "remove"});
            }, function () {
                xChart.addCompareSymbol(symbol, {'seriesOptions': config}, false);
                if (hasSpread) {
                    xChart._toggleSingletonIndicator('SPREAD', true, undefined, true, false, 'spread');
                }
                xChart._onPropertyChange("compareSymbols", {symbol: symbol, action: "add"});
            }, undefined, false, 'removeCompareSymbol');
        }
        return proceed.call(this, symbol, isPropertyChange);
    });

    /**
     * Wrapping up the _toggleSingletonIndicator to catch the function singleton indicator toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_toggleSingletonIndicator', function (proceed, indicatorType, enabled, config, redraw, isPropertyChange, controlName) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var indicator;

            if (infChart.indicatorMgr) {
                indicator = infChart.indicatorMgr.getSingletonIndicator(this.id, indicatorType);
            }
            /**
             * Execute the undo/redo with the new properties
             * @param {boolean} enabledInUndo enabled or not
             */
            function undoRedo(enabledInUndo) {
                if (!enabledInUndo) {
                    indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, indicatorType);
                }
                proceed.call(xChart, indicatorType, enabledInUndo, config, true, false, controlName);
                if (enabledInUndo) {
                    indicator = infChart.indicatorMgr.getSingletonIndicator(xChart.id, indicatorType);
                }
                if (indicator) {
                    xChart._onPropertyChange("indicator", {
                        id: indicator.id,
                        type: indicator.type,
                        action: enabled ? "add" : "remove"
                    });
                }
            }

            infChart.commandsManager.registerCommand(xChart.id, function () {
                undoRedo(enabled);
            }, function () {
                undoRedo(!enabled);
            }, undefined, false, '_toggleSingletonIndicator');
        }
        return proceed.call(this, indicatorType, enabled, config, redraw, isPropertyChange, controlName);
    });

    /**
     * Wrapping up the _toggleNavigator to catch the function  navigator toggling
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_toggleNavigator', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                xChart._onPropertyChange("navigator");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, '_toggleNavigator');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleChartDataMode to catch the function  data mode toggling
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleChartDataMode', function (proceed, type, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                var properties = {isCompare: xChart.isCompare, isLog: xChart.isLog, isPercent: xChart.isPercent};
                var changedProperties = {};
                var isToolbarEnabled = xChart._isToolbarEnabled();

                proceed.call(xChart, type, false);

                if (xChart.isCompare !== properties.isCompare) {
                    changedProperties.isCompare = xChart.isCompare;
                }
                if (xChart.isLog !== properties.isLog) {
                    changedProperties.isLog = xChart.isLog;
                    isToolbarEnabled && infChart.toolbar.setSelectedControls(xChart.id, 'value', xChart.isLog, 'log');
                }
                if (xChart.isPercent !== properties.isPercent) {
                    changedProperties.isPercent = xChart.isPercent;
                    isToolbarEnabled && infChart.toolbar.setSelectedControls(xChart.id, 'value', xChart.isPercent, 'percent');
                }
                xChart._onPropertyChange("mode", changedProperties);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleChartDataMode');
        }
        return proceed.call(this, type, isPropertyChange);
    });

    /**
     * Wrapping up the _toggleNavigator to catch the function  last line toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleLastLine', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "last", xChart.hasLastLine);
                }
                xChart._onPropertyChange("last", xChart.hasLastLine);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleLastLine');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the togglePreviousCloseLine to catch the function  preclose toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'togglePreviousCloseLine', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "preclose", xChart.hasPreviousCloseLine);
                }
                xChart._onPropertyChange("preClose", xChart.hasPreviousCloseLine);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'togglePreviousCloseLine');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleCrosshair to catch the function  crosshair toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleCrosshair', function (proceed, type, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var prevType = xChart.crosshair.type;
            var prevEnabled = xChart.crosshair.enabled;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                if (xChart.crosshair.type != prevType) {
                    var newType = prevType;
                    var newEnabled = prevEnabled;
                    prevType = xChart.crosshair.type;
                    prevEnabled = xChart.crosshair.enabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (xChart.crosshair.enabled !== prevEnabled) {
                    prevType = xChart.crosshair.type;
                    prevEnabled = xChart.crosshair.enabled;
                    proceed.call(xChart, prevType, false);
                }
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "crosshair", xChart.crosshair.type);
                }
                xChart._onPropertyChange("crosshair");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleCrosshair');
        }
        return proceed.call(this, type, isPropertyChange);
    });

    /**
     * Wrapping up the changeDepthSide to catch the function  depth toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'changeDepthSide', function (proceed, side, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;
            var depth = infChart.depthManager.getProperties(xChart.id);
            var undoType = depth.side;
            var undoEnabled = depth.show;
            var redoType = side;
            var redoEnabled = side === depth.side ? !depth.show : true;

            function redo() {
                depth = infChart.depthManager.getProperties(xChart.id);
                if (depth.side != redoType) {
                    var newType = redoType;
                    var newEnabled = redoEnabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (depth.show !== redoEnabled) {
                    proceed.call(xChart, redoType, false);
                }
                depth = infChart.depthManager.getProperties(xChart.id);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "depth", {side: depth.side, show: depth.show});
                }
                xChart._onPropertyChange("depth", depth);
            }

            function undo() {
                depth = infChart.depthManager.getProperties(xChart.id);
                if (depth.side != undoType) {
                    var newType = undoType;
                    var newEnabled = undoEnabled;
                    proceed.call(xChart, newType, false);
                    if (!newEnabled) {
                        proceed.call(xChart, newType, false);// to make it disable
                    }
                } else if (depth.show !== undoEnabled) {
                    proceed.call(xChart, undoType, false);
                }
                depth = infChart.depthManager.getProperties(xChart.id);
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "depth", {side: depth.side, show: depth.show});
                }
                xChart._onPropertyChange("depth", depth);
            }

            infChart.commandsManager.registerCommand(xChart.id, redo, undo, undefined, false, 'changeDepthSide');
        }
        return proceed.call(this, side, isPropertyChange);
    });

    /**
     * Wrapping up the toggleShowMinMax to catch the function  min/max toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleShowMinMax', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                xChart._onPropertyChange("minMax");
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "minMax", xChart.minMax.enabled);
                }
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleShowMinMax');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the toggleToolTip to catch the function  tooltip toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'toggleToolTip', function (proceed, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, false);
                infChart.toolbar.setSelectedControls(xChart.id, "tooltip", xChart.tooltip);
                xChart._onPropertyChange("tooltip");
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, 'toggleToolTip');
        }
        return proceed.call(this, isPropertyChange);
    });

    /**
     * Wrapping up the _togglePanel to catch the function single right toggling and set the cammands(undo/redo) accordingly
     */
    infChart.util.wrap(infChart.StockChart.prototype, '_togglePanel', function (proceed, panel, isPropertyChange) {
        if (isPropertyChange !== false) {
            var xChart = this;

            /**
             * Execute the undo/redo with the new properties
             */
            function undoRedo() {
                proceed.call(xChart, panel, false);
                var isRightPnlOpen = xChart.isRightPanelOpen();
                if (xChart._isToolbarEnabled()) {
                    infChart.toolbar.setSelectedControls(xChart.id, "tooltip", isRightPnlOpen);
                }
                xChart._onPropertyChange("rightPanel", isRightPnlOpen);
            }

            infChart.commandsManager.registerCommand(xChart.id, undoRedo, undoRedo, undefined, false, '_togglePanel');
        }
        return proceed.call(this, panel, isPropertyChange);
    });

    /**
     * Wrapping up the destroy to catch the chart destroy function to remove key bindings
     */
    infChart.util.wrap(infChart.StockChart.prototype, 'destroy', function (proceed, avoidDestroyCommands) {
        if (!avoidDestroyCommands) {
            infChart.commandsManager.destroyCommands(this.id);
        }
        
        return proceed.call(this);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleLastPriceLabel', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleLastPriceLabel');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleLastPriceLine', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleLastPriceLine');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    /**
     * Wrapping up the infChart.manager.toggleLastPriceLabel to check the toggle of price label
     */
    infChart.util.wrap(infChart.manager, 'toggleBarClosureTime', function (proceed, chartId, isPropertyChange) {
        if (isPropertyChange) {
            let iChart = infChart.manager.getChart(chartId);

            /**
             * Execute the undo/redo with the new properties
             * @param {string} newType new chart type
             */
            function undoRedo(chartId) {
                proceed.call(this, chartId, true);
            }

            infChart.commandsManager.registerCommand(iChart.id, function () {
                undoRedo(chartId);
            }, function () {
                undoRedo(chartId);
            }, undefined, false, 'toggleBarClosureTime');
        }
        return proceed.call(this, chartId, isPropertyChange);
    });

    //endregion=====================end of Stock Chart Wrappers=========================================================
})(jQuery, infChart);