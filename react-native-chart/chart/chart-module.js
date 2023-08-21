/**
 * Created by dushani on 8/28/15.
 * All the Features out side from the chart core will goes here
 * (Functions Regarding chart container and UI of the module (Buttons, selections and etc.. ))
 */
var chartModule = (function () {

    //todo : add /rest/status/ensure-user/

    var _initializeArr = [];
    var _chartManager;
    var chart;

    var _initModule = function (properties, container) {
        try {

            if ($.inArray(container, _initializeArr) >= 0) {
                return;
            } else {
                _initializeArr.push(container);
            }
            infChart.themeManager.setTheme(infChart.themeManager.getThemes().dark);
            _chartManager = infChart.manager;
            //infChart.staticMode = true;
            chart = _chartManager.initChart(container, properties);

            _bindEvents(container);

        } catch (err) {
            infChart.util.handleException(err);
        }
    };

    var _bindEvents = function (container) {
        var ele = $('#' + container).parent().find('div#symbol_search_container');
        ele.find('#txtBaseSymbol').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                $('#reloadChart').click();
            }
        });

        ele.find('#reloadChart').click(function () {

            var symbolElem = ele.find('#txtBaseSymbol');
            var symbolDesc = ele.find('#txtBaseSymbolDesc').val();
            var dp = ele.find('#txtBaseSymbolDp').val();
            var symbolType = ele.find('#txtBaseSymbolType').val();

            var symbol = symbolElem.val();

            if (!symbol) {
                symbolElem.addClass('error_input');
                return false;
            }

            symbolElem.removeClass('error_input');


            var chartTemp = _chartManager.getChart(container);
            chartTemp.setSymbol({
                symbol: symbol,
                symbolId: symbol,
                symbolDesc: symbolDesc,
                symbolType: symbolType,
                dp: dp
            }, true, true);
            infChart.manager.getChart(container).setSymbol({
                symbol: 'IBEX35',
                symbolId: 'ES0SI0000005_indices_55_df',
                symbolDesc: 'IBEX35',
                symbolType: 'IND',
                dp: 1
            }, true, true);
        });

    };

    // var _updateOrders = function (orders, isDisplayOnly) {
    //     chart.updateOrders(orders, isDisplayOnly);
    // };

    return {
        initModule: _initModule
        // updateOrders: _updateOrders
    };

})();


