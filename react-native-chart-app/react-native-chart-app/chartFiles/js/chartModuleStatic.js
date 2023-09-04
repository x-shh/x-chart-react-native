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
            infChart.staticMode = true;
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

    //TODO Added chart loading delay for first time to avoid first time chart loading error. need to find a proper way to handle this

    var provider, symbol, desc, obj = {};

    setTimeout(function () {
        provider = getUrlParameter('provider') ? getUrlParameter('provider') : 'infinit';
        if (provider) {
            switch (provider) {
                case 'webfg' :
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
                    break;
                default :
                    obj.symbol = {
                        "provider" : "XC",
                        "symbolType" : "AGG",
                        "exchange" : "ALLEX",
                        "symbol" : "GUSD_BTC",
                        "currency" : "BTC",
                        "symbolId" : "GUSD_BTC.ALLEX"
                    };
                    //obj.dataProvider = {
                    //    type: 'infinit', source: 'SIX', url: '/rest/history/load?',
                    //    timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + ""
                    //};
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
        obj.config = {
            volume: true
        };
        if (typeof minYDP != "undefined") {
            obj.config.minYDecimalPlaces = minYDP;

        }

        chartModule.initModule({settings: obj, config: {yAxis: []}}, 'mainchart');
        if ($("#depth").length > 0) {
            createExternalDepthChart();
            _generateSampleData();
        }

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

    var cumulativeBidVolume = 0;
    var cumulativeAskVolume = 0;

    var self = {};

    self.sampleData = {
        asks: [],
        bids: []
    };
    self.sampleData2 = {
        asks: [],
        bids: []
    };


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

    var getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    };

    var _setMaxVolBids = function (newVal) {
        self.orderBookBidMaxVal < newVal ? self.orderBookBidMaxVal = newVal : '';
    };
    var _setMaxVolAsks = function (newVal) {
        self.orderBookAskMaxVal < newVal ? self.orderBookAskMaxVal = newVal : '';
    };

    var _generateSampleData = function () {
        setTimeout(function () {

            self.sampleData.bids = [];
            self.sampleData.asks = [];
            self.sampleData2.bids = [];
            self.sampleData2.asks = [];
            $('#mainchart').data('infChart').getLastPrice(function (lp) {
                if (lp) {
                    self.lastrTradedPrice = lp;
                    var minPrice = Math.max(0, self.lastrTradedPrice - 1) || self.lastrTradedPrice;
                    for (var i = 0; i <= self.orderBookBidLimit; i++) {
                        var volBid = getRandomInt(100, 1000);
                        _setMaxVolBids(volBid);
                        var rowBids = {
                            'splits': getRandomInt(1, 3),
                            'volume': volBid,
                            'price': getRandomInt(minPrice, self.lastrTradedPrice + 1) - getRandomInt(100, 1000) / 1000
                        };
                        self.sampleData.bids.push(rowBids);
                    }

                    for (var j = 0; j <= self.orderBookAskLimit; j++) {
                        var volAsk = getRandomInt(100, 1000);
                        _setMaxVolAsks(volAsk);
                        var rowAsks = {
                            'splits': getRandomInt(1, 3),
                            'volume': volAsk,
                            'price': getRandomInt(minPrice, self.lastrTradedPrice + 1) + getRandomInt(100, 1000) / 1000
                        };
                        self.sampleData.asks.push(rowAsks);
                    }

                    var lastrTradedPrice = lp - 1;
                    for (var l = 0; l <= self.orderBookBidLimit; l++) {
                        var volBid = getRandomInt(100, 1000);
                        _setMaxVolBids(volBid);
                        var rowBids = {
                            'splits': getRandomInt(1, 3),
                            'volume': volBid,
                            'price': getRandomInt(minPrice, lastrTradedPrice + 1) - getRandomInt(100, 1000) / 1000
                        };
                        self.sampleData2.bids.push(rowBids);
                    }

                    for (var k = 0; k <= self.orderBookAskLimit; k++) {
                        var volAsk = getRandomInt(100, 1000);
                        _setMaxVolAsks(volAsk);
                        var rowAsks = {
                            'splits': getRandomInt(1, 3),
                            'volume': volAsk,
                            'price': getRandomInt(minPrice, lastrTradedPrice + 1) + getRandomInt(100, 1000) / 1000
                        };
                        self.sampleData2.asks.push(rowAsks);
                    }

                    var chart = $('#mainchart').data('infChart');
                    if (chart && chart.depth) {
                        chart.depth.updateData(self.sampleData);
                    }
                    if (window.depth) {
                        window.depth.updateData(self.sampleData);
                    }
                    if (window.depth) {
                        /* window.depth.updateData([{
                         symbol : {
                         symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency: 'EUR',
                         id: 12, tradeSymbol: ""
                         },
                         data :self.sampleData
                         },{
                         symbol : {
                         symbol: 'BAYNd',
                         symbolId: 'BAYNd.CHX',
                         symbolDesc: 'Bayer',
                         symbolType: 'EQU',
                         dp: 3,
                         currency: 'EUR'
                         },
                         data :self.sampleData2
                         }], "stacked");*/
                    }

                }
                _generateSampleData();
            });

        }, 2000);

    };

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

    var createExternalDepthChart = function () {
        var iChart = $("#mainchart").data("infChart");
        /*$("#depth").html(infChart.depthManager.getHTML({
         enabled : true,
         side : 'bottom',
         show:true
         }, {maxWidth:300,
         maxHeight:150}));*/

        var depth = new infChart.Depth($("#depth")[0], "test", {
            enabled: true,
            side: 'bottom',

            show: true,
            mode: "stacked",
            singleColor: true,
            colorTheme: {color: '#3498DB', fillColor: '#3498DB', lineColor: '#3498DB'},
            events: {
                afterDataUpdate: function (ex) {
                    console.log(ex);
                }
            },
            xExtremes: {bottom: 1, bestZoom: true, minZoomRates: [.05, .1, .5, 1], maxZoomRates: [.05, .1, .5, 1]},
            fixedDigitsFormatter: function (newVal, type, decimals) {

                var getFixedDecimalPlaces = function (value, column) {
                    var dec;
                    value = Math.abs(value);

                    var powerFac = 0;
                    if (value != 0) {
                        powerFac = Math.ceil(Math.log10(value));
                    }

                    dec = 5 - powerFac;

                    if (dec < 0) {
                        dec = 0;
                    }


                    return dec;
                };

                var _format = function (value) {
                    return ('' + value).replace(
                        /(\d)(?=(?:\d{3})+(?:\.|$))|(\.\d\d?)\d*$/g,
                        function (m, s1, s2) {
                            return s2 || (s1 + ',');
                        }
                    );
                };


                var fmtVal = newVal, decimalPoints = 0;

                if (fmtVal != null && fmtVal != undefined && type == "number") {

                    fmtVal = Number.parseFloat(newVal, 10);

                    var decimalPoints = 0;
                    if (decimals) {
                        decimalPoints = getFixedDecimalPlaces(fmtVal);
                    }

                    fmtVal = fmtVal.toFixed(decimalPoints);

                    if (decimals && decimalPoints > 0) {
                        fmtVal = fmtVal.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                    } else {
                        fmtVal = _format(fmtVal);
                    }
                }

                return fmtVal;

            }
        }, {
            symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency: 'EUR',
            id: 12, tradeSymbol: ""
        });

        depth.initialize();
        /*depth.setConstituents([
         {
         symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency: 'EUR',
         id: 12, tradeSymbol: ""},
         {
         symbol: 'BAYNd',
         symbolId: 'BAYNd.CHX',
         symbolDesc: 'Bayer',
         symbolType: 'EQU',
         dp: 3,
         currency: 'EUR',
         theme : {color : '#3498DB', fillColor : '#3498DB', lineColor :'#3498DB' }
         }
         ]);*/

        window.depth = depth;
        /*
         var depthNavigator = new infChart.Depth($("#depth-navigator")[0], "test", {
         enabled: true,
         side: 'bottom',
         show: true,
         navigatorOnly: true,
         events: {
         onNavigatorScrollStop: function (min, max) {
         depth.setXExtremes(min, max);
         }
         }
         }, {
         symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency: 'EUR',
         id: 12, tradeSymbol: ""
         });

         depthNavigator.initialize();
         window.depthNavigator = depthNavigator;*/
    }
});



