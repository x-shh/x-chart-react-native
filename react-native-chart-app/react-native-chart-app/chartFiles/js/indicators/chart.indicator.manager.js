var infChart = window.infChart || {};

infChart.indicatorMgr = (function (infChart, H) {

    var _indicators = {},
        _frameHeights = {},
        _listeners = {},
        _parallelToBaseAxes = {},//axes which are parallel to base axis from indicators
        _indicatorsDissimilerToBaseAxes = {},//axes which are not parallel to base axis;
        _sessionTimeBreakIndicators = {};

    /**
     * Create an indicator for the given params of the given chart
     * @param {string} chartId - chart id which indicator is included
     * @param {string} type - indicator type
     * @param {object} config - indicator options if nedded
     * @param (string} indicatorId - specific id to set if needed
     * @param {number|undefined} index - specific place to position the indicator if needed (used in _indicatorsDissimilerToBaseAxes)
     * @returns {infChart.Indicator} indicator object
     * @private
     */
    var _createIndicator = function (chartId, type, config, indicatorId, index) {
        var id = indicatorId || "IND" + infChart.util.generateUUID(), chart = infChart.manager.getChart(chartId).chart;
        var indicator;

        if (_isSingletonIndicator(type)) {
            indicator = _getSingletonIndicator(chartId, type);
        }

        if (!indicator) {
            switch (type) {
                case 'BB':
                    indicator = new infChart.BolingerBandIndicator(id, chartId, type, chart);
                    break;
                case 'BC':
                    indicator = new infChart.BenchmarkChartIndicator(id, chartId, type, chart);
                    break;
                case 'CCI':
                    indicator = new infChart.CommodityChannelIndexIndicator(id, chartId, type, chart);
                    break;
                case 'MACD':
                    indicator = new infChart.MACDIndicator(id, chartId, type, chart);
                    break;
                case 'ADL':
                    indicator = new infChart.AccumulationDistLineIndicator(id, chartId, type, chart);
                    break;
                case 'MOM':
                    indicator = new infChart.MomentumIndicator(id, chartId, type, chart);
                    break;
                case 'EMA':
                    indicator = new infChart.EMAIndicator(id, chartId, type, chart);
                    break;
                case 'RSI':
                    indicator = new infChart.RSIIndicator(id, chartId, type, chart);
                    break;
                case 'AR':
                    indicator = new infChart.AroonIndicator(id, chartId, type, chart);
                    break;
                case 'ADX':
                    indicator = new infChart.AverageDirectionIndexIndicator(id, chartId, type, chart);
                    break;
                case 'ATR':
                    indicator = new infChart.AverageTrueRangeIndicator(id, chartId, type, chart);
                    break;
                case 'DMS':
                    indicator = new infChart.DirectionalMovementIndicator(id, chartId, type, chart);
                    break;
                case 'DMI':
                    indicator = new infChart.DirectionalMovementIndexIndicator(id, chartId, type, chart);
                    break;
                case 'OBV':
                    indicator = new infChart.OnBalanceVolumeIndicator(id, chartId, type, chart);
                    break;
                case 'ROC':
                    indicator = new infChart.RateOfChangeIndicator(id, chartId, type, chart);
                    break;
                case 'SMA':
                    indicator = new infChart.SimpleMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'UO':
                    indicator = new infChart.UltimateOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'WPR':
                    indicator = new infChart.WilliamsPRIndicator(id, chartId, type, chart);
                    break;
                case 'MFI':
                    indicator = new infChart.MoneyFlowIndexIndicator(id, chartId, type, chart);
                    break;
                case 'CHO':
                    indicator = new infChart.ChaikinOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'STOF':
                    indicator = new infChart.FastStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'STOS':
                    indicator = new infChart.SlowStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'ARUD':
                    indicator = new infChart.AROONUpDownIndicator(id, chartId, type, chart);
                    break;
                case 'HV':
                    indicator = new infChart.HistoricalVolatilityIndicator(id, chartId, type, chart);
                    break;
                case 'VOLUME':
                    indicator = new infChart.VolumeIndicator(id, chartId, type, chart);
                    break;
                case 'VOLUME_PNL':
                    indicator = new infChart.VolumeInPanelIndicator(id, chartId, type, chart);
                    break;
                case 'WMA':
                    indicator = new infChart.WeightedMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'SAR':
                    indicator = new infChart.SARIndicator(id, chartId, type, chart);
                    break;
                case 'MACDF':
                    indicator = new infChart.MACDFIndicator(id, chartId, type, chart);
                    break;
                case 'StdDev':
                    indicator = new infChart.StandardDeviationIndicator(id, chartId, type, chart);
                    break;
                case 'DMIP':
                    indicator = new infChart.DirectionalMovementPlusIndicator(id, chartId, type, chart);
                    break;
                case 'DMIM':
                    indicator = new infChart.DirectionalMovementMinusIndicator(id, chartId, type, chart);
                    break;
                case 'BBW':
                    indicator = new infChart.BollingerBandWidthIndicator(id, chartId, type, chart);
                    break;
                case 'TrueR':
                    indicator = new infChart.TrueRangeIndicator(id, chartId, type, chart);
                    break;
                case 'HighestH':
                    indicator = new infChart.HighestHighIndicator(id, chartId, type, chart);
                    break;
                case 'LowestL':
                    indicator = new infChart.LowestLowIndicator(id, chartId, type, chart);
                    break;
                case 'VMA':
                    indicator = new infChart.VolumeMovingAverageIndicator(id, chartId, type, chart);
                    break;
                case 'SRSI':
                    indicator = new infChart.SRSIIndicator(id, chartId, type, chart);
                    break;
                case 'ICHI':
                    indicator = new infChart.IchimokuKinkoHyoIndicator(id, chartId, type, chart);
                    break;
                case 'TRIX':
                    indicator = new infChart.TRIXIndicator(id, chartId, type, chart);
                    break;
                case 'MovTrip':
                    indicator = new infChart.MovTripIndicator(id, chartId, type, chart);
                    break;
                case 'MOVR':
                    indicator = new infChart.MOVRIndicator(id, chartId, type, chart);
                    break;
                case 'TRIMA':
                    indicator = new infChart.TRIMAIndicator(id, chartId, type, chart);
                    break;
                case 'FUSTO':
                    indicator = new infChart.FullStochasticOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'RSIC':
                    indicator = new infChart.RSICIndicator(id, chartId, type, chart);
                    break;
                case 'CMF':
                    indicator = new infChart.ChaikinMoneyFlowIndicator(id, chartId, type, chart);
                    break;
                case 'NVI':
                    indicator = new infChart.NegativeVolumeIndexIndicator(id, chartId, type, chart);
                    break;
                case 'PVI':
                    indicator = new infChart.PositiveVolumeIndexIndicator(id, chartId, type, chart);
                    break;
                case 'VHF':
                    indicator = new infChart.VerticalHorizontalFilterIndicator(id, chartId, type, chart);
                    break;
                case 'ENV':
                    indicator = new infChart.EnvelopesIndicator(id, chartId, type, chart);
                    break;
                case 'SM':
                    indicator = new infChart.StochasticMomentumIndicator(id, chartId, type, chart);
                    break;
                case 'GMMA':
                    indicator = new infChart.GMMAIndicator(id, chartId, type, chart);
                    break;
                case 'GMMAOsci':
                    indicator = new infChart.GMMAOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'MomMA':
                    indicator = new infChart.MovingAverageMomentumIndicator(id, chartId, type, chart);
                    break;
                case 'AwesomeOsci':
                    indicator = new infChart.AwesomeOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'CoppockCurve':
                    indicator = new infChart.CoppockCurveIndicator(id, chartId, type, chart);
                    break;
                case 'KST':
                    indicator = new infChart.KnowSureThingIndicator(id, chartId, type, chart);
                    break;
                case 'TSI':
                    indicator = new infChart.TrueStrengthIndexIndicator(id, chartId, type, chart);
                    break;
                case 'VI':
                    indicator = new infChart.VortexIndicator(id, chartId, type, chart);
                    break;
                case 'MED':
                    indicator = new infChart.MedianPriceIndicator(id, chartId, type, chart);
                    break;
                case 'MASS':
                    indicator = new infChart.MassIndexIndicator(id, chartId, type, chart);
                    break;
                case 'CMA':
                    indicator = new infChart.MovingAverageCenteredIndicator(id, chartId, type, chart);
                    break;
                case 'ADOsci':
                    indicator = new infChart.AccelerationDecelerationOscillatorIndicator(id, chartId, type, chart);
                    break;
                case 'EWO':
                    indicator = new infChart.ElliotWaveOscillator(id, chartId, type, chart);
                    break;
                case 'BA':
                    indicator = new infChart.BidAskIndicator(id, chartId, type, chart);
                    break;
                case 'RSL':
                    indicator = new infChart.RelativeStrengthLevy(id, chartId, type, chart);
                    break;
                case 'MACDCrossSignal':
                    indicator = new infChart.MACDCrossSignal(id, chartId, type, chart);
                    break;
                case 'MACDCrossOverZeroSignal':
                    indicator = new infChart.MACDCrossOverZeroSignal(id, chartId, type, chart);
                    break;
                case 'KELT':
                    indicator = new infChart.KeltnerIndicator(id, chartId, type, chart);
                    break;
                case 'BearEng':
                    indicator = new infChart.BearishEngulfingIndicator(id, chartId, type, chart);
                    break;
                case 'BullishEng':
                    indicator = new infChart.BullishEngulfingIndicator(id, chartId, type, chart);
                    break;
                //case 'DarkC' :
                //    indicator = new infChart.DarkCloudIndicator(id, chartId, type, config);
                //    break;
                case 'HLRegChannel':
                    indicator = new infChart.HighLowRegressionChannelIndicator(id, chartId, type, chart);
                    break;
                case 'BAH':
                    indicator = new infChart.BidAskHistoryIndicator(id, chartId, type, chart);
                    break;
                case 'SPREAD':
                    indicator = new infChart.SpreadIndicator(id, chartId, type, chart);
                    break;
                case 'CWI':
                    indicator = new infChart.CustomWeightIndexIndicator(id, chartId, type, chart);
                    break;
                case 'HarmonicPtn':
                    indicator = new infChart.HarmonicPatternIndicator(id, chartId, type, chart);
                    break;
                case 'Mondays':
                    indicator = new infChart.MondaysIndicator(id, chartId, type, chart);
                    break;
                case 'ZigZag':
                    indicator = new infChart.ZigZagIndicator(id, chartId, type, chart);
                    break;
                case 'SessionTimeBreaks':
                    var breakType = config.break || config.series[0].infIndSubType;
                    indicator = new infChart.SessionTimeBreaksIndicator(id, chartId, type, chart, {break: breakType});

                    if (!_sessionTimeBreakIndicators[chartId]) {
                        _sessionTimeBreakIndicators[chartId] = {};
                    }

                    _sessionTimeBreakIndicators[chartId][breakType] = indicator;

                    break;
                case 'BREAKOUT':
                    indicator = new infChart.BreakoutFinder(id, chartId, type, chart);
                    break;
                default:
                    break;

            }

            _indicators[chartId].lastIndex++;
            _indicators[chartId].count++;
            _indicators[chartId].items[id] = indicator;

            if (config) {
                if (config.series) {
                    indicator.series.forEach(function(series){
                        var configSeries = config.series.find(function(s){
                            if(series.options){
                                return series.options.infIndSubType == s.infIndSubType;
                            }
                        })
                        if(configSeries && series.color && !("color" in configSeries)){
                            configSeries.color = series.color;
                        }
                        if(configSeries && series.options.negativeColor && !("negativeColor" in configSeries)){
                            configSeries.negativeColor = series.options.negativeColor;
                        }
                        if(configSeries && series.lineColor && !("lineColor" in configSeries)){
                            configSeries.lineColor = series.lineColor;
                        }
                        if(configSeries && series.fillColor && !("fillColor" in configSeries)){
                            configSeries.fillColor = series.fillColor;
                        }
                    });
                }
                indicator.setProperties(config, false);
            }

            if (indicator._isAxisParallelToBase()) {
                _parallelToBaseAxes[chartId].xPush(indicator.getAxisId());
            } else if (indicator._isAxisDissimilerToBase()) {
                var currentIndicators = _indicatorsDissimilerToBaseAxes[chartId];
                if (index != undefined && currentIndicators.length > index) {
                    _indicatorsDissimilerToBaseAxes[chartId].splice(index, 0, id);
                } else {
                    _indicatorsDissimilerToBaseAxes[chartId].xPush(id);
                }
            }
        }
        return indicator;
    };

    /**
     * @param {string} drawingId
     * @param {object} chartObj
     * @param {string} shapeId
     * @param {object} drawingSettingsContainer - chart container
     * @returns drawing object
     */
    var _createIndicatorDrawing = function (chartObj, drawingSettingsContainer, drawingProperties) {

        var drawing;
        if (drawingProperties) {
            var drawingId = drawingProperties.drawingId;
            var shapeId = drawingProperties.shape;
        }
        if (!drawingId) {
            drawingId = infChart.util.generateUUID();
        }

        switch (shapeId) {
            case 'highLowRegressionChannel':
                drawing = new infChart.highLowRegressionChannelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'harmonicPattern':
                drawing = new infChart.harmonicPatternDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'horizontalRay':
                drawing = new infChart.horizontalRayDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'rectangle':
                drawing = new infChart.rectangleDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'upArrowHead':
            case 'downArrowHead':
                drawing = new infChart.arrowHeadDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
        }
        return infChart.drawingsManager.drawDrawingFromProperties(drawing, chartObj, drawingSettingsContainer, drawingProperties, drawing.drawingId);
    };

    var _addEventListeners = function (chartId) {
        _listeners[chartId] = [];

        var chartInstance = infChart.manager.getChart(chartId);

        _listeners[chartId].push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function (newSymbol, previousSymbol, config) {
                if (config.setProperties) {
                    _removeAllIndicators(chartId);
                } else {
                    _resetIndicators(chartId);
                }
            })
        });

        _listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function (data) {
                //todo : wtf
            })
        });

        //_listeners[chartId].push({
        //    method: 'destroy',
        //    id: chartInstance.registerForEvents('destroy', function () {
        //        _destroy(chartId);
        //    })
        //});

        _listeners[chartId].push({
            method: 'resize',
            id: chartInstance.registerForEvents('resize', function () {
                var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId);
                if (indicatorsDissimilarToBaseAxes.length > 0) {
                    _setIndicatorFrames(chartId, chartInstance.chart);
                }
            })
        });

        _listeners[chartId].push({
            method: 'afterXSetExtremes',
            id: chartInstance.registerForEvents('afterXSetExtremes', function (extremes) {
                chartInstance._recalculateDynamicIndicators(false, undefined, ["compare", "base"], extremes);
            })
        });

        _listeners[chartId].push({
            method: 'onBeforePropertyChange',
            id: chartInstance.registerForEvents('onBeforePropertyChange', function (property) {
                switch (property) {
                    case 'period':
                        _resetIndicators(chartId);
                        break;
                    default :
                        break;
                }
            })
        });
    };

    var _removeEventListeners = function (chartId) {
        var chartInstance = infChart.manager.getChart(chartId);

        _listeners[chartId].forEach(function (val) {
            chartInstance.removeRegisteredEvent(val.method, val.id);
        });

        delete _listeners[chartId];
    };

    var _removeIndicator = function (chartId, indicatorId) {
        var indicator = _getIndicatorById(chartId, indicatorId);
        var si = indicator.series.length - 1;
        for (si; si > 0; si--) {//doing this backwards as we splice the series array - https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
            var s = indicator.series[si];
            if (s && s.options.id !== indicator.id) {
                _removeIndicatorSeries(chartId, s.options.id, false, s);
            }
        }
        if (indicator.series.length > 0) {
            _removeIndicatorSeries(chartId, indicator.id, false, indicator.series[0]);
        }
    };

    /**
     * to removing an idicator series
     * @param {string} chartId chartId
     * @param {string} seriesId seriesId to be removed
     * @param {boolean} isPropertyChange isPropertyChange
     * @param {object} series series
     * @returns {infChart.Indicator} indicator
     * @private
     */
    var _removeIndicatorSeries = function (chartId, seriesId, isPropertyChange, series) {

        var mainIndicatorId = seriesId.split("_")[0],
            ind = _indicators[chartId].items[mainIndicatorId],
            isParallelToBase = ind._isAxisParallelToBase(),
            isDissimilerToBase = ind._isAxisDissimilerToBase();

        if (series && series.options && infChart.util.isLegendAvailable(series.options)) {
           infChart.structureManager.legend.removeLegendItem(chartId, seriesId, 'indicator');
        }

        ind.removeSeries(seriesId, isPropertyChange)

        if (ind.series.length === 0) {

            _indicators[chartId].count--;
            delete _indicators[chartId].items[mainIndicatorId];

            if (isParallelToBase) {

                var pIndex = _parallelToBaseAxes[chartId].indexOf(ind.getAxisId());
                if (pIndex >= 0) {
                    _parallelToBaseAxes[chartId].splice(pIndex, 1);
                }

            } else if (isDissimilerToBase) {

                var index = _indicatorsDissimilerToBaseAxes[chartId].indexOf(mainIndicatorId);
                if (index >= 0) {
                    _indicatorsDissimilerToBaseAxes[chartId].splice(index, 1);
                    //_setIndicatorFrames(chartId, ind.chart);
                }
            }
        }

        return ind;
    };

    var _getIndicatorCount = function (chartId) {
        return _indicators[chartId] ? _indicators[chartId].count : 0;
    };

    /**
     * get not singleton indicator count
     * @param {string} chartId - chart id
     * @returns {number} - not singleton indicator count
     */
    var _getNotSingletonIndicatorCount = function (chartId) {
        var indicatorCount = 0;
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (i, ind) {
                if (!_isSingletonIndicator(ind.type)) {
                    indicatorCount++;
                }
            });
        }
        return indicatorCount;
    };

    var _getIndicators = function (chartId) {
        var indicators = [];
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (i, ind) {
                indicators.xPush(ind);
            });
        }
        return indicators;
    };

    var _getIndicatorBySeriesId = function (chartId, seriesId) {
        var indicator;
        if (chartId && seriesId) {
            var mainIndicatorId = seriesId.split("_")[0];
            indicator = _getIndicatorById(chartId, mainIndicatorId);
        }
        return indicator;
    };

    var _isBlockFromMainSeriesUpdateIndicator = function(indicator){
        return indicator && indicator.blockUpdateForMainSymbol;
    };

    var _getIndicatorById = function (chartId, indicatorId) {
        var indicator;
        if (chartId && indicatorId) {
            indicator = _indicators[chartId].items[indicatorId];
        }
        return indicator;
    };

    var _resetIndicators = function (chartId) {
        var hasInd = false;
        if (_indicators[chartId]) {
            infChart.util.forEach(_indicators[chartId].items, function (key, indicator) {
                if (indicator.series.length > 0) {
                    hasInd = true;
                    infChart.util.forEach(indicator.series, function (i, series) {
                        series.setData([], false, false, false);
                    });
                }
            });
        }
        return hasInd;
    };

    var _getSettingsContainer = function (chartId, containerName) {
        return infChart.structureManager.getContainer(infChart.manager.getChart(chartId).getContainer(), containerName ? containerName : "indicator");
    };

    var _destroy = function (chartId) {
        var settingsContainer = $(_getSettingsContainer(chartId));
        settingsContainer.html('');
        _removeAllIndicators(chartId);
        //_removeEventListeners(chartId);
        delete _parallelToBaseAxes[chartId];
        delete _indicatorsDissimilerToBaseAxes[chartId];
        delete _frameHeights[chartId];
        delete _indicators[chartId];
    };

    var _initialize = function (chartId, options) {
        if (!_indicators[chartId]) {
            _indicators[chartId] = {
                'count': 0,
                'lastIndex': 0,
                'items': {},
                'options': options
            };
            _parallelToBaseAxes[chartId] = [];
            _indicatorsDissimilerToBaseAxes[chartId] = [];
            _frameHeights[chartId] = 0;
            //_addEventListeners(chartId);
        } else {
            infChart.util.console.error('indicator manager already initialized for chart => ' + chartId);
        }
    };

    var _isLegendEnabled = function (series) {
        return (series.options.showInLegend == undefined || series.options.showInLegend || !series.options.hideLegend);
    };

    var _getLabel = function (series, isLegend) {
        var subtype = (isLegend && series.options.legendKey) ? series.options.legendKey : series.options.infIndSubType;
        return infChart.manager.getLabel("label.indicatorDesc." + subtype);
    };

    var _getParallelToBaseAxes = function (chartId) {
        return _parallelToBaseAxes[chartId];
    };

    var _isParallelToBaseAxes = function (chartId, indicator) {
        return indicator && _parallelToBaseAxes[chartId].indexOf(indicator.getAxisId()) > -1;
    };

    var _getIndicatorsDissimilarToBaseAxes = function (chartId) {
        return _indicatorsDissimilerToBaseAxes.hasOwnProperty(chartId) ? _indicatorsDissimilerToBaseAxes[chartId] : [];
    };

    var _indicatorLegendClick = function (chartId, seriesId) {
        var indicator = _getIndicatorBySeriesId(chartId, seriesId);
        if (indicator) {
            indicator.loadSettingWindow(false);
        }
    };

    var _isSeriesInBidAskHistory = function (series) {
        return series.options.infType === 'indicator' && series.options.infIndType === 'BAH';
    };

    var _getAllIndicatorProperties = function (chartId) {
        var indicators = [];
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId)) {
                    var indicator = _indicators[chartId].items[indicatorId];
                    if (!_isSingletonIndicator(indicator.type)) {
                        indicators.push(indicator.getProperties());
                    }
                }
            }
        }
        return indicators;
    };

    var _onNewIndicators = function (chartId, indicatorProperties, isVolume, isBidAsk, isSpread) {
        _removeAllIndicators(chartId);
        if (indicatorProperties && indicatorProperties.length > 0) {
            indicatorProperties.forEach(function (indicator) {
                _createIndicator(chartId, indicator.type, indicator);
            });
        }
        if (isVolume) {
            _createIndicator(chartId, 'VOLUME');
        }
        if (isBidAsk) {
            _createIndicator(chartId, 'BAH');
        }
        if (isSpread) {
            _createIndicator(chartId, 'SPREAD');
        }
    };

    var _removeAllIndicators = function (chartId, ignoreIndicatorTypes) {
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId) && !_hasIgnoreIndicatorTypes(_indicators[chartId].items[indicatorId].type, ignoreIndicatorTypes)) {
                    _removeIndicator(chartId, indicatorId);
                }
            }
        }
    };

    var _hasIgnoreIndicatorTypes = function (indicatorType, ignoreIndicatorTypes) {
        return ignoreIndicatorTypes && ignoreIndicatorTypes.indexOf(indicatorType) > -1;
    };

    var _getIndicatorTooltipValue = function (chartId, point, grpVolIdx) {
        var tooltipData, indicator = _getIndicatorBySeriesId(chartId, point.series.options.id);
        if (indicator) {
            if (grpVolIdx) {
                tooltipData = indicator.getTooltipValueByBaseRow(point, point.series.options.data[grpVolIdx], grpVolIdx);
            } else {
                tooltipData = indicator.getTooltipValue(point);
            }
        }

        return tooltipData;
    };

    var _updateSeriesTooltip = function (chartId, seriesId, x) {
        _getIndicatorBySeriesId(chartId, seriesId).updateToolTip(seriesId, x);
    };

    var _getLegendTitle = function (chartId, series) {
        var title, indicator = _getIndicatorBySeriesId(chartId, series.options.id);
        if (indicator)
            title = indicator.getTitle(series.options.id, true);
        else {
            title = _getLabel(series, true);
        }
        return title;
    };

    var _dragIndicatorFrameToResize = function (chartId, indicator, event) {
        var xChart = infChart.manager.getChart(chartId);
        //todo : check why this is done
        xChart.crosshairType = (!xChart.resizing) ? xChart.crosshair.enabled : xChart.crosshairType;
        xChart.crosshairType = xChart.crosshair.enabled;
        xChart.crosshair.enabled = false;
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            resizeHandlerHeight = H.theme.resizeHandler ? H.theme.resizeHandler.height : 4;

        if (event.offsetY > 20) {
            var currentY = yAxis.top - resizeHandlerHeight;
            var targetY = event.offsetY;

            var prevInd = _getPreviousIndicator(chartId, indicator.id), prevIndAxis;
            if (prevInd) {
                prevIndAxis = chart.get(prevInd.getAxisId());
            } else {
                prevIndAxis = chart.get('#0');//todo : need to use chart core method
            }

            if (currentY > targetY) {
                var maxY = prevIndAxis.top + 10;
                if ((maxY) > targetY) {
                    targetY = maxY;
                }
            } else {
                var minY = yAxis.top + yAxis.height - resizeHandlerHeight - 10;
                if (minY < targetY) {
                    targetY = minY
                }
            }

            var newHeight = yAxis.height + resizeHandlerHeight + (currentY - targetY);

            indicator.heightPercent = (newHeight / _frameHeights[chartId].indicatorFrameHeight) * 100;

            var prevIndNewHeight = prevIndAxis.height - (currentY - targetY);
            var newAxisHeight = yAxis.height + (currentY - targetY);

            if (newHeight > 0 && prevIndNewHeight > 0 && newAxisHeight > 0) {

                var yAxisTop = yAxis.top - (currentY - targetY);
                yAxis.update({
                    top: yAxisTop, // 20 - indicator title height, 4- indicator resize handler
                    height: newAxisHeight
                }, false);

                if (prevInd) {
                    prevIndAxis.update({
                        height: prevIndNewHeight
                    }, true);
                    var prevInHeight = prevIndAxis.height + resizeHandlerHeight - (currentY - targetY);
                    prevInd.heightPercent = (prevInHeight / _frameHeights[chartId].indicatorFrameHeight) * 100;
                } else {
                    var parallelToBaseAxes = _getParallelToBaseAxes(chartId);
                    for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {
                        var parallelAxis = chart.get(parallelToBaseAxes[i]),
                            parallelAxisHeight = prevIndNewHeight * (parallelAxis.options.infHeightPercent || 0.3),
                            topCorr = 1,
                            parallelAxisTop = (chart.yAxis[0].top || 0) + prevIndNewHeight - parallelAxisHeight - topCorr;
                        //todo :: get yAxis from stockChart
                        chart.get(parallelToBaseAxes[i]).update({
                            top: parallelAxisTop,
                            //bottom: mainHeight,
                            height: parallelAxisHeight
                        }, false);
                    }
                    infChart.manager.resizeMainYAxis(chartId, prevIndNewHeight);
                }

                _updateResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, yAxis.left, yAxisTop, 20, true);
            } else {
                infChart.util.console.log("newHeight:" + newHeight + " prevIndNewHeight:" + prevIndNewHeight + " newAxisHeight:" + newAxisHeight);
            }
        }
    };

    var _dragStopIndicatorFrameOnResize = function (chartId, indicator) {
        var xChart = infChart.manager.getChart(chartId);
        //todo : check why this is done
        xChart.crosshair.enabled = this.crosshairType;
        //todo : check why this is done
        setTimeout(function () {
            var prevInd = _getPreviousIndicator(chartId, indicator.id), i, len;
            //isBaseResized = false;
            if (prevInd) {
                for (i = 0, len = prevInd.series.length; i < len; i++) {
                    prevInd.series[i].update({}, false);
                }
                //} else {
                //    isBaseResized = true;
            }

            for (i = 0, len = indicator.series.length - 1; i < len; i++) {
                indicator.series[i].update({}, false);
            }

            indicator.series[len].update({}, true);

            //if (isBaseResized) {
            //    xChart.onBaseAxisResize();
            //}
        }, 1);
    };

    var _updateResizeHandlers = function (chartId, indicator) {
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            x = yAxis.left,
            y = yAxis.top;
        var resizeHandlerHeight = H.theme.resizeHandler ? H.theme.resizeHandler.height : 4;

        chart.axisTitles[axis + '_resize'].attr({
            x: x,
            y: y - resizeHandlerHeight,
            width: chart.plotWidth,
            zIndex: 20
        });

        var resizeHandleY = y - resizeHandlerHeight / 2 + 2;

        chart.axisTitles[axis + '_resizeH'].attr({
            x: chart.plotWidth / 2,
            y: (resizeHandleY == y) ? y + 2 : resizeHandleY,
            width: chart.plotWidth,
            zIndex: 21
        });
    };

    var _addResizeHandlers = function (chartId, indicator) {
        var chart = indicator.chart,
            axis = indicator.getAxisId(),
            yAxis = chart.get(axis),
            x = yAxis.left,
            y = yAxis.top;

        var resizeHandlerTheme = H.theme.resizeHandler ? H.theme.resizeHandler : {
            backgroundColor: '#383E4C',
            color: '#9C9C9C',
            height: 4
        };

        if (!chart.axisTitles) {
            chart.axisTitles = {};
        }

        chart.axisTitles[axis + '_resize'] = chart.renderer.rect(x, y - resizeHandlerTheme.height, chart.plotWidth, resizeHandlerTheme.height, 0).attr({
            fill: resizeHandlerTheme.backgroundColor,
            cursor: "row-resize"
        }).add();

        chart.axisTitles[axis + '_resizeH'] = chart.renderer.text('=', chart.plotWidth / 2, y - resizeHandlerTheme.height).attr({
            fill: resizeHandlerTheme.color,
            cursor: "row-resize"
        }).add();

        // bind events for both handler and bar
        infChart.util.bindDragEvents(chart.axisTitles[axis + '_resize'], function (event) {
            _dragIndicatorFrameToResize(chartId, indicator, event);
        }, function () {
            _dragStopIndicatorFrameOnResize(chartId, indicator);
        });

        infChart.util.bindDragEvents(chart.axisTitles[axis + '_resizeH'], function (event) {
            _dragIndicatorFrameToResize(chartId, indicator, event);
        }, function () {
            _dragStopIndicatorFrameOnResize(chartId, indicator);
        });
    };

    var _setIndicatorFrames = function (chartId, chart, currentIndicatorId) {
        var height = chart.plotHeight,
            indicatorHeight,
            mainHeight,
            defaultIndHPercent = 15,
            maxIndicatorPercent = 70,
            resizeHandlerHeight = H.theme && H.theme.resizeHandler.height || 4;

        var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId),
            indicatorsCount = indicatorsDissimilarToBaseAxes.length, heightPercent = 0;

        if (indicatorsCount > 0) {
            infChart.util.forEach(indicatorsDissimilarToBaseAxes, function (i, indicatorId) {
                var indicator = _getIndicatorById(chartId, indicatorId);
                if (indicator.heightPercent) {
                    heightPercent += (indicator.heightPercent - 100);
                }
            });

            var tempHeightPercent = (heightPercent > defaultIndHPercent / 2) ? defaultIndHPercent / 2 : defaultIndHPercent - indicatorsCount;
            tempHeightPercent = (tempHeightPercent * indicatorsCount > maxIndicatorPercent) ? maxIndicatorPercent / indicatorsCount : tempHeightPercent;

            indicatorHeight = tempHeightPercent * height / 100;

            _frameHeights[chartId] = indicatorHeight;
            mainHeight = height - indicatorHeight * (indicatorsCount - heightPercent / 100);// - (indicatorsCount > 0 ? 20 : 0);
            var heightTotal = 0;

            infChart.util.forEach(indicatorsDissimilarToBaseAxes, function (i, indicatorId) {
                var indicator = _getIndicatorById(chartId, indicatorId), indicatorYAxis = chart.get(indicator.getAxisId());
                var actualIndHeight = (indicator.heightPercent) ? indicatorHeight * indicator.heightPercent / 100 : indicatorHeight;
                if (indicatorYAxis) {
                    indicatorYAxis.update({
                        top: mainHeight + resizeHandlerHeight + heightTotal + chart.margin[0], // 20 - indicator title height, 4- indicator resize handler
                        height: actualIndHeight - resizeHandlerHeight
                    }, false);
                    heightTotal += actualIndHeight;
                }
            });

            var parallelToBaseAxes = _getParallelToBaseAxes(chartId);
            for (var i = 0, iLen = parallelToBaseAxes.length; i < iLen; i++) {
                var parallelAxis = chart.get(parallelToBaseAxes[i]),
                    parallelAxisHeight = mainHeight * (parallelAxis.options.infHeightPercent || 0.3),
                    topCorr = 1,
                    parallelAxisTop = (chart.yAxis[0].top || 0) + mainHeight - parallelAxisHeight - topCorr;
                //todo :: get yAxis from stockChart
                chart.get(parallelToBaseAxes[i]).update({
                    top: parallelAxisTop,
                    //bottom: mainHeight,
                    height: parallelAxisHeight
                }, false);
            }
        } else {
            mainHeight = height;
        }

        infChart.manager.resizeMainYAxis(chartId, mainHeight);

        indicatorsDissimilarToBaseAxes.forEach(function (indicatorId) {
            var indicator = _getIndicatorById(chartId, indicatorId),
                axis = indicator.getAxisId(),
                yAxis = chart.get(axis),
                x = yAxis.left,
                y = yAxis.top;
            if (currentIndicatorId && currentIndicatorId === indicatorId) {
                _addResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, x, y, 20, false);
            } else {
                _updateResizeHandlers(chartId, indicator);
                indicator.setTitle(axis, x, y, 20, true);
            }
        });

    };

    var _getPreviousIndicator = function (chartId, indicatorId) {
        var indicatorsDissimilarToBaseAxes = _getIndicatorsDissimilarToBaseAxes(chartId);
        var idx = indicatorsDissimilarToBaseAxes.indexOf(indicatorId);
        var previousInd;
        if (idx > 0) {
            previousInd = _getIndicatorById(chartId, indicatorsDissimilarToBaseAxes[idx - 1]);
        }
        return previousInd;
    };

    var _isSingletonIndicator = function (type) {
        var singleton = false;
        switch (type) {
            case 'VOLUME':
            case 'VOLUME_PNL':
            case 'BAH':
            case 'SPREAD':
                singleton = true;
                break;
            default:
                break;
        }
        return singleton;
    };

    var _getSingletonIndicator = function (chartId, type) {
        var indicator = undefined;
        if (_indicators[chartId]) {
            for (var indicatorId in _indicators[chartId].items) {
                if (_indicators[chartId].items.hasOwnProperty(indicatorId)) {
                    if (_indicators[chartId].items[indicatorId].type === type) {
                        indicator = _indicators[chartId].items[indicatorId];
                    }
                }
            }
        }
        return indicator;
    };

    var _isBidAskEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'BAH') !== 'undefined';
    };

    var _isVolumeEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'VOLUME') !== 'undefined';
    };

    var _isSpreadEnabled = function (chartId) {
        return typeof _getSingletonIndicator(chartId, 'SPREAD') !== 'undefined';
    };

    /**
     * check max indicator count reached
     * @param {string} chartId - chart id
     * @param {number} maxCount - max indicator count 
     * @param {string} type - new indicator type
     * @returns {boolean} - is max count reached
     */
    var _hasMaxIndicatorCountReached = function (chartId, maxCount, type) {
        var indicatorCount, maxReached = false;
        if (!_isSingletonIndicator(type)) {
            indicatorCount = _getNotSingletonIndicatorCount(chartId);
            maxReached = indicatorCount >= maxCount;
        }
        return maxReached;
    };

    /**
     * Returns true if close btn is enabled for the indicators in the chart
     * (To be used in mobile chart in dxOne)
     * @param chartId
     * @returns {*|boolean}
     * @private
     */
    var _isCloseBtnEnabled = function (chartId) {
        var indicatorObj = _indicators[chartId];
        return indicatorObj && (!indicatorObj.options || (indicatorObj.options && indicatorObj.options.showCloseBtn != false ));
    };

    /**
     * Returns true if params of the indicator enabled in the legend
     * (To be used in mobile chart in dxOne)
     * @param chartId
     * @returns {*|boolean}
     * @private
     */
    var _isParamsInLegendEnabled = function (chartId) {
        var indicatorObj = _indicators[chartId];
        return indicatorObj && (!indicatorObj.options || (indicatorObj.options && indicatorObj.options.showParamsInLegend != false ));
    };

    /**
     * Returns the calculated gap between two ticks
     * @param {StockChart.id} chartId - stock chart id
     * @param {Highcharts.Axis} axis - the axis seeking for gaps
     * @returns {{avgGaps: number, calculatedGap: number}} details of the gaps
     * @private
     */
    var _getYGap = function (chartId, axis) {
        var yMin = axis.min || axis.dataMin,
            yMax = axis.max || axis.dataMax;

        if (!isNaN(yMin) && !isNaN(yMax) && yMin != null && yMax != null) {
            var plotHeight = axis.height,
                avgGaps = 2,
                calculatedGap = 0,
                maxGap = 80,
                initialAvgGapsCount = 5,
                initialAvgGap = Math.round(plotHeight / initialAvgGapsCount),
                minGap = Math.min(maxGap, Math.max(20, Math.ceil(plotHeight / initialAvgGapsCount))),
                minGapsCount = Math.floor(plotHeight / minGap);

            //calculate avgGaps
            if (yMax > 10000) {
                avgGaps = Math.floor(plotHeight / ((maxGap + minGap) / 2));
            }

            //calculate calculatedGap
            if (avgGaps < 10) {
                if (initialAvgGap > minGap) {
                    calculatedGap = Math.min(maxGap, initialAvgGap);
                    avgGaps = initialAvgGapsCount;
                } else {
                    calculatedGap = minGap;
                    avgGaps = minGapsCount
                }
            } else if (plotHeight >= (avgGaps * maxGap)) {
                calculatedGap = maxGap;
                avgGaps = Math.floor(plotHeight / maxGap);
            } else if (plotHeight >= (avgGaps * minGap)) {
                calculatedGap = Math.floor(plotHeight / avgGaps);
            } else {
                calculatedGap = minGap;
                avgGaps = minGapsCount;
            }

            return {avgGaps: avgGaps, calculatedGap: calculatedGap};
        }
    };

    /**
     * Remove singleton indicators and set buttons
     * @param chartId
     * @param type
     * @param isPropertyChange
     * @param indicatorId
     * @private
     */
    var _removeSingletonIndicator = function (chartId, type, isPropertyChange) {

        var xChart = infChart.manager.getChart(chartId),
            indicator;

        switch (type) {

            case 'VOLUME':
                xChart.setVolume(false, isPropertyChange, true);
                break;
            case 'SPREAD':
                xChart.setSpread(false, isPropertyChange, true);
                break;
            //NOTE :: BAH does not have settings
            //TODO :: do this for other types as well
            default :
                indicator = _getSingletonIndicator(chartId, type);
                xChart.removeIndicator(indicator, isPropertyChange);
                break;
        }
    };

    /**
     * Remove given indicator id from the chart and update necessary flags
     * @param chartId
     * @param indicatorId
     * @private
     */
    var _removeIndicatorFromSettings = function (chartId, indicatorId) {

        var xChart,
            indicator = _getIndicatorById(chartId, indicatorId);

        if (_isSingletonIndicator(indicator.type)) {
            _removeSingletonIndicator(chartId, indicator.type, true);
        } else {
            xChart = infChart.manager.getChart(chartId);
            xChart.removeIndicator(indicator, true);
        }
    };

    /**
     * Returns the order which indicator is placed in _parallelToBaseAxes or _indicatorsDissimilerToBaseAxes
     * @param {StockChart.id} chartId - stock chart id
     * @param {Indicator.id} indicatorId - indicator id
     * @returns {number|undefined} order
     */
    var getIndicatorOrder = function (chartId, indicatorId) {
        var ind = _indicators[chartId].items[indicatorId],
            isParallelToBase = ind._isAxisParallelToBase(),
            isDissimilerToBase = ind._isAxisDissimilerToBase(),
            index;
        if (isParallelToBase) {
            index = _parallelToBaseAxes[chartId].indexOf(ind.getAxisId());
        } else if (isDissimilerToBase) {
            index = _indicatorsDissimilerToBaseAxes[chartId].indexOf(indicatorId);
        }
        if (index >= 0) {
            return index;
        }
    };

    var _openContextMenu = function (id, event, series) {
        let chartId = infChart.manager.getContainerIdFromChart(id);
        let data = series ? series : event.seriesPoint.series;
        if (infChart.contextMenuManager.isContextMenuEnabled(chartId)) {
            infChart.contextMenuManager.openContextMenu(chartId, {
                top: event.clientY,
                left: event.clientX
            }, infChart.constants.contextMenuTypes.indicator, data, event);
        }

        event.stopPropagation();
        event.preventDefault();
    };

    /**
     * get context menu options
     * @param {string} chartId - chart id
     * @param {string} series - selected series
     * @param {object} event - event
     * @returns {object} - context menu options
     * @private
     */
    var _getContextMenuOptions = function (chartId, series, event) {
        let chart = infChart.manager.getChart(chartId);
        let options = chart.settings.contextMenu.indicator.options;
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let indicator = _getIndicatorBySeriesId(chartId, series.options.id);
        let indicatorSpecificOptions = indicator && indicator.getContextMenuOptions(chartId, series, options, event);

        if (series.options && series.options.infIndType === "VOLUME") {
            return;
        }

        let indicatorDefaultOptions =  {
            "showIndicatorSettings" : {
                icon : options.settings.icon,
                displayText :options.settings.displayText,
                action : function () {
                    infChart.indicatorMgr.indicatorLegendClick(containerId, series.options.id);
                    if (infChart.toolbar) {
                        infChart.toolbar.setSelectedControls(containerId, "rightPanel", true);
                    }
                }
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
            "removeIndicator": {
                icon : options.removeIndicator.icon,
                displayText :options.removeIndicator.displayText,
                action : function () {
                    infChart.manager.removeSeries(series.chart.renderTo.id, series.options.id, series.options.infType);
                }
            }
        };

        H.extend(indicatorDefaultOptions, indicatorSpecificOptions);

        return indicatorDefaultOptions;
    };

    /**
     * whether added indicator available
     * @param {string} chartId - chart id
     * @param {[]} ignoreTypes - ignore indicator types
     * @retruns {boolean} whether added indicators available
     * @private
     */
    var _isAddedIndicatorsAvailable = function (chartId, ignoreTypes) {
        let indicators = _indicators[chartId];

        for (let indicatorId in indicators.items) {
            if (indicators.items.hasOwnProperty(indicatorId)) {
                if (ignoreTypes.indexOf(indicators.items[indicatorId].type) === -1) {
                    return true;
                }
            }
        }

        return false;
    };

    var _resetIndicatorsColors = function (indicators, defaultIndicatorOptions) {
        indicators.forEach(function (indicator) {
            var series = indicator.series;

            series.forEach(function (indicatorSeries) {
                if (indicatorSeries.color) {
                    delete indicatorSeries.color;
                }
                if (indicatorSeries.negativeColor) {
                    delete indicatorSeries.negativeColor;
                }
                if (indicatorSeries.fillColor) {
                    delete indicatorSeries.fillColor;
                }
                if (indicatorSeries.lineColor) {
                    delete indicatorSeries.lineColor;
                }
            })
        });
    };

    /**
     * show hide indicator
     * @param {string} chartId - chart id
     * @param {string} seriesId - series id
     * @param {string} isShow - whether to show indicator
     * @private
     */
    var _showHideIndicator = function (chartId, seriesId, isShow, isHideAll) {
        let mainIndicatorId = seriesId.split("_")[0];
        let indicator = _indicators[chartId].items[mainIndicatorId];

        if (isShow) {
            indicator.showIndicator(seriesId, isHideAll);
        } else {
            indicator.hideIndicator(seriesId, isHideAll);
        }
    };

    var _filterIndicatorData = function(data, chartId){
        var iChart = infChart.manager.getChart(chartId);
        var chart = iChart.chart;
        var xData = chart.series[0].xData;
        var newData = {};
        var newDataArray = [];
        var newDataMap = {};
        var mainSeriesDataMap = {};
        var indicatorSymbolData = data;

        xData.forEach(function (val) {
            mainSeriesDataMap[val] = val;
        });

        indicatorSymbolData.forEach(function (dataValue) {
            if (mainSeriesDataMap[dataValue[0]]) {
                newDataArray.push(dataValue);
            }
        });

        return newDataArray;
    };

    var _createSessionTimeBreakIndicator = function (selectedType, chartId) {
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let chart = infChart.manager.getChart(containerId);

        _removeSessionTimeBreakIndicator(chartId);

        chart.sessionTimeBreakSettings[selectedType].show = true;
        chart.addIndicator("SessionTimeBreaks", {break: selectedType}, true, true);
    };

    var _removeSessionTimeBreakIndicator = function (chartId) {
        let containerId = infChart.manager.getContainerIdFromChart(chartId);
        let chart = infChart.manager.getChart(containerId);
        let breakIndicators = _sessionTimeBreakIndicators[containerId];

        for (var type in breakIndicators) {
            if (Object.prototype.hasOwnProperty.call(breakIndicators, type)) {
                let indicator = breakIndicators[type];

                if (indicator && indicator.series[0]) {
                    let seriesId = indicator.series[0].userOptions.id

                    indicator.removePlotLines();
                    _removeIndicatorSeries(containerId, seriesId, undefined, indicator.series[0]);
                    delete breakIndicators[type];
                }

                chart.sessionTimeBreakSettings[type].show = false;
            }
        }

        infChart.manager.getChart(containerId)._onPropertyChange();
    };

    var _updateSessionTimeBreakIndicator = function (type, styleType, value, chartId) {
        let indicator = _sessionTimeBreakIndicators[chartId] ? _sessionTimeBreakIndicators[chartId][type] : undefined;

        if (indicator) {
            if (styleType === "color") {
                indicator.updateColor(value);
            } else if (styleType === "lineType") {
                indicator.updateLineType(value);
            }
        }

        infChart.manager.getChart(chartId)._onPropertyChange();
    };

    return {
        createIndicator: _createIndicator,
        removeIndicator: _removeIndicator,
        removeIndicatorSeries: _removeIndicatorSeries,
        getIndicatorCount: _getIndicatorCount,
        getNotSingletonIndicatorCount: _getNotSingletonIndicatorCount,
        getIndicators: _getIndicators,
        getIndicatorBySeriesId: _getIndicatorBySeriesId,
        getIndicatorById: _getIndicatorById,
        resetIndicators: _resetIndicators,
        getParallelToBaseAxes: _getParallelToBaseAxes,
        getIndicatorsDissimilarToBaseAxes: _getIndicatorsDissimilarToBaseAxes,
        isParallelToBaseAxes: _isParallelToBaseAxes,
        getSettingsContainer: _getSettingsContainer,
        initialize: _initialize,
        destroy: _destroy,
        getLabel: _getLabel,
        indicatorLegendClick: _indicatorLegendClick,
        getAllIndicatorProperties: _getAllIndicatorProperties,
        getIndicatorTooltipValue: _getIndicatorTooltipValue,
        updateSeriesTooltip: _updateSeriesTooltip,
        getLegendTitle: _getLegendTitle,
        isSeriesInBidAskHistory: _isSeriesInBidAskHistory,
        removeAllIndicators: _removeAllIndicators,
        applyNewIndicators: _onNewIndicators,
        isSingletonIndicator: _isSingletonIndicator,
        getSingletonIndicator: _getSingletonIndicator,
        isBidAskEnabled: _isBidAskEnabled,
        isVolumeEnabled: _isVolumeEnabled,
        isSpreadEnabled: _isSpreadEnabled,
        hasMaxIndicatorCountReached: _hasMaxIndicatorCountReached,
        isCloseBtnEnabled: _isCloseBtnEnabled,
        isParamsInLegendEnabled: _isParamsInLegendEnabled,
        getYGap: _getYGap,
        removeSingletonIndicator: _removeSingletonIndicator,
        removeIndicatorFromSettings: _removeIndicatorFromSettings,
        getIndicatorOrder: getIndicatorOrder,
        createIndicatorDrawing: _createIndicatorDrawing,
        openContextMenu: _openContextMenu,
        getContextMenuOptions: _getContextMenuOptions,
        isAddedIndicatorsAvailable: _isAddedIndicatorsAvailable,
        resetIndicatorsColors: _resetIndicatorsColors,
        showHideIndicator: _showHideIndicator,
        filterIndicatorData: _filterIndicatorData,
        isBlockFromMainSeriesUpdateIndicator: _isBlockFromMainSeriesUpdateIndicator,
        createSessionTimeBreakIndicator: _createSessionTimeBreakIndicator,
        removeSessionTimeBreakIndicator: _removeSessionTimeBreakIndicator,
        updateSessionTimeBreakIndicator: _updateSessionTimeBreakIndicator
    }

})(infChart, Highcharts);