$(document).ready(function () {
    //keyCloakAdaptor.initAdaptor();
    window.logMode = "debug";

    //TODO Added chart loading delay for first time to avoid first time chart loading error. need to find a proper way to handle this

    var provider, symbol, desc, obj =  {
        registeredMethods : {
            getWatermark : function(symbol){
                return {
                    text : symbol.symbol.replace("_", "-")
                };
            }
        }
    };

    setTimeout(function () {
        provider = getUrlParameter('provider') ? getUrlParameter('provider') : 'infinit';
        if (provider) {
            switch (provider) {
                case 'webfg' :
                    break;
                case 'mock':
                    break;
                default :
                    obj.dataProvider = {
                        type: 'infinit',
                        source: 'XC',
                        url: '/frontend/request-by-instrument/HST/',
                        timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + "",
                        // webSocketEvents: {
                        //     'initialize': function () {
                        //         var self = this, chart = $("#mainchart").data("infChart");
                        //         //todo : should have events for compare symbols
                        //         chart.registerForEvents('setSymbol', function (symbol, previousSymbol) {
                        //             if (previousSymbol) {
                        //                 self.getRealTimeData(previousSymbol, false);
                        //                 self.getDepthData(previousSymbol, false);
                        //                 localStorage.removeItem(previousSymbol.symbolId);
                        //             }
                        //             self.getRealTimeData(symbol, true);
                        //             self.getDepthData(symbol, true);
                        //         });

                        //         if (chart.symbol) {
                        //             self.getRealTimeData(chart.symbol, true);
                        //             self.getDepthData(chart.symbol, true);
                        //         }
                        //     },
                        //     'realTimeCallback': function (data) {
                        //         $("#mainchart").data("infChart").addTick(data);
                        //     },
                        //     'depthCallback': function (data) {
                        //         infChart.depthManager.updateData($("#mainchart").data("infChart").id, data);
                        //     }
                        // },
                        ignoreTimeConversionIntervals: ["D", "W", "M", "Y", "YTD"]
                    };

                    obj.symbol = {
                        "symbol": "EURUSD",
                        "symbolId": "EURUSD.240#CUR$USD@MS",
                        "exchange": "240",
                        "listingExc": "OTCC",
                        "provider": "MS",
                        "currency": "USD",
                        "symbolType": "CUR",
                        "legendLabel": "EURUSD",
                        "name": "EURUSD",
                        "symbolDesc": "EURUSD.240"
                    };

                    obj.toolbar = {
                        config: {
                            comparison: {
                                options: [
                                    {symbol: 'ETH_USD', symbolId: 'ETH_USD.ALLEX', symbolDesc: 'ETH to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'LTC_USD', symbolId: 'LTC_USD.ALLEX', symbolDesc: 'LTC to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'XRP_USD', symbolId: 'XRP_USD.ALLEX', symbolDesc: 'XRP to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'ETH_BTC', symbolId: 'ETH_BTC.ALLEX', symbolDesc: 'ETH to BTC', symbolType: 'AGG', dp: 6, currency:'BTC', provider:'XC', exchange : 'ALLEX'}
                                ]
                            }
                        }
                    };
                    break;
            }
        }
        symbol = getUrlParameter('symbol');
        if (symbol) {
            desc = getUrlParameter('sname');
            if (typeof desc === 'undefined') {
                desc = symbol;
            }

            var symboltype = getUrlParameter('stype');
            if (typeof symboltype === 'undefined') {
                symboltype = 'EQU';
            }
            var currency = getUrlParameter('currency');
            if (typeof currency === 'undefined') {
                currency = 'EUR';
            }
            var source = getUrlParameter('source');
            if (typeof source === 'undefined') {
                source = 'SIX';
            }

            obj.symbol = {
                symbol: desc,
                symbolId: symbol,
                symbolDesc: desc,
                symbolType: symboltype,
                dp: 2,
                currency: currency,
                provider: source
            }
        }
        var minYDP = getUrlParameter('minydp');
        /*obj.config = {type: 'line'};*/
        // obj.config = {
        //     volume: false,
        //     // indicators: [{
        //     //     "type": "AwesomeOsci",
        //     //     "params": {},
        //     //     "series": [{
        //     //         "infIndSubType": "AwesomeOsci",
        //     //         "type": "column",
        //     //         "color": "rgba(86, 195, 63, 1)",
        //     //         "lineWidth": 1
        //     //     }]
        //     // }]
        // };
        if (typeof minYDP != "undefined") {
            obj.config.minYDecimalPlaces = minYDP;
        }

        chartModule.initModule({settings: obj, config: {yAxis: []}}, 'mainchart');

        //chartModule.updateOrders([
        //    {
        //        "userName": "testUser",
        //        "symbolName": "YAHOO",
        //        "symbolExchange": "NSDQ",
        //        "quantity": "100",
        //        "price": "34.2754",
        //        "orderSide": "BUY",
        //        "tifType": "DAY",
        //        "orderType": "Stop",
        //        "takeProfit": "0.06",
        //        "stopLoss": "0.04",
        //        "time": "2016-05-27T13:10:44.195Z",
        //        "status": "Submitted",
        //        "filedQuantity": "0",
        //        "orderId": "1464354644195"
        //    }, {
        //        "userName": "testUser",
        //        "symbolName": "YAHOO",
        //        "symbolExchange": "NSDQ",
        //        "quantity": "1000",
        //        "price": "38.6653",
        //        "orderSide": "SELL",
        //        "tifType": "DAY",
        //        "orderType": "Stop",
        //        "takeProfit": "0.02",
        //        "stopLoss": "0.02",
        //        "time": "2016-05-27T13:17:33.214Z",
        //        "status": "Submitted",
        //        "filedQuantity": "0",
        //        "orderId": "1464355053214"
        //    }, {
        //        "userName": "testUser",
        //        "symbolName": "YAHOO",
        //        "symbolExchange": "NSDQ",
        //        "quantity": "150",
        //        "price": "36.6653",
        //        "orderSide": "SELL",
        //        "tifType": "DAY",
        //        "orderType": "Stop",
        //        "takeProfit": "0.02",
        //        "stopLoss": "0.02",
        //        "time": "2016-04-20T13:17:33.214Z",
        //        "status": "Filled",
        //        "filedQuantity": "0",
        //        "orderId": "1464355953214"
        //    }
        //], true);
    }, 1000);

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    var self = {};


    self.orderBookBidLimit = 35;
    self.orderBookAskLimit = 35;
    self.lastrTradedPriceNotRounded = 100;
    self.orderBookBidMaxVal = 0;
    self.orderBookAskMaxVal = 0;
    self.responsiveClass = '';
    self.showHeader = true;
    self.showGoToTopIcon = false;
    self.orderBookContainerHeight = 0;
    self.quoteHeaderHeight = 0;
    self.cumulativeTotalBidVolume = 0;
    self.cumulativeTotalAskVolume = 0;

    if (getUrlParameter("search") === 'true') {
        $("#symbol_search_container").show();
    }

    $(window).resize(function () {
        $("#mainchart").data("infChart").resizeChart();
    });

    $("#performanceCheck").click(function () {
        var stime = Date.now();
        var chart = $("#mainchart").data("infChart");
        for (var i = 0; i < 1000; i++) {
            chart.chart.redraw();
        }
        var etime = Date.now();
        console.debug("### chart redraw time " + (etime - stime) + " no of redraws " + i);
    });
});