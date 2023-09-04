/**
 * Created by dushani on 8/28/15.
 * All the Features out side from the chart core will goes here
 * (Functions Regarding chart container and UI of the module (Buttons, selections and etc.. ))
 */
var chartModule = (function(){

    var _initializeArr = [];
    var _chartManager;
    var chart;

    var _initModule = function (properties, container) {
        try {

            if ($.inArray(container, _initializeArr) >= 0) {
                return;
            }else{
                _initializeArr.push(container);
            }
            _chartManager = infChart.manager;
            chart = _chartManager.initChart(container, properties);

            _bindEvents(container);

        } catch (err) {
            infChart.util.handleException(err);
        }
    };

    var _bindEvents = function(container){
        var ele = $('#' + container).parent().find('div#symbol_search_container');
        ele.find('#txtBaseSymbol').keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                $('#reloadChart').click();
            }
        });

        ele.find('#reloadChart').click(function(){

            var symbolElem = ele.find('#txtBaseSymbol');
            var symbolDesc = ele.find('#txtBaseSymbolDesc').val();
            var dp = ele.find('#txtBaseSymbolDp').val();
            var symbolType = ele.find('#txtBaseSymbolType').val();

            var symbol = symbolElem.val();

            if(!symbol){
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

    var _updateOrders = function(orders, isDisplayOnly){
        chart.updateOrders(orders, isDisplayOnly);
    };

    return {
        initModule:_initModule,
        updateOrders : _updateOrders
    };

})();


$(document).ready(function(){
    //keyCloakAdaptor.initAdaptor();
    window.logMode = "debug";

    //TODO Added chart loading delay for first time to avoid first time chart loading error. need to find a proper way to handle this

    var provider, symbol, desc, obj =  {
        registeredMethods : {
            getWatermark : function(symbol){
                return {
                    //type : "mix",
                    text : symbol.symbol.replace("_", "-")/*,
                     images : [

                     {url : "img/ui-icons_222222_256x240.png", x : 10,y:10, width : 100, height : 100}
                     ]*/
                };
            }
        }
    };

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
                case 'mock':
                    obj.dataProvider = {
                        type: 'MOCK',
                        source: 'MOCK',
                        timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + ""
                    };

                    obj.symbol = {
                        currency: "USD",
                        data: undefined,
                        dp: 6,
                        exchange: "ALLEX",
                        provider: "XC",
                        symbol: "ETH_USD",
                        symbolDesc: "ETH_USD.ALLEX",
                        symbolId: "ETH_USD.ALLEX#CUR$USD@XC",
                        symbolType: "CUR"
                    };

                    obj.toolbar = {
                        config: {
                            comparison: {
                                options: [
                                    {symbol: 'ETH_USD', symbolId: 'ETH_USD.ALLEX', symbolDesc: 'ETH to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'LTC_BTC', symbolId: 'LTC_USD.BINANCE', symbolDesc: 'LTC_BTC', symbolType: 'CUR', dp: 6, currency:'BTC', provider:'XC', exchange : 'BINANCE'},
                                    {symbol: 'XRP_USD', symbolId: 'XRP_USD.ALLEX', symbolDesc: 'XRP to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'ETH_BTC', symbolId: 'ETH_BTC.ALLEX', symbolDesc: 'ETH to BTC', symbolType: 'AGG', dp: 6, currency:'BTC', provider:'XC', exchange : 'ALLEX'}
                                ]
                            }
                        }
                    };

                    break;
                default :
                    obj.dataProvider = {
                        type: 'infinit',
                        source: 'XC',
                        url: '/frontend/request-by-instrument/HST/',
                        timeZoneOffset : ((new Date().getTimezoneOffset()/60) * -1 ) + "",
                        webSocketEvents: {
                            'initialize' : function(){
                                var self = this, chart = $("#mainchart").data("infChart");
                                //todo : should have events for compare symbols
                                chart.registerForEvents('setSymbol', function (symbol, previousSymbol) {
                                    if(previousSymbol) {
                                        self.getRealTimeData(previousSymbol, false);
                                        self.getDepthData(previousSymbol, false);
                                        localStorage.removeItem(previousSymbol.symbolId);
                                    }
                                    self.getRealTimeData(symbol, true);
                                    self.getDepthData(symbol, true);
                                });

                                if(chart.symbol){
                                    self.getRealTimeData(chart.symbol, true);
                                    self.getDepthData(chart.symbol, true);
                                }
                            },
                            'realTimeCallback' : function(data){
                               // $("#mainchart").data("infChart").addTick(data);
                            },
                            'depthCallback' : function(data){
                                infChart.depthManager.updateData($("#mainchart").data("infChart").id, data);
                            }
                        }
                    };

                    obj.symbol = {
                        currency: "BTC",
                        data: undefined,
                        dp: 6,
                        exchange: "SENTDEXX",
                        provider: "XC",
                        symbol: "XRP_BTC",
                        symbolDesc: "XRP_BTC.SENTDEXX",
                        symbolId: "XRP_BTC.SENTDEXX#CUR$BTC@XC",
                        symbolType: "CUR"

                        /*currency: "USDT",
                         dp: 6,
                         exchange: "BINANCE",
                         provider: "XC",
                         symbol: "ETHf_USDT",
                         symbolDesc: "ETHf_USDT.BINANCE",
                         symbolId: "ETHf_USDT.BINANCE#CUR$USDT@XC",
                         symbolType: "CUR"*/
                        /*currency: null,
                        data: undefined,
                        dp: 6,
                        exchange: "XC",
                        provider: "XC",
                        symbol: "CAMCrypto30",
                        symbolDesc: "CAMCrypto30.XC",
                        symbolId: "CAMCrypto30.XC#IND@XC"*/
                        /*currency: "USD",
                        data: undefined,
                        dp: 3,
                        exchange: "131",
                        provider: "MS",
                        symbol: "MSFT",
                        symbolDesc: "MSFT.131",
                        symbolId: "MSFT.131#EQU$USD@MS",
                        symbolType: "EQU"*/

                        /*currency: "EUR",
                        data: undefined,
                        dp: 3,
                        exchange: "STUB",
                        provider: "STU",
                        symbol: "CA9442041062",
                        symbolDesc: "CA9442041062.STUB",
                        symbolId: "CA9442041062.STUB#EQU$EUR@STU",
                        symbolType: "EQU"*/

                        /*currency: "USD",
                        data: undefined,
                        dp: 6,
                        exchange: "ALLEX",
                        provider: "XC",
                        symbol: "ETH_USD",
                        symbolDesc: "ETH_USD.ALLEX",
                        symbolId: "ETH_USD.ALLEX#CUR$USD@XC",
                        symbolType: "CUR"*/
                    };

                    obj.toolbar = {
                        config: {
                            comparison: {
                                options: [
                                    {symbol: 'ETH_USD', symbolId: 'ETH_USD.ALLEX', symbolDesc: 'ETH to USD', symbolType: 'AGG', dp: 6, currency:'USD', provider:'XC', exchange : 'ALLEX'},
                                    {symbol: 'LTC_BTC', symbolId: 'LTC_USD.BINANCE', symbolDesc: 'LTC_BTC', symbolType: 'CUR', dp: 6, currency:'BTC', provider:'XC', exchange : 'BINANCE'},
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
        obj.config = { scalable : true,
            interval : "I_1" ,  period : "I_H_2"};
        if(typeof minYDP != "undefined") {
            obj.config.minYDecimalPlaces = minYDP;

        }

        chartModule.initModule({settings: obj, config: {yAxis: []}}, 'mainchart');
        /*if ($("#depth").length > 0) {
         createExternalDepthChart();
         _generateSampleData();
         }*/
        var chart = $('#mainchart').data('infChart');
        setRealtimeUpdates(chart);
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

    var setRealtimeUpdates = function(chart){
        window.xinGlobalParam = {updateFreq:20, dateType : "utc", timeZoneOffset: true};
        setInterval (function () {
            if (chart && chart.data && chart.data.base.length>0) {

                var last = (chart.data && chart.data.base && chart.data.base[0] && chart.data.base[0][4] || 10) + Math.random() * 10;
                addTick(chart, chart.symbol, last, chart.data.base, xinGlobalParam.updateFreq);

                $.each(chart.compareSymbols.symbols, function (k, val) {
                    var seriesId = chart.getCompareSeriesId(val),
                        data = chart.data.compare[val.symbolId];
                    last = ( data && data[0] && data[0][4] || 10 ) + Math.random() * 10;
                    addTick(chart, val, last, data, 20);
                });
            }
        }, 2000);
    };

    function addTick(chart, symbol, last, data, updateFreq) {
        var currentDt = new Date(Date.now());

        if( xinGlobalParam.dateType == "string" ) {
            xinGlobalParam.timeZoneOffset = false;
        }

        var dateTime = new Date (currentDt.getFullYear(), currentDt.getMonth(), currentDt.getDate(),currentDt.getHours(), currentDt.getMinutes(), currentDt.getSeconds());
        var lastTime = chart.data.base[chart.data.base.length-1][0];
        if(lastTime > dateTime.getTime()) {

            var  lastDt = new Date(( xinGlobalParam.lastTime  || lastTime));
            dateTime = new Date (lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate(),lastDt.getHours(), lastDt.getMinutes(), lastDt.getSeconds()+ updateFreq);
        }
        xinGlobalParam.lastTime = xinGlobalParam.dateType == "string" ? xinGlobalParam.timeZoneOffset ?
            Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', dateTime.getTime()) :
            Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', chart.dataManager.getChartTime(dateTime.getTime(), 5.5)): dateTime.getTime() ;
        var symbolId = symbol.symbolId;
        console.log ("dateTime:"+
            (xinGlobalParam.dateType == "string" ? xinGlobalParam.timeZoneOffset ? Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', dateTime.getTime()) :
                Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', chart.dataManager.getChartTime(dateTime.getTime(), 5.5)) : Highcharts.dateFormat('%Y-%m-%d-%H-%M-%S', chart.dataManager.getChartTime(dateTime.getTime(), 5.5)))+ " | last:" + last);

        chart.addTick (
            {
                symbol : symbol.symbol,
                symbolId : symbolId,
                currency : symbol.currency,
                exchange : symbol.exchange,
                symbolType :symbol.symbolType,
                provider : symbol.provider? symbol.provider : chart.dataManager.source,
                close : last,
                dateTime : xinGlobalParam.lastTime,
                timeZoneOffset : xinGlobalParam.timeZoneOffset ? 5.5 : 0 ,
                volume : (data && data[data.length-1][5]) || 1000
            }
        );
    }

    if(getUrlParameter("search") === 'true'){
        $("#symbol_search_container").show();
    }

    /*   $(window).resize( function() {
     $("#mainchart").data("infChart").resizeChart();
     });*/
});


