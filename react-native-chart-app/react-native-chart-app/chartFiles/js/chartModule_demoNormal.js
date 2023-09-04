/**
 * Created by dushani on 8/28/15.
 * All the Features out side from the chart core will goes here
 * (Functions Regarding chart container and UI of the module (Buttons, selections and etc.. ))
 */
var chartModule = (function () {

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
            _chartManager = infChart.manager;
            chart = _chartManager.initChart(container, properties);

            _bindEvents(container);

        } catch (err) {
            infUtil.handleException(err);
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

    var _updateOrders = function (orders, isDisplayOnly) {
        chart.updateOrders(orders, isDisplayOnly);
    };

    return {
        initModule: _initModule,
        updateOrders: _updateOrders
    };

})();


$(document).ready(function () {
    //keyCloakAdaptor.initAdaptor();
    window.logMode = "debug";
    infChart.staticMode = true;
    //TODO Added chart loading delay for first time to avoid first time chart loading error. need to find a proper way to handle this

    var provider, symbol, desc, obj = {};

    setTimeout(function () {
        provider = getUrlParameter('provider');
        obj.symbol = {
            symbol: 'BTC_USD.BITFINEX',
            symbolId: 'BTC_USD.BITFINEX',
            symbolDesc: 'BTC_USD.BITFINEX',
            symbolType: 'CUR',
            dp: 3,
            currency: 'USD'
        };

        obj.toolbar = {
            enable: false,
            top: false,
            left: false,
            right: false,
            upper: false,
            trading: false,
            topTb : ["file", "interval", "chartType", "grid", "comparison", "indicator", "volume", "navigator", "value", "last", "crosshair", "preclose", "tooltip", "minMax", "zoom", "full-screen", "print"],
            config: {comparison: {
                options:  [
                    {symbol: 'ETH-USD', symbolId: 'ETH_USD.BITFINEX', symbolDesc: 'Ethereum to USD', symbolType: 'CUR', dp: 6, currency:'USD', provider:'XC'},
                    {symbol: 'LTC-USD', symbolId: 'LTC_USD.BITFINEX', symbolDesc: 'Litecoin to USD', symbolType: 'CUR', dp: 6, currency:'USD', provider:'XC'},
                    {symbol: 'XRP-USD', symbolId: 'XRP_USD.BITFINEX', symbolDesc: 'Ripple to USD', symbolType: 'CUR', dp: 6, currency:'USD', provider:'XC'},
                    {symbol: 'ETH-BTC', symbolId: 'ETH_BTC.BITFINEX', symbolDesc: 'Ethereum to Bitcoin', symbolType: 'CUR', dp: 6, currency:'BTC', provider:'XC'}
                ]}}};

        if (provider) {
            switch (provider) {
                case 'infinit':
                    obj.symbol = {
                        symbol: 'BTC_USD.BITFINEX',
                        symbolId: 'BTC_USD.BITFINEX',
                        symbolDesc: 'BTC_USD.BITFINEX',
                        symbolType: 'CUR',
                        dp: 3,
                        currency: 'USD'
                    };
                    obj.dataProvider = {
                        type: 'infinit', source: 'SIX', url: '/rest/history/load?',
                        timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + ""
                    };
                    obj.toolbar = {
                        config: {
                            comparison: {
                                options: [
                                    {
                                        symbol: 'BMWd',
                                        symbolId: 'BMWd.CHX',
                                        symbolDesc: 'Bayerische Motoren Werke',
                                        symbolType: 'EQU',
                                        dp: 3,
                                        currency: 'EUR'
                                    },
                                    {
                                        symbol: 'BARCl',
                                        symbolId: 'BARCl.CHX',
                                        symbolDesc: 'Barclays',
                                        symbolType: 'EQU',
                                        dp: 3,
                                        currency: 'GBP'
                                    },
                                    {
                                        symbol: 'BAYNd',
                                        symbolId: 'BAYNd.CHX',
                                        symbolDesc: 'Bayer',
                                        symbolType: 'EQU',
                                        dp: 3,
                                        currency: 'EUR'
                                    },
                                    {
                                        symbol: 'ALVd',
                                        symbolId: 'ALVd.CHX',
                                        symbolDesc: 'Allianz',
                                        symbolType: 'EQU',
                                        dp: 3,
                                        currency: 'EUR'
                                    }
                                ]
                            }
                        }
                    };
                    break;
                case 'webfg' :
                {
                    obj.dataProvider = {
                        type: 'WEBFG', source: 'WEBFG', url: '/x-one-webfg/dataService/dataRequest?',
                        timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + ""
                    };

                    obj.symbol = {
                        symbol: 'IBEX35',
                        symbolId: 'ES0SI0000005_indices_55_df',
                        symbolDesc: 'IBEX35',
                        symbolType: 'IND',
                        dp: 1
                    };

                    obj.toolbar = {
                        config: {
                            comparison: {
                                options: [
                                    {
                                        symbol: 'FTSE 100',
                                        symbolId: 'GB0001383545_indices_232_df',
                                        symbolDesc: 'FTSE 100',
                                        symbolType: 'IND',
                                        dp: 3
                                    },
                                    {
                                        symbol: 'NDX',
                                        symbolId: 'US6311011026_indices_67_df',
                                        symbolDesc: 'NASDAQ 100',
                                        symbolType: 'IND',
                                        dp: 3
                                    },
                                    {
                                        symbol: 'DAX',
                                        symbolId: 'DE0008469008_indices_22_df',
                                        symbolDesc: 'DAX',
                                        symbolType: 'IND',
                                        dp: 3
                                    },
                                    {
                                        symbol: 'SP500',
                                        symbolId: 'US78378X1072_indices_152_df',
                                        symbolDesc: 'S&P 500',
                                        symbolType: 'IND',
                                        dp: 3
                                    }
                                ]
                            }
                        }
                    };
                }
                default :
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
        obj.config =  {
            displayAllIntervals : true,
            unGroupedDataOnLoad : true,
            panToFuture : false,
            panToPast : false
        };
        if (typeof minYDP != "undefined") {
            obj.config.minYDecimalPlaces = minYDP;

        }
        obj.config.period = "I";
        obj.config.interval = "I_1";
        chartModule.initModule({settings: obj, config: {yAxis: [], tooltip : {enabled:true}}}, 'mainchart');
        //createExternalDepthChart();
        // _generateSampleData();
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

    if (getUrlParameter("search") === 'true') {
        $("#symbol_search_container").show();
    }

    $(window).resize(function () {
        $("#mainchart").data("infChart").resizeChart();
    });

});



