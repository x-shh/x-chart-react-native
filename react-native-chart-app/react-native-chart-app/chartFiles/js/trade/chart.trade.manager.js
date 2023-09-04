infChart.tradingManager = (function() {

    var _traders = {},
        _listeners = {};

    var _createTrader = function(chartId, providerObj, options) {
        var stockTrader;
        if (_traders[chartId]) {
            stockTrader = _traders[chartId];
        } else {
            _setConstants();
            var dataManager = infChart.tradingDataManagerFactory.createTradingDataManager(providerObj);
            stockTrader = _createTraderInstance(chartId, dataManager, options);
            _traders[chartId] = stockTrader;
        }
        return stockTrader;
    };

    /**
    * @param {object} chartObj
    * @param {object} drawingSettingsContainer - chart container
    * @param {object} drawingProperties
    * @returns drawing object
    */
    var _createTradingDrawing = function (chartObj, drawingProperties) {

        var drawing;
        if (drawingProperties) {
            var shapeId = drawingProperties.shape;
        };
        var drawingId = infChart.util.generateUUID();

        var chartInstance = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartObj.renderTo.id));
        var drawingSettingsContainer = $(infChart.structureManager.getContainer(chartInstance.getContainer(), "trade"));

        switch (shapeId) {
            case 'tradingLine':
                drawing = new infChart.tradingLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'tradingLabel':
                drawing = new infChart.tradingLabelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'holdingLine':
                drawing = new infChart.holdingLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'limitOrder':
                drawing = new infChart.limitOrderDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'upperLimit':
                drawing = new infChart.upperLimitDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'lowerLimit':
                drawing = new infChart.lowerLimitDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'breakEvenLine':
                drawing = new infChart.breakEvenLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'algoLine':
                drawing = new infChart.algoLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
        }
        return infChart.drawingsManager.drawDrawingFromProperties(drawing, chartObj, drawingSettingsContainer, drawingProperties, drawing.drawingId);
    };

    var _createTraderInstance = function(chartId, dataManager, options) {
        var chartInstance = infChart.manager.getChart(chartId),
            container = chartInstance.getContainer(),
            settingsContainer = $(infChart.structureManager.getContainer(container, "trade"));

        var stockTrader = new infChart.StockTrader(chartId, dataManager, options, settingsContainer, settingsContainer);

        _listeners[chartId] = [];

        _listeners[chartId].push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function(symbol) {
                stockTrader.onResetChartSymbol(symbol);
            })
        });

        _listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function(data) {
                if (data && data.length > 0) {
                    //var lastPrice = data[data.length - 1][4];
                    stockTrader.updateData('LP', data[data.length - 1]);
                }
            })
        });

        _listeners[chartId].push({
            method: 'onUpdateChartTick',
            id: chartInstance.registerForEvents('onUpdateChartTick', function(data) {
                if (data && data.length > 0) {
                    //var lastPrice = data[data.length - 1][4];
                    stockTrader.updateData('LP', data[data.length - 1]);
                }
            })
        });

        _listeners[chartId].push({
            method: 'destroy',
            id: chartInstance.registerForEvents('destroy', function() {
                if (typeof stockTrader.destroy === 'function') {
                    stockTrader.destroy();
                }
            })
        });
        
        return stockTrader;
    };

    var _getTrader = function(chartId) {
        return _traders[chartId];
    };

    var _destroyTrader = function(chartId) {
        if (_traders[chartId]) {
            var stockTrader = _traders[chartId],
                chart = infChart.manager.getChart(chartId);
            _listeners[chartId].forEach(function(val) {
                chart.removeRegisteredEvent(val.method, val.id);
            });
            if (typeof stockTrader.destroy === 'function') {
                stockTrader.destroy();
            }
            delete _traders[chartId];
        }
    };

    var _setConstants = function() {
        infChart.constants.chartTrading = {};
        var highchartTheme = infChart.themeManager.getTheme();

        infChart.constants.chartTrading.orderSide = {
            buy: 1,
            sell: 2,
            BuyMinus: 3,
            SellPlus: 4,
            SellShort: 5,
            SellShortExempt: 6,
            Undisclosed: 7,
            Cross: 8,
            CrossShort: 9
        };

        infChart.constants.chartTrading.orderTypes = {
            Market: 1,
            Limit: 2,
            Stop: 3,
            StopLimit: 4,
            MarketOnClose: 5,
            WithOrWithout: 6,
            LimitOrBetter: 7,
            LimitWithOrWithout: 8,
            OnBasis: 9,
            AlgoTrailing: 10,
            AlgoTrend: 11,
            stopLoss: 14,
            takeProfit: 15
        };

        infChart.constants.chartTrading.tifTypes = {
            GTC: 1, //Good Til Cancel
            OPG: 2, //market-on-open (MOO) or limit-on-open(LOO)
            IOC: 3, //Immediate or Cancel
            FOK: 4, //Fill Or Kill
            GTX: 5,
            GTD: 6 //Good Til Date
        };

        infChart.constants.chartTrading.orderStatus = {
            local: 0,
            open: 1,
            completed: 2,
            cancelled: 3,
            rejected: 4
        };

        infChart.constants.chartTrading.changeType = {
            create: 1,
            update: 2,
            remove: 3
        };

        infChart.constants.chartTrading.theme = infChart.util.merge({
            buyColor: "#52ac62",
            sellColor: "#d00a20",
            holdingLine: {
                upColor: "#52ac62",
                downColor: "#d00a20",
                label: {
                    fill: "rgb(255,255,255)"
                }
            },
            tradingLine: {
                opacity: 1,
                buyColor: "#52ac62",
                sellColor: "#d00a20",
                padding: 3,
                height: 14,
                label: {
                    fill: "rgb(255,255,255)",
                    fontColor: "#ffffff",
                    stroke: "#ffffff",
                    slFillColor: "#E96B5E", // stop loss order label fill color
                    tpFillColor: "#6ABA5E" // take profit order label fill color
                },
                cancelColor: "#f0ad4e",
                cancelFontColor: "#ffffff",
                revertColor: "#f0ad4e",
                revertFontColor: "#ffffff",
                transmitColor: "#337ab7",
                transmitFontColor: "#ffffff"
            }
        }, highchartTheme && highchartTheme.chartTrading);

    };

    var _onOrderUpdates = function(chartId, order, changes, revert) {
        var trader = _getTrader(chartId);
        if(trader){
            if (!order) {
                trader.updateData('OLT');
            } else {
                trader.showOrderOnChart(order, changes, revert);
            }
        }
    };

    var _onHoldingUpdates = function(chartId) {
        var trader = _getTrader(chartId);
        trader.updateData('HLD');
    };

    var _onAccountSummaryUpdates = function(chartId) {
        var trader = _getTrader(chartId);
        trader.updateData('ACS');
    };

    var _onTradeControlUpdates = function (chartId, action) {
        _getTrader(chartId).onTradeAction(action);
    };

    var _onAnnotationStore = function(chartId, drawing) {
        var trader = _getTrader(chartId);
        trader.onAnnotationStore(drawing);
    };

    var _onAnnotationRelease = function(chartId, drawing) {
        var trader = _getTrader(chartId);
        trader.onAnnotationRelease(drawing);
    };

    /**
     * Set trading buttons in toolbar
     * @param {*} element
     * @param {*} settings
     */
    var _setTradingToolbarHTML = function (element, settings) {
        var container = $(infChart.structureManager.getContainer(element[0], 'tradingToolbar'));
        container.addClass('chart-buy-sell-button clearfix');

        if (settings.tradingTb && settings.tradingTb.length > 0) {
            settings.tradingTb.forEach(function (tradingKey) {
                if (settings.config[tradingKey]) {
                    var tradeControlOptions = settings.config[tradingKey].options;
                    var html = infChart.structureManager.trading.getTradingGridHTML(tradingKey, tradeControlOptions);
                    if(html != '') {
                        container.html(html);
                    }

                    // var html = '';
                    // infChart.util.forEach(tradeControlOptions, function (i, key) {
                    //     html += _getTradingOptionHTML(key);
                    // });

                    // switch (tradeControlOptions.length) {
                    //     case 2:
                    //         container.addClass('chart-buy-sell-button-inner-content items-2');
                    //         break;
                    //     case 3:
                    //         container.addClass('chart-buy-sell-button-inner-content items-3');
                    //         break;
                    //     case 5:
                    //         container.addClass('chart-buy-sell-button-inner-content items-5');
                    //         break;
                    //     default:
                    //         container.addClass('chart-buy-sell-button-inner-content items-3');
                    //         break;

                    // }
                    // container.html(html);
                }
            });
        }

        if (!settings.trading) {
            container.hide();
        }
    };

    // var _getTradingOptionHTML = function (config) {
    //     var html;
    //     switch (config.ctrl) {
    //         case "buy":
    //         case "sell":
    //             html = infChart.structureManager.trading.getTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.iconClass);
    //             break;
    //         case "algo-buy":
    //         case "algo-sell":
    //             html = infChart.structureManager.trading.getAlgoTradingButtonHTML(config.ctrl, config.locLabel, config.btnText, config.key, config.btnClass, config.textClass, config.title);
    //             break;
    //         case "size":
    //             html = infChart.structureManager.trading.getTradingSizeHTML(config.ctrl, config.btnText, config.key, config.divClass, config.titleCtrl);
    //             break;
    //         default:
    //             break;
    //     }
    //     return html;
    // };

    var _createTradingToolbar = function(container, uniqueId, settings) {
        _setTradingToolbarHTML(container, settings);
        var toolbarParent = container.find('div[inf-pnl="tb-trading-grid"]');
        var trader = _getTrader(uniqueId);
            if (settings.tradingTb && settings.tradingTb.length > 0) {
            settings.tradingTb.forEach(function (tradingKey) {
                if (settings.config[tradingKey]) {
                    var tradeControlOptions = settings.config[tradingKey].options;
                    tradeControlOptions.forEach(function (conf) {
                        switch (conf.ctrl) {
                            case "buy":
                            case "sell":
                            case "algo-buy":
                            case "algo-sell":
                                infChart.structureManager.common.setSingleOptionControlWithoutStatus(toolbarParent, conf.ctrl, function (value) {
                                    return _onTradeControlUpdates(uniqueId, value);
                                });
                        break;
                            case "size":
                                infChart.structureManager.common.setOptionControlsToChildWithoutStatus(toolbarParent, conf.ctrl,
                                    function (event, container) {
                                        return trader.onSizePanelClickEvent(event, container);
                                    },
                                    function (event, container) {
                                        return trader.onSizeInputBlurEvent(event, container);
                                    },
                                    function (event, container) {
                                        return trader.onSizeInputKeyUPEvent(event, container);
                                    });
                        break;
                    default:
                        break;
                }
            });
        }
            });
        }
    };

    return {
        createTrader: _createTrader,
        getTrader: _getTrader,
        destroyTrader: _destroyTrader,
        onOrderUpdates: _onOrderUpdates,
        onHoldingUpdates: _onHoldingUpdates,
        onAccountSummaryUpdates: _onAccountSummaryUpdates,
        onTradeControlUpdates: _onTradeControlUpdates,
        onAnnotationStore: _onAnnotationStore,
        onAnnotationRelease: _onAnnotationRelease,
        createTradingToolbar: _createTradingToolbar,
        createTradingDrawing: _createTradingDrawing
    }
})();