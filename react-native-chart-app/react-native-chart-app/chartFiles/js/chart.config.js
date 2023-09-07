/**
 * Created by dushani on 8/26/15.
 * This section contains the default configurations of the chart
 */

var infChart = window.infChart || {};

infChart.constants = {
    drawingTypes: {
        shape: "shape",
        trading: "trading",
        indicator: "indicator",
        alert: "alert"
    },
    dummySeries : {
        forwardId : "dummy_fw",
        backwardId : "dummy_bw",
        missingId : "missing"
    },
    minGroupPixelWidth : 1,
    fileTemplateTypes:{
        all: 'all',
        file: 'default',
        template: 'template'
    },
    contextMenuTypes : {
        default : "default",
        drawing : "drawing",
        indicator : "indicator",
        favoriteDrawing: "favoriteDrawing",
        indicator : "indicator",
        colorPalette: "colorPalette",
        xAxis: "xAxis",
        yAxis: "yAxis"
    }
};

infChart.config = {
    /* TODO :: uncomment once extend method is implemented
     infmerge:{
     avoidReplace : [
     "xAxis",
     "yAxis",
     "series",
     "scrollbar"
     ]
     },*/
    credits: {
        enabled: false
    },
    accessibility: {
        enabled: false
    },
    // watermark: {
    //     type: "text",
    //     text: "",
    //     opacity: 0.5,
    //     enabled: true
    // },
    "scrollbar": {
        "enabled": true,
        height: 0,
        liveRedraw: true
    },
    legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        borderWidth: 0,
        itemDistance: 5,
        symbolPadding: 0,
        symbolWidth: 0.001,
        symbolHeight: 0.001,
        symbolRadius: 0,
        navigation: {
            enabled: false
        },
        labelFormatter: function () {
            return infChart.manager.getLegend(this);
        },
        useHTML: true
    },
    "tooltip": {
        followTouchMove: false,
        animation: false,
        enabled: true,
        shared: true,
        useHTML: true,
        shadow: false,
        positioner: function (labelWidth, labelHeight, point) {
            return infChart.manager.tooltipPositioner(this.chart, labelWidth, labelHeight, point);
        },
        formatter: function (tooltip) {
            return infChart.manager.tooltipFormatter(this, tooltip);
        }
    },
    customGridLineColorEnabled: false,
    "title": {
        "text": ""
    },
    "chart": {
        // "styledMode": true,
        "infChart" : true,
        "alignTicks": false,
        "plotBorderWidth": 0,
        "borderWidth": 0,
        "marginLeft": 3,
        //"marginRight": 40,
        "marginTop": 0,
        "marginBottom": 15,
        "spacingBottom": 0,
        "animation": false,
        "lineWidth": 1.6,
        "type": "line",
        "spacingTop": 25,
        "zoomType" : undefined,
        "panning" : false,
        events: {
            /* TODO :: uncomment once extend method is implemented
             infmerge:{
             avoidReplace : [
             "click",
             "redraw"
             ]
             },*/
            click: function (e) {
                infChart.manager.chartClick(this, e);
            },
            contextmenu: function (event) {
                infChart.manager.openContextMenu(this.renderTo.id, event);
            },
            redraw: function () {
                var chartId = this.renderTo.id;
                infChart.manager.afterRedraw(chartId);
            }
        }
    },
    "annotationsOptions": {
        "enabledButtons": false
    },
    annotations: [],
    "plotOptions": {
        "series": {
            "allowPointSelect": false,
            //"lineWidth": 1,
            "shadow": false,
            "stickyTracking": true,
            "enableMouseTracking": true,
            "animation": false,
            findNearestPointBy: 'x',
            "yAxis": "#0",
            "zIndex": 20,
            "connectNulls" : true,
            "cropThreshold": 0,
            "marker": {
                "enabled": false
            },
            states: {
                inactive: {
                    enabled: false,
                    opacity: 1
                }
            },
            "dataGrouping": {
                "enabled": false,
                "smoothed": false,
                groupPixelWidth: 3,
                units: [[
                    'millisecond', // unit name
                    [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
                ], [
                    'second',
                    [1, 2, 5, 10, 15, 30]
                ], [
                    'minute',
                    [1, 2, 5, 10, 15, 30]
                ], [
                    'hour',
                    [1, 2, 3, 4, 6, 8, 12]
                ], [
                    'day',
                    [1, 2, 3, 4]
                ], [
                    'week',
                    [1, 2]
                ], [
                    'month',
                    [1, 3, 6]
                ], [
                    'year',
                    null
                ]]
            },
            point: {
                events: {
                    click: function (e) {
                        if (infChart.intradayChartManager) {
                            infChart.intradayChartManager.onChartPointClick(this.series, e);
                        }
                    }
                }
            },
            events: {

                /* TODO :: uncomment once extend method is implemented
                 infmerge:{
                 avoidReplace : [
                 "click",
                 "mouseOut",
                 "legendItemClick"
                 ]
                 },*/
                click: function (e) {
                    infChart.manager.chartClick(this.chart, e);
                },
                doubleClick: function (e) {
                    infChart.indicatorMgr.indicatorLegendClick(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id), e.seriesPoint.series.options.id);
                },
                mouseOut: function (event) {
                    infChart.manager.seriesMouseOutEvent(this.chart, "series", this);
                }, legendItemClick: function () {

                    return false;
                    /* <== returning false will cancel the default action*/
                },
                mouseOver: function(){
                    infChart.manager.seriesMouseOverEvent(this.chart, this);
                },
                contextmenu: function(event) {
                    infChart.indicatorMgr.openContextMenu(this.chart.renderTo.id, event);
                }
            }

        },
        "yAxis": {
            "startOnTick": false,
            "endOnTick": false,
            "maxPadding": 0.05,
            "minPadding": 0.05,
            showLastLabel: true,
            "title": {
                "text": ""
            },
            "opposite": true
        },

        column: {
            borderWidth: 0,
            threshold: null,
            dataGrouping: {
                approximation: "close"
            }
        },
        volume: {
            lineWidth: 0,
            threshold: 0,
            //groupPixelWidth:1,
            softThreshold : true
        },
        arearange: {
            dataGrouping: {
                approximation: function (low, high) {

                    var NUMBER = 'number';

                    var sum = function (arr) {
                        var len = arr.length,
                            ret;

                        /* 1. it consists of nulls exclusively*/
                        if (!len && arr.hasNulls) {
                            ret = null;
                            /* 2. it has a length and real values*/
                        } else if (len) {
                            ret = 0;
                            while (len--) {
                                ret += arr[len];
                            }
                        }
                        /*3. it has zero length, so just return undefined
                         => doNothing()*/

                        return ret;
                    };

                    var len = low.length;
                    low = sum(low);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof low === NUMBER && len) {
                        low = low / len;
                    }
                    len = high.length;
                    high = sum(high);

                    /*If we have a number, return it divided by the length. If not, return
                     null or undefined based on what the sum method finds.*/
                    if (typeof high === NUMBER && len) {
                        high = high / len;
                    }


                    if (typeof low === NUMBER || typeof high === NUMBER) {
                        return [low, high];
                    }
                    /* else, return is undefined*/
                }
            }
        },
        line: {findNearestPointBy: 'x', "dataGrouping": {
            //groupPixelWidth:1
        }},
        spline: {},
        area: {
            "dataGrouping": {
                //groupPixelWidth:1
            },
            threshold: null
        },
        candlestick: {
            "dataGrouping": {}

        },
        ohlc: {

            "dataGrouping": {}
        },
        hlc: {
            "dataGrouping": {}
        },
        heikinashi: {
            "dataGrouping": {}
        },
        engulfingCandles: {
            "dataGrouping": {}
        },
        customCandle: {
            "dataGrouping": {},
            shadow : {
                offsetX: 1,
                offsetY: 5,
                width: 4,
                opacity: 0.3,
                color: '#000000'
            }
        },
        point: {
            "dataGrouping": {}
        },
        equivolume: {
            "dataGrouping": {}
        },
        step: {
            "dataGrouping": {}
        },
        flags: {
            allowPointSelect: false,
            "stickyTracking": false,
            states: {
                hover: {
                    enabled: false,
                    halo: false
                }
            },
            "dataGrouping": {}
        },
        infUDSignal: {
            allowPointSelect: false,
            "stickyTracking": false,
            states: {
                hover: {
                    enabled: false,
                    halo: false
                }
            },
            "dataGrouping": {}
        },
        infsignal: {
            findNearestPointBy: 'x',
            allowPointSelect: false,
            "stickyTracking": false,
            states: {
                hover: {
                    enabled: false,
                    halo: false
                }
            }
        },
        plotrange: {

            threshold: null,
            findNearestPointBy: 'x',
            allowPointSelect: false,
            "stickyTracking": false
        }
    },
    "navigator": {
        adaptToUpdatedData: false,
        /* "series": {
         "animation": false
         },*/
        "margin": 10,
        "height": 70,
        "enabled": true,
        "visible": true,
        "maskInside": false,
        "infMaxHeight": 100,
        "infMinHeight": 15,
        zoomType : 'none',
        ordinal : false
    },
    "rangeSelector": {
        "enabled": false
    },
    "xAxis": {
        id: "#X1",
        type: "datetime",
        gridLineWidth: 1,
        ordinal : false,
        dateTimeLabelFormats: {
            "millisecond": "%H:%M:%S.%L",
            "second": "%H:%M:%S",
            "minute": "%H:%M",
            "hour": "%H:%M",
            "day": "%e.%b'%y",
            "week": "%e.%b'%y",
            "month": "%b'%y",
            "year": "%Y"
        },
        crosshair: {
            snap: true,
            label: {
                enabled: true,
                formatter: function (value) {
                    var chartObj = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id));
                    var time = chartObj && chartObj.ttgrpVolIdx != undefined && chartObj.ttTime ? chartObj.ttTime : value;
                    return chartObj.getXAxisCrosshairLabel(time, this);
                }
            }

        },
        labels: {
            // "useHTML": true,
            showFirstLabel: true,
            showLastLabel: false,
            staggerLines: 1,
            style: {textOverflow: 'unset'},
            formatter: function () {
                return infChart.manager.xAxisLabelFormatter(this);
            }
        },
        events: {
            setExtremes: function (e) {
                var chartObj = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id));
                if (chartObj.mouseWheelController) {
                    chartObj.mouseWheelController.setExtremes.call(chartObj.mouseWheelController, e, this);
                }
            },
            afterSetExtremes: function (e) {
                // var chartObj = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(this.chart.renderTo.id));
                // var chart = chartObj.chart;
                // chartObj.afterSetExtremes();

                infChart.manager.afterXSetExtremes(this.chart.renderTo.id, this);

            },
            contextmenu: function (event) {
                infChart.manager.openContextMenu(event.chart.renderTo.id, event, infChart.constants.contextMenuTypes.xAxis);
            }
        },
        tickPositioner: function (min, max) {
            return infChart.manager.xAxisTickPositioner(this, min, max);
        },
        tickPixelInterval : 120,
        "units" :[[
            'millisecond', // unit name
            [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
        ], [
            'second',
            [1, 2, 5, 10, 15, 30]
        ], [
            'minute',
            [1, 2, 5, 10, 15, 30]
        ], [
            'hour',
            [1, 2, 3, 4, 6, 8, 12]
        ], [
            'day',
            [1, 2, 3, 4]
        ], [
            'week',
            [1, 2]
        ], [
            'month',
            [1, 3, 6]
        ], [
            'year',
            null
        ]]
    },
    "yAxis": [
        {
            "id": "#0",
            gridLineWidth: 1,
            infBaseYAxis: true,
            events: {
                afterSetExtremes: function (e) {
                     infChart.manager.afterYSetExtremes(this.chart.renderTo.id, this);
                },
                contextmenu: function (e) {
                    infChart.manager.openContextMenu(e.chart.renderTo.id, e, infChart.constants.contextMenuTypes.yAxis);
                }
            },
            "labels": {
                "align": "left",
                "x": 8,
                "y": 5,
                style: {textOverflow: 'unset'},
                formatter: function () {
                    return infChart.manager.yAxisLabelFormatter(this, true);
                }
            },
            crosshair: {
                snap: false,
                label: {
                    enabled: true,
                    formatter: function (value) {
                        return infChart.manager.getMainYAxisCrosshairLabel(this.chart.renderTo.id, value);
                        // return infChart.manager.getYLabel(this.chart, value, false);
                    }
                }
            },
            tickPositioner: function (min, max) {
                return infChart.manager.yAxisTickPositioner(this, min, max);
            }
        }
    ],
    "series": [
        {
            data: [],
            "id": "c0",
            "type": 'line',
            "name": "Primary",
            infType: "base",
            showInNavigator: true,
            kdNow: true/*,
         navigatorOptions : {data :[]}*/
        },
        {
            data: [],
            "id": infChart.constants.dummySeries.missingId,
            "type": 'dummySeries',
            "name": "Empty",
            infType: "dummy",
            showInNavigator: false,
            showInLegend : false/*,
         navigatorOptions : {data :[]}*/
        },
        {
            data: [],
            "id": infChart.constants.dummySeries.forwardId,
            "type": 'dummySeries',
            "name": infChart.constants.dummySeries.forwardId,
            infType: "dummy",
            showInNavigator: false,
            showInLegend : false,
           // enableMouseTracking: false,
            lineWidth : 0,
            states : {
                inactive: {
                    enabled: false,
                    opacity: 1
                },
                hover : {
                    enabled : false
                }
            }/*,
         navigatorOptions : {data :[]}*/
        },
        {
            data: [],
            "id": infChart.constants.dummySeries.backwardId,
            "type": 'dummySeries',
            "name": infChart.constants.dummySeries.backwardId,
            infType: "dummy",
            showInNavigator: false,
            showInLegend : false/*,
         navigatorOptions : {data :[]}*/
        }
    ],
   noData : { fontWeight: 'bold', fontSize: '11px'}
};

/*infChart.config.chart.plotBackgroundColor = "rgba(255, 255, 255, 0.0)";
infChart.config.chart.backgroundColor = "rgba(255, 255, 255, 0.0)";
infChart.config.xAxis.alternateGridColor =  'rgba(255, 255, 255, 0.0)';
infChart.config.xAxis.gridLineColor =  'rgba(255, 255, 255, 0.0)';*/
infChart.settings = {
    defaults : {
        minGroupPixelWidth : 2,
        maxGroupPixelWidth : 150,
        scaleYStart : 60,
        volumeDp : 2
    },
    config: {
        interval: 'D',
        pinInterval : false,
        type: 'candlestick',
        period: 'Y_1',
        crosshair: 'none',
        yAxisType: 'normal',
        isLog: false,
        isPercent: false,
        minMax: false,
        volume: false,
        indicators: [],
        compareSymbols: [],
        drawings: [],
        navigator: true,
        tooltip: false,
        news: false,
        alert: false,
        flags: [],
        isMobile: true,
        mouseWheelController: true,
        refreshBtn: true,
        maxResizeDelay: 1000,
        tickUpdateDelay: 1000,
        grid: "none",
        gridSettings: {
            xGridLineColor: "rgba(255, 255, 255, 0.1)",
            yGridLineColor: "rgba(255, 255, 255, 0.1)",
            gridLineWidth: 1,
            xGridLineWidth: 1,
            yGridLineWidth: 1,
        },
        backgroundType: "solid",
        backgroundColor: "transparent",
        chartBgTopGradientColor: "transparent",
        chartBgBottomGradientColor: "transparent",
        chartBackgroundColor: "transparent",
        backgroundColorOpacity: 1,
        chartBgTopGradientColorOpacity: 1,
        chartBgBottomGradientColorOpacity: 1,
        disableNumericSymbols: false,
        minYDecimalPlaces: undefined,
        trading: true,
        defaultDp: 2,
        last:false,
        barClosureTime:false,
        lastLabelAlign:"right",
        previousCloseLabelAlign: "left",
        depth : {
            enabled: false,
            side: 'right',
            show: false,
            titleFormat : '[exchange]',
            enableLoading : false
        },
        displayAllIntervals : true, // Used this property to determine whether dummy points are needed or not in place of missing intervals
        unGroupedDataOnLoad : 0.5,
        panToFuture : true,
        ignoreWeekEndFromFutureDates : true,
        panToPast : false,
        disableRangeSelector:true,
        regularIntervalsOnUpdate : false,
        isManualInterval : false,
        showAllHistory : true, // Used to determine whether to display all history or max zoom when changing the period
        scalable : true,
        maxPeriodOnIntervalChange :true,
        fixedIntervalOnPeriodChange : false, // Flag to keep the current interval fixed on period change when it is applicable,
        bidAskHistory: false,
        setMaxAvailablePeriod : false, // used to display all the compare data as well when showAllHistory is true, otherwise display compare data only within the data availble range of the main symbol
        marginRight: 80,
        enableUndoRedo: true,
        showDrawingToolbarButtons: true,
        disableDrawingSettingsPanel: true,
        favoriteMenuEnabled: false,
        disableDrawingMove: false,
        customCandleCount: 40,
        candleCountEnable: true,
        disableDrawingMove: false,
        sessionTimeBreakSettings: {
            "I_2": {key: "I_2", label: "2 Min", color: "#363836", lineType: "dash", show: false},
            "I_3":  {key: "I_3", label: "3 Min", color: "#363836", lineType: "dash", show: false},
            "I_5":  {key: "I_5", label: "5 Min", color: "#363836", lineType: "dash", show: false},
            "I_10": {key: "I_10", label: "10 Min", color: "#363836", lineType: "dash", show: false},
            "I_15": {key: "I_15", label: "15 Min", color: "#363836", lineType: "dash", show: false},
            "I_30": {key: "I_30", label: "30 Min", color: "#363836", lineType: "dash", show: false},
            "I_60": {key: "I_60", label: "1 Hour", color: "#363836", lineType: "dash", show: false},
            "I_120": {key: "I_120", label: "2 Hour", color: "#363836", lineType: "dash", show: false},
            "I_240": {key: "I_240", label: "4 Hour", color: "#363836", lineType: "dash", show: false},
            "D": {key: "D", label: "Day", color: "#363836", lineType: "dash", show: false},
            "W": {key: "W", label: "Week", color: "#363836", lineType: "dash", show: false},
            "M": {key: "M", label: "Month", color: "#363836", lineType: "dash", show: false},
            "4M": {key: "4M", label: "Quarter", color: "#363836", lineType: "dash", show: false},
            "Y": {key: "Y", label: "Year", color: "#363836", lineType: "dash", show: false}
        },
        contextMenuOrder: ["eraseColor", "eraseModeON", "eraseModeOFF", "intradayChartON", "intradayChartOFF", "gridLines", "resetX", "resetY", "eraseDrawings", "removeIndicators", "showSettings"]
    },
    indicatorOptions : {
        showCloseBtn : true,
        showParamsInLegend : true,
        disableIndicatorToolTip: false
    },
    alertOptions:{
        containerKey: "trade"
    },
    tradingOptions: {
        enableOrderWindow: true,
        qtyInDecimals : true,
        loadConfirmationPopup: undefined // implement this method to load confirmation popup
    },
    registeredMethods: {
        onUpdateChartTick : undefined, // implement this method if you need to be notified when chart is updated real-time
        lastPrice : undefined, // implement this method if there is a specific way to get last price of the symbol
        onNavigatorScrollStop : undefined, // implement this method if  you need to be notified at the end of scrolling navigator
        afterScalingAxis : undefined, // implement this method if  you need to be notified at the end of scaling axes. First argument contains the object indicating scaled axes.
        beforeScalingAxis : undefined, // implement this method if  you need to be notified just before scaling the. First argument contains the object indicating scaled axes.
        afterYSetExtremes : undefined // implement this method if  you need to be notified after setting yAxis extremes. First argument provides the new extremes.
    },
    lang: {
        language: 'en', pathPrefix: "../js/lang"
    },
    symbol: {
        /*symbol: 'FTSE 100',
         symbolId: 'GB0001383545_indices_232_df',
         symbolDesc: 'FTSE 100',
         symbolType: 'IND',
         dp: 3*/
        /* symbol: 'YAHOO', symbolId: 'US9843321061_acciones_67_df', symbolDesc: 'YAHOO', symbolType: 'EQU', dp: 2*/
        /*symbol: 'telefonica', symbolId: 'ES0178430E18_acciones_55_df',symbolDesc:"Telefonica description",symbolType:"EQU", dp: 2
         symbol: 'GOOG', symbolId: 'GOOG', symbolDesc: 'Google/Reg sh nvt Cl C USD0.001', symbolType: 'EQU', dp: 2*/

        symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency: 'EUR',
        id: 12, tradeSymbol: ""

        /*  symbol: 'DAX',
         symbolId: 'DE0008469008_indices_22_df',
         symbolDesc: 'DAX',
         symbolType: 'IND',
         dp: 3*/

    },
    dataProvider: {
        /*type: 'WEBFG', source: 'WEBFG', url: '/x-one-webfg/dataService/dataRequest?',*/
        type: 'infinit', source: 'SIX', url: '/frontend/request-by-instrument/HST/',
        newsURL: '/rest/news/search?',
        flagServices: [
            {
                type: 'flag1', symbol: 'F', color: 'red',

                url: '../data/flag1?', responseType: 'json',
                setRequestParams: function (symbol, from, to) {
                    return "symbol=" + symbol.symbolId + "&from=" + from + "&to=" + to;
                },
                editResponse: function (response) {
                    return response;
                },
                tooltipFormatter: function (data) {
                    return data[1];
                }
            },
            {
                type: 'flag2', symbol: 'T2', fillColor: '#ff4400', url: '../data/flag2?', responseType: 'json',
                shape: "flag",
                setRequestParams: function (symbol, from, to) {
                    return "s=" + symbol.symbolId + "&f=" + from + "&t=" + to;
                },
                editResponse: function (response) {
                    return response;
                },
                tooltipFormatter: function (data) {
                    return "<div> test tool tip label test tool tip label</div>";
                },
                setData: function (symbol, from, to, callback) {
                    var data;
                    // do your stuff here and set data to 'data' variable

                    callback(data);
                },
                onclick: function (event, data) {
                    // do your stuff here
                }

            }
        ],
        tradingService: {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        },
        alertService: {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        },
        drawingService: {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        },
        templateService : {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        },
        favoriteColorService : {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        },
        globalUserSettingsService : {
            type: 'mock',
            source: 'XC',
            url: "/frontend/"
        }
    },
    toolbar: {
        enable: true,
        top: true,
        left: true,
        right: true,
        upper: true,
        trading: true,
        verticalDropDown: true,
        subLevelToolTipEnabled: false,
        mobileTb: [/*"period", "interval", "chartType", "indicator"*/],
        //tradingTb: ["tradeControl"],
        //upperTb: ["period", "trading"],
        optionsTb : ["volume", "chartType", "grid",  "navigator", "value", "last", "crosshair", "preclose", "tooltip", "minMax", "zoom", "full-screen", "print", "bidAskHistory"],
        //topTb: ["file", "interval", "chartType", "grid", "comparison", "indicator", "volume", "navigator", "value", "last", "crosshair", "preclose", "tooltip", "minMax", "zoom", "full-screen", "print",  "depth", "rightPanel", "bidAskHistory"/*, "flags"*/],
        //leftTb: ["select", "line", "rect", "fibonacci", "andrewsPitchfork", "regression", "label", "arrow", "multiple", "delete"],
        rightTb: ['indicatorPanelView', 'drawingToolPanelView','symbolSettingsPanelView'],
        //upperTb: ["period"],
        upperTb: [],
        topTb: [],
        //topTb: ["optionsDropDown", "file", "chartType", "intervalD", "grid", "comparison", "indicator", "tradeControlCompact", "volume", "navigator", "value", "last", "preclose", "crosshair", "minMax", "tooltip", "print", "depth", "reset", "rightPanel", "bidAskHistory", "spread", "buy", "sell", "undo", "redo"],//"popOut", "full-screen", "layoutFullScreen", "zoom"
        //leftTb: ["select", "label", "line", "rect", "fibonacci", "pattern", "volumeProfile", "arrow", "positions", "multiple", "delete", "lock", "favorite"], //
        leftTb:[],
        tradingTb:[],
        //tradingTb: ["tradeControl"], //, "size"
        // rightTb: ['indicatorPanelView', 'drawingToolPanelView'],
        alwaysCompactToolbar: true,
        config: {
            optionsDropDown: {
                options: [
                    "volume",
                    "chartType",
                    "grid",
                    "value",
                    "navigator",
                    "last",
                    "preclose",
                    "crosshair",
                    "minMax",
                    "tooltip",
                    // "zoom",
                    // "full-screen",
                    "print",
                    "depth", /* "flags"*/
                    //"reset",
                    "rightPanel"
                ]
            },
            file: {
                options: [
                    {key: "saveAsDefault", desc: "Save As Default", label: 'label.saveAsDefault', type: infChart.constants.fileTemplateTypes.file},
                    {key: "removeDefault", desc: "Remove Default", label: 'label.removeDefault', type: infChart.constants.fileTemplateTypes.file},
                    {key: "saveTemplate", desc: "Save Template", label: 'label.saveTemplate', type: infChart.constants.fileTemplateTypes.template},
                    {key: "save", desc: "Save All", label: 'label.saveAll', type: infChart.constants.fileTemplateTypes.all},
                    {key: "loadTemplate", desc: "Load Template", label: 'label.loadTemplate', type: infChart.constants.fileTemplateTypes.template},
                    {key: "load", desc: "Load All", label: 'label.loadAll', type: infChart.constants.fileTemplateTypes.all},
                    {key: "loadDefault", desc: "Load Default", label: 'label.loadDefault', type: infChart.constants.fileTemplateTypes.file},
                    {key: "importTemplates", desc: "Import Templates", label: 'label.importTemplates', type: infChart.constants.fileTemplateTypes.template},
                    {key: "exportTemplates", desc: "Export Templates", label: 'label.exportTemplates', type: infChart.constants.fileTemplateTypes.template}
                ]
            },
            interval: {
                cls : 'interval-dropdown',
                layout : 'button',
                options: [
                    /*{
                        key: "T",
                        desc: "Tick-by-Tick",
                        label: 'label.intervals.T',
                        grouping: false,
                        shortDesc: "T",
                        shortLabel: "label.intervalsShort.T"
                    },*/
                    {
                        key: "I_1",
                        desc: "1 min",
                        label: "label.intervals.1",
                        grouping: false,
                        maxPeriod: 'D_5',
                        shortDesc: "1'",
                        shortLabel: "label.intervalsShort.I_1"
                    },
                    {
                        key: "I_2",
                        desc: "2 min",
                        label: "label.intervals.2",
                        grouping: false,
                        maxPeriod: 'M_1',
                        shortDesc: "2'",
                        shortLabel: "label.intervalsShort.I_2"
                    },
                    {
                        key: "I_3",
                        desc: "3 mins",
                        label: "label.intervals.3",
                        grouping: false,
                        maxPeriod: 'M_1',
                        shortDesc: "3'",
                        shortLabel: "label.intervalsShort.I_3"
                    },
                    {
                        key: "I_5",
                        desc: "5 mins",
                        label: "label.intervals.5",
                        grouping: false,
                        maxPeriod: 'M_3',
                        shortDesc: "5'",
                        shortLabel: "label.intervalsShort.I_5"
                    },
                    {
                        key: "I_10",
                        desc: "10 mins",
                        label: "label.intervals.10",
                        grouping: false,
                        maxPeriod: 'M_6',
                        shortDesc: "10'",
                        shortLabel: "label.intervalsShort.I_10"
                    },
                    {
                        key: "I_15",
                        desc: "15 mins",
                        label: "label.intervals.15",
                        grouping: false,
                        maxPeriod: 'M_6',
                        shortDesc: "15'",
                        shortLabel: "label.intervalsShort.I_15"
                    },
                    {
                        key: "I_30",
                        desc: "30 mins",
                        label: "label.intervals.30",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "30'",
                        shortLabel: "label.intervalsShort.I_30"
                    },
                    {
                        key: "I_60",
                        desc: "1 hr",
                        label: "label.intervals.60",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "60'",
                        shortLabel: "label.intervalsShort.I_60"
                    },
                    {
                        key: "I_120",
                        desc: "2 hrs",
                        label: "label.intervals.120",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "120'",
                        shortLabel: "label.intervalsShort.I_120"
                    },
                    {
                        key: "I_240",
                        desc: "4 hrs",
                        label: "label.intervals.240",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "240'",
                        shortLabel: "label.intervalsShort.I_240"
                    },
                    {
                        key: "I_360",
                        desc: "6 hrs",
                        label: "label.intervals.360",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "360'",
                        shortLabel: "label.intervalsShort.I_360"
                    },
                    {
                        key: "D",
                        desc: "Daily",
                        label: 'label.intervals.D',
                        grouping: false,
                        shortDesc: "D",
                        shortLabel: "label.intervalsShort.D"
                    },
                    {
                        key: "W",
                        desc: "Weekly",
                        label: 'label.intervals.W',
                        grouping: false,
                        shortDesc: "W",
                        shortLabel: "label.intervalsShort.W"
                    },
                    {
                        key: "M",
                        desc: "Monthly",
                        label: 'label.intervals.M',
                        grouping: false,
                        shortDesc: "M",
                        shortLabel: "label.intervalsShort.M"
                    },
                    {
                        key: "Y",
                        desc: "Yearly",
                        label: 'label.intervals.Y',
                        grouping: false,
                        shortDesc: "Y",
                        shortLabel: "label.intervalsShort.Y"
                    }
                ]
            },
            intervalD : {
                compactShowOnly : false
            },
            chartType: {
                options: [
                    {key: "line", desc: "Line", label: 'label.line', ico: 'icon ico-chart-line'},
                    {key: "area", desc: "Area", label: 'label.area', ico: 'icon ico-chart-area'},
                    {key: "column", desc: "Column", label: 'label.column', ico: 'icon ico-chart-column'},
                    {key: "candlestick", desc: "Candlestick", label: 'label.candlestick', ico: 'icon ico-chart-candlestick'},
                    {key: "ohlc", desc: "OHLC", label: 'label.ohlc', ico: 'icon ico-chart-ohlc'},
                    {key: "hlc", desc: "HLC", label: 'label.hlc', ico: 'icon ico-chart-hlc'},
                    {key: "heikinashi", desc: "Heikin Ashi", label: 'label.heikinashi', ico: 'icon ico-chart-candle-ha'},
                    {key: "step", desc: "Step", label: 'label.step', ico: 'icon ico-step'},
                    {key: "point", desc: "Point", label: 'label.point', ico: 'icon ico-chart-points'},
                    {key: "equivolume", desc: "Equi Volume", label: 'label.equivolume', ico: 'icon ico-volume-chart'},
                    {key: "engulfingCandles", desc: "Engulfing Candles", label: 'label.engulfingCandles', ico: 'icon ico-chart-pie'}
                ]
            },
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
                    /*{symbol: 'BMWd', symbolId: 'BMWd.CHX', symbolDesc: 'Bayerische Motoren Werke', symbolType: 'EQU', dp: 3, currency:'EUR' },
                     {symbol: 'BARCl', symbolId: 'BARCl.CHX', symbolDesc: 'Barclays', symbolType: 'EQU', dp: 3, currency:'GBP' },
                     {symbol: 'BAYNd', symbolId: 'BAYNd.CHX', symbolDesc: 'Bayer', symbolType: 'EQU', dp: 3, currency:'EUR' },
                     {symbol: 'ALVd', symbolId: 'ALVd.CHX', symbolDesc: 'Allianz', symbolType: 'EQU', dp: 3, currency:'EUR' }*/
                ]
            },
            periodD : {
                compactShowOnly : true
            },
            period: {
                display : 'I_H_1,I_H_2,I_H_4,I_H_8,I_D_1,I_D_2,I_D_3,W_1,W_2,M_1,M_6,Y_1,Y_2',
                categorized : false,
                shortLabel: false,
                categoryLabelPrefix : 'label.periodCategory.',
                options: [
                    /*{
                        key: "I",
                        desc: "Intraday",
                        shortDesc: 'I',
                        label: 'label.periods.I',
                        shortLabel: 'label.periodShort.I'/!*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*!/
                    },
                    {
                        key: "M_1",
                        desc: "1 Month",
                        shortDesc: '1M',
                        shortLabel: 'label.periodShort.M_1',
                        label: 'label.periods.M_1'/!*,
                     intervals : [ "I_1","I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*!/,
                        category : "M"
                    },
                    {
                        key: "M_3",
                        desc: "3 Months",
                        shortDesc: '3M',
                        label: 'label.periods.M_3',
                        shortLabel: 'label.periodShort.M_3'/!*,
                     intervals : [ "I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*!/,
                        category : "M"
                    },
                    {
                        key: "M_6",
                        desc: "6 Months",
                        shortDesc: '6M',
                        label: 'label.periods.M_6',
                        shortLabel: 'label.periodShort.M_6'/!*,
                     intervals : [  "I_5","D","W","M"]*!/,
                        category : "M"
                    },
                    {
                        key: "Y_1",
                        desc: "1 Year",
                        shortDesc: '1Y',
                        label: 'label.periods.Y_1',
                        shortLabel: 'label.periodShort.Y_1'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_2",
                        desc: "2 Years",
                        shortDesc: '2Y',
                        label: 'label.periods.Y_2',
                        shortLabel: 'label.periodShort.Y_2'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_3",
                        desc: "3 Years",
                        shortDesc: '3Y',
                        label: 'label.periods.Y_3',
                        shortLabel: 'label.periodShort.Y_3'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_5",
                        desc: "5 Years",
                        shortDesc: '5Y',
                        label: 'label.periods.Y_5',
                        shortLabel: 'label.periodShort.Y_5'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_10",
                        desc: "10 Years",
                        shortDesc: '10Y',
                        label: 'label.periods.Y_10',
                        shortLabel: 'label.periodShort.Y_10'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    }*/
                    {
                        key: "I_H_1",
                        desc: "1 Hour",
                        shortDesc: '1H',
                        label: 'label.periods.I_H_1',
                        categoryDefault : true,
                        shortLabel: 'label.periodShort.I_H_1'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "H"
                    },
                    {
                        key: "I_H_2",
                        desc: "2 Hours",
                        shortDesc: '2H',
                        label: 'label.periods.I_H_2',
                        shortLabel: 'label.periodShort.I_H_2'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "H"
                    },
                    {
                        key: "I_H_4",
                        desc: "4 Hours",
                        shortDesc: '4H',
                        label: 'label.periods.I_H_4',
                        shortLabel: 'label.periodShort.I_H_4'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "H"
                    },
                    {
                        key: "I_H_8",
                        desc: "8 Hours ",
                        shortDesc: '8H',
                        label: 'label.periods.I_H_8',
                        shortLabel: 'label.periodShort.I_H_8'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "H"
                    },
                    {
                        key: "I_H_16",
                        desc: "16 Hours",
                        shortDesc: '16H',
                        label: 'label.periods.I_H_16',
                        shortLabel: 'label.periodShort.I_H_16'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "H"
                    },
                    {
                        key: "I_D_1",
                        desc: "1 Day",
                        shortDesc: '1D',
                        label: 'label.periods.I_D_1',
                        categoryDefault : true,
                        shortLabel: 'label.periodShort.I_D_1'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "D"
                    },
                    {
                        key: "I_D_2",
                        desc: "2 Days",
                        shortDesc: '2D',
                        label: 'label.periods.I_D_2',
                        shortLabel: 'label.periodShort.I_D_2'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "D"
                    },
                    {
                        key: "I_D_3",
                        desc: "3 Days",
                        shortDesc: '3D',
                        label: 'label.periods.I_D_3',
                        shortLabel: 'label.periodShort.I_D_3'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "D"
                    },
                    {
                        key: "W_1",
                        desc: "1 Week",
                        shortDesc: '1W',
                        label: 'label.periods.W_1',
                        categoryDefault : true,
                        shortLabel: 'label.periodShort.W_1'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "W"
                    },
                    {
                        key: "W_2",
                        desc: "2 Weeks",
                        shortDesc: '1W',
                        label: 'label.periods.W_2',
                        shortLabel: 'label.periodShort.W_2'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "W"
                    },
                    {
                        key: "W_3",
                        desc: "3 Weeks",
                        shortDesc: '3W',
                        label: 'label.periods.W_3',
                        shortLabel: 'label.periodShort.W_3'/*,
                     intervals : ["T", "I_1","I_5","I_15","I_30","I_60","I_120","I_240"]*/,
                        category : "W"
                    },
                    {
                        key: "M_1",
                        desc: "1 Month",
                        shortDesc: '1M',
                        shortLabel: 'label.periodShort.M_1',
                        categoryDefault : true,
                        label: 'label.periods.M_1'/*,
                     intervals : [ "I_1","I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "M_2",
                        desc: "2 Month",
                        shortDesc: '2M',
                        shortLabel: 'label.periodShort.M_2',
                        categoryDefault : false,
                        label: 'label.periods.M_2'/*,
                     intervals : [ "I_1","I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "M_3",
                        desc: "3 Months",
                        shortDesc: '3M',
                        label: 'label.periods.M_3',
                        shortLabel: 'label.periodShort.M_3'/*,
                     intervals : [ "I_5","I_15","I_30","I_60","I_120","I_240","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "M_6",
                        desc: "6 Months",
                        shortDesc: '6M',
                        label: 'label.periods.M_6',
                        shortLabel: 'label.periodShort.M_6'/*,
                     intervals : [  "I_5","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "M_8",
                        desc: "8 Months",
                        shortDesc: '8M',
                        label: 'label.periods.M_8',
                        shortLabel: 'label.periodShort.M_8'/*,
                     intervals : [  "I_5","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "M_10",
                        desc: "10 Months",
                        shortDesc: '10M',
                        label: 'label.periods.M_10',
                        shortLabel: 'label.periodShort.M_10'/*,
                     intervals : [  "I_5","D","W","M"]*/,
                        category : "M"
                    },
                    {
                        key: "Y_1",
                        desc: "1 Year",
                        shortDesc: '1Y',
                        label: 'label.periods.Y_1',
                        categoryDefault : true,
                        shortLabel: 'label.periodShort.Y_1'/*,
                     intervals : [ "D","W","M"]*/,
                        category : "Y"
                    },
                    {
                        key: "Y_2",
                        desc: "2 Years",
                        shortDesc: '2Y',
                        label: 'label.periods.Y_2',
                        shortLabel: 'label.periodShort.Y_2'/*,
                     intervals : [ "D","W","M"]*/,
                        category : "Y"
                    }/*,
                    {
                        key: "Y_3",
                        desc: "3 Years",
                        shortDesc: '3Y',
                        label: 'label.periods.Y_3',
                        shortLabel: 'label.periodShort.Y_3'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_5",
                        desc: "5 Years",
                        shortDesc: '5Y',
                        label: 'label.periods.Y_5',
                        shortLabel: 'label.periodShort.Y_5'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    },
                    {
                        key: "Y_10",
                        desc: "10 Years",
                        shortDesc: '10Y',
                        label: 'label.periods.Y_10',
                        shortLabel: 'label.periodShort.Y_10'/!*,
                     intervals : [ "D","W","M"]*!/,
                        category : "Y"
                    }*/
                ]
            },
            indicator: {
                options: [
                    {
                        key: 'ADOsci',
                        label: 'label.indicatorDesc.ADOsci',
                        desc: 'Acceleration Deceleration Oscillator (ADOsci)'
                    },
                    {key: 'ADL', label: 'label.indicatorDesc.ADL', desc: 'Accumulation Distribution Line (ADL)'},
                    {key: 'AR', label: 'label.indicatorDesc.AR', desc: 'Aroon (AR)'},
                    {key: 'ARUD', label: 'label.indicatorDesc.ARUD', desc: 'Aroon Up/Down (ARUD)'},
                    {key: 'ADX', label: 'label.indicatorDesc.ADX', desc: 'Average Direction Index (ADX)'},
                    {key: 'ATR', label: 'label.indicatorDesc.ATR', desc: 'Average True Range (ATR)'},
                    {
                        key: 'AwesomeOsci',
                        label: 'label.indicatorDesc.AwesomeOsci',
                        desc: 'Awesome Oscillator (AwesomeOsci)'
                    },
                    {key: 'BB', label: 'label.indicatorDesc.BB', desc: 'Bollinger Bands'},
                    /* {key : 'BA', label : 'label.indicatorDesc.BA', desc : 'Bid/Ask'},*/

                    {key: 'BBW', label: 'label.indicatorDesc.BBW', desc: 'Bollinger Band Width (BBW)'},
                    {key: 'BC', label: 'label.indicatorDesc.BC', desc: 'Benchmark Chart (BC)'},
                    {key: 'BearEng', label: 'label.indicatorDesc.BearEng', desc: 'Bearish Engulfing (BearEng)'},
                    {
                        key: 'BullishEng',
                        label: 'label.indicatorDesc.BullishEng',
                        desc: 'Bullish Engulfing (BullishEng)'
                    },
                    {key: 'CMF', label: 'label.indicatorDesc.CMF', desc: 'Chaikin Money Flow (CMF)'},
                    {key: 'CHO', label: 'label.indicatorDesc.CHO', desc: 'Chaikin Oscillator (CHO)'},
                    {key: 'CCI', label: 'label.indicatorDesc.CCI', desc: 'Commodity Channel Index (CCI)'},
                    {
                        key: 'CoppockCurve',
                        label: 'label.indicatorDesc.CoppockCurve',
                        desc: 'Coppock Curve (CoppockCurve)'
                    },
                    {key: 'RSIC', label: 'label.indicatorDesc.RSIC', desc: 'Cutler RSI (RSIC)'},
                    //{key: 'DarkC', label: 'label.indicatorDesc.DarkC', desc: 'Dark Cloud (DarkC) Indicator'},
                    {key: 'DMIP', label: 'label.indicatorDesc.DMIP', desc: 'Directional Movement Plus (DMI+)'},
                    {key: 'DMIM', label: 'label.indicatorDesc.DMIM', desc: 'Directional Movement Minus (DMI-)'},
                    {key: 'DMI', label: 'label.indicatorDesc.DMI', desc: 'Directional Movement Index (DMI)'},
                    {key: 'DMS', label: 'label.indicatorDesc.DMS', desc: 'Directional Movement System (DMS)'},
                    {key: 'EWO', label: 'label.indicatorDesc.EWO', desc: 'Elliot Wave Oscillator (EWO)'},
                    {key: 'ENV', label: 'label.indicatorDesc.ENV', desc: 'Envelopes (ENV)'},
                    {key: 'EMA', label: 'label.indicatorDesc.EMA', desc: 'Exponential Moving Average (EMA)'},
                    {key: 'STOF', label: 'label.indicatorDesc.STOF', desc: 'Fast Stochastic (STOF)'},
                    {key: 'FUSTO', label: 'label.indicatorDesc.FUSTO', desc: 'Full Stochastic Oscillator(FUSTO)'},
                    {key: 'GMMA', label: 'label.indicatorDesc.GMMA', desc: 'GMMA'},
                    {key: 'GMMAOsci', label: 'label.indicatorDesc.GMMAOsci', desc: 'GMMA Oscillator (GMMAOsci)'},
                    {key: 'HighestH', label: 'label.indicatorDesc.HighestH', desc: 'Highest High (HighestH)'},
                    {key: 'HV', label: 'label.indicatorDesc.HV', desc: 'Historical Volatility (HV)'},
                    {key: 'ICHI', label: 'label.indicatorDesc.ICHI', desc: 'Ichimoku Kinko Hyo (ICHI)'},
                    {key: 'KELT', label: 'label.indicatorDesc.KELT', desc: 'KELT'},
                    {key: 'KST', label: 'label.indicatorDesc.KST', desc: 'Know Sure Thing (KST)'},
                    {key: 'LowestL', label: 'label.indicatorDesc.LowestL', desc: 'Lowest Low (LowestL)'},
                    {key: 'MASS', label: 'label.indicatorDesc.MASS', desc: 'Mass Index (MASS)'},
                    {key: 'MED', label: 'label.indicatorDesc.MED', desc: 'Median Price (MED)'},
                    {key: 'MFI', label: 'label.indicatorDesc.MFI', desc: 'Money Flow Index (MFI)'},
                    {key: 'MOM', label: 'label.indicatorDesc.MOM', desc: 'Momentum (MOM)'},
                    {
                        key: 'MACD',
                        label: 'label.indicatorDesc.MACD',
                        desc: 'Moving Average Convergence Divergence (MACD)'
                    },
                    {key: 'MACDF', label: 'label.indicatorDesc.MACDF', desc: 'MACD Forest (MACDF)'},
                    {
                        key: 'MACDCrossOverZeroSignal',
                        label: 'label.indicatorDesc.MACDCrossOverZeroSignal',
                        desc: 'MACD Cross and Over Zero Signal (MACDCrossOverZeroSignal)'
                    },
                    {
                        key: 'MACDCrossSignal',
                        label: 'label.indicatorDesc.MACDCrossSignal',
                        desc: 'MACD Cross Signal (MACDCrossSignal)'
                    },
                    {key: 'CMA', label: 'label.indicatorDesc.CMA', desc: 'Moving Average Centered (CMA)'},
                    {key: 'MomMA', label: 'label.indicatorDesc.MomMA', desc: 'Moving Average Momentum (MomMA)'},
                    {key: 'TRIMA', label: 'label.indicatorDesc.TRIMA', desc: 'Moving Average Triangular (TRIMA)'},
                    {key: 'MovTrip', label: 'label.indicatorDesc.MovTrip', desc: 'Moving Average Triple (MovTrip)'},
                    {key: 'NVI', label: 'label.indicatorDesc.NVI', desc: 'Negative Volume Index (NVI)'},
                    {key: 'OBV', label: 'label.indicatorDesc.OBV', desc: 'On Balance Volume (OBV)'},
                    {key: 'PVI', label: 'label.indicatorDesc.PVI', desc: 'Positive Volume Index (PVI)'},
                    {key: 'RSI', label: 'label.indicatorDesc.RSI', desc: 'Relative Strength (RSI)'},
                    {key: 'RSL', label: 'label.indicatorDesc.RSL', desc: 'Relative Strength Levy (RSL)'},
                    {key: 'ROC', label: 'label.indicatorDesc.ROC', desc: 'Rate of Change (ROC)'},
                    {key: 'MOVR', label: 'label.indicatorDesc.MOVR', desc: 'Rolling Moving Average (MOVR)'},
                    {key: 'SMA', label: 'label.indicatorDesc.SMA', desc: 'Simple Moving Average (SMA)'},
                    {key: 'STOS', label: 'label.indicatorDesc.STOS', desc: 'Slow Stochastic (STOS)'},
                    {key: 'StdDev', label: 'label.indicatorDesc.StdDev', desc: 'Standard Deviation (StdDev)'},
                    {key: 'SM', label: 'label.indicatorDesc.SM', desc: 'Stochastic Momentum (SM)'},
                    {key: 'SRSI', label: 'label.indicatorDesc.SRSI', desc: 'Stochastic RSI (SRSI)'},
                    {key: 'TRIX', label: 'label.indicatorDesc.TRIX', desc: 'TRIX'},
                    {key: 'TrueR', label: 'label.indicatorDesc.TrueR', desc: 'True Range (TrueR)'},
                    {key: 'TSI', label: 'label.indicatorDesc.TSI', desc: 'True Strength Index (TSI) '},
                    {key: 'UO', label: 'label.indicatorDesc.UO', desc: 'Ultimate Oscillator (UO)'},
                    {key: 'VHF', label: 'label.indicatorDesc.VHF', desc: 'Vertical Horizontal Filter (VHF)'},
                    {key: 'VOLUME_PNL', label: 'label.indicatorDesc.VOLUME_PNL', desc: 'Volume'},
                    {key: 'VMA', label: 'label.indicatorDesc.VMA', desc: 'Volume Moving Average (VMA)'},
                    {key: 'VI', label: 'label.indicatorDesc.VI', desc: 'Vortex Indicator (VI)'},
                    {key: 'WMA', label: 'label.indicatorDesc.WMA', desc: 'Weighted Moving Average (WMA)'},
                    {key: 'WPR', label: 'label.indicatorDesc.WPR', desc: 'Williams&#39; %R (WPR)'},
                    {key: 'SAR', label: 'label.indicatorDesc.SAR', desc: 'Parabolic Stops and Reversals (SAR)'},
                    {key: 'HLRegChannel', label: 'label.indicatorDesc.HLRegChannel', desc: ' High Low Regression Channel'},
                    {key: 'CWI', label: 'label.indicatorDesc.CWI', desc: 'Custom Weight Index'},
                    {key: 'HarmonicPtn', label: 'Harmonic Pattern', desc: 'Harmonic Pattern'},
                    {key: 'Mondays', label: 'Mondays', desc: 'Mondays'},
                    {key: 'ZigZag', label: 'label.indicatorDesc.ZigZag', desc:'Zig Zag'},
                    {key: 'BREAKOUT', label: 'label.indicatorDesc.Breakout', desc: 'Breakout Finder'}
                ]
            },
            select: {
                role: 'disDrawing',
                active: true,
                cat: 'select',
                options : [
                    {
                        cls : 'icon ico-hand-up',
                        active: true,
                        label : 'label.select',
                        role: 'disDrawing',
                        subType: "select"
                    },
                    {
                        key : 'all',
                        active: false,
                        cls : 'icon ico-plus1',
                        label : 'label.showcrosshair',
                        role: 'disDrawing',
                        subType: "all"
                    },
                    {
                        key : 'last',
                        active: false,
                        cls : 'icon ico-ch-last',
                        label : 'label.showCrosshairLast',
                        role: 'disDrawing',
                        subType: "last"
                    }
                ]
            },
            label: {
                role: 'drawing',
                cat: 'label',
                options: [
                    {
                        role: 'drawing',
                        cat: 'label',
                        shape: 'brush',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-brush',
                        active: true,
                        label: 'label.brush',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'label',
                        shape: 'highLowLabels',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-high-low-label',
                        label: 'label.highLowLabels',
                        active: false,
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'label',
                        shape: 'label',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-font',
                        label: 'label.label',
                        active: false,
                        isFavorite: true
                    }
                ]
            },
            line: {
                role: 'drawing',
                cat: 'line',
                shape: 'line',
                options: [
                    {
                        role: 'drawing',
                        cat: 'line',
                        shape: 'line',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-ang-dash',
                        active: true,
                        label: 'label.line',
                        isFavorite: false
                    },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'lineArrow',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icom icom-arrow',
                    //     active: false,
                    //     label: 'label.lineArrow',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'ray',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon icom-ray',
                    //     active: false,
                    //     label: 'label.ray',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'extendedLine',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icom icom-extended',
                    //     active: false,
                    //     label: 'label.extendedLine',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'horizontalLine',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-dash-1',
                    //     active: false,
                    //     label: 'label.horizontalLine',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'horizontalRay',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icom icom-horizontal-ray',
                    //     active: false,
                    //     label: 'label.horizontalRay',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'verticalLine',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-dash-2',
                    //     active: false,
                    //     label: 'label.verticalLine',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'trendChannel',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-d-dash',
                    //     active: false,
                    //     label: 'label.trendChannel',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'regressionLine',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-chart4',
                    //     active: false,
                    //     label: 'label.regressionLine',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'regressionChannel',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-chart5',
                    //     active: false,
                    //     label: 'label.regressionChannel',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'line',
                    //     shape: 'polyline',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon icom-poly-line',
                    //     active: false,
                    //     label: 'label.polyline',
                    //     isFavorite: false
                    // },
                    // {
                    //     role: 'drawing',
                    //     cat: 'andrewsPitchfork',
                    //     shape: 'andrewsPitchfork',
                    //     subType: infChart.constants.drawingTypes.shape,
                    //     cls: 'icon ico-line33',
                    //     active: false,
                    //     label: 'label.andrewsPitchfork',
                    //     isFavorite: false
                    // }
                ]
            },
            rect: {
                role: 'drawing',
                cat: 'rect',
                options: [
                    {
                        role: 'drawing',
                        cat: 'rect',
                        shape: 'rectangle',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-square-line',
                        active: true,
                        label: 'label.rectangle',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'rect',
                        shape: 'ellipse',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-circle-line',
                        active: false,
                        label: 'label.ellipse',
                        isFavorite: false
                    },
                ]
            },
            fibonacci: {
                role: 'drawing',
                cat: 'fibonacci',
                options: [
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fibFans',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-3line',
                        active: true,
                        label: 'label.fibFans',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fibVerRetracements',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-dashedv',
                        active: false,
                        label: 'label.fibVerRetracements',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fibRetracements',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-dashedh',
                        active: false,
                        label: 'label.fibRetracements',
                        isFavorite: true
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fibArcs',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-arch1',
                        active: false,
                        label: 'label.fibArcs',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fib3PointPriceProjectionGeneric',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-generic-tool',
                        active: false,
                        label: 'label.fib3PointPriceProjectionGeneric',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fib3PointPriceProjectionHLH',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-fib-3-points-hlh',
                        active: false,
                        label: 'label.fib3PointPriceProjectionHLH',
                        isFavorite: true
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fib3PointPriceProjectionLHL',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-fib-3-points-lhl',
                        active: false,
                        label: 'label.fib3PointPriceProjectionLHL',
                        isFavorite: true
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fib3PointTimeProjection',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-fib-3-points-time',
                        active: false,
                        label: 'label.fib3PointTimeProjection',
                        isFavorite: true
                    },
                    {
                        role: 'drawing',
                        cat: 'fibonacci',
                        shape: 'fib2PointTimeProjection',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-fib-2-points-time',
                        active: false,
                        label: 'label.fib2PointTimeProjection',
                        isFavorite: true
                    }
                ]
            },
            pattern: {
                role: "drawing",
                cat: "pattern",
                options: [
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'harmonicPattern',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-line33',
                        active: true,
                        label: 'label.harmonicPattern',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'abcdPattern',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-line33',
                        active: false,
                        label: 'label.abcdPattern',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'elliotTriangleWave',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon icom-elliot-triangle-wave',
                        active: false,
                        label: 'label.elliotTriangleWave',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'elliotImpulseWave',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon icom-elliot-impulsive-wave',
                        active: false,
                        label: 'label.elliotImpulseWave',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'elliotCorrectiveWave',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon icom-elliot-corrective-wave',
                        active: false,
                        label: 'label.elliotCorrectiveWave',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'elliotCorrectiveDoubleWave',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon icom-elliot-corrective-double-wave',
                        active: false,
                        label: 'label.elliotCorrectiveDoubleWave',
                        isFavorite: false
                    },
                    {
                        role: "drawing",
                        cat: "pattern",
                        shape: 'correctiveTripleWave',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon icom-elliot-corrective-triple-wave',
                        active: false,
                        label: 'label.correctiveTripleWave',
                        isFavorite: false
                    },
                ]
            },
            volumeProfile: {
                role: 'drawing',
                cat: 'volumeProfile',
                options: [
                    {
                        role: 'drawing',
                        cat: 'volumeProfile',
                        shape: 'volumeProfile',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-volume-profile-1',
                        label: 'label.volumeProfile',
                        active: true,
                        isFavorite: false
                    }
                ]
            },
            arrow: {
                role: 'drawing',
                cat: 'arrow',
                options: [
                    {
                        role: 'drawing',
                        cat: 'arrow',
                        shape: 'upArrow',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-up',
                        active: true,
                        style: "color:#336699",
                        label: 'label.upArrow',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'arrow',
                        shape: 'downArrow',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icon ico-down',
                        active: false,
                        style: "color:#FF4D4D",
                        label: 'label.downArrow',
                        isFavorite: false
                    }
                ]
            },
            positions: {
                role: 'drawing',
                cat: 'positions',
                options: [
                    {
                        role: 'drawing',
                        cat: 'positions',
                        shape: 'shortLine',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom  icom-line-arrow-down',
                        active: true,
                        label: 'label.shortLine',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'positions',
                        shape: 'longLine',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom  icom-line-arrow-up',
                        active: false,
                        label: 'label.longLine',
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'positions',
                        shape: 'longPositions',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-long-position',
                        label: 'label.longPositions',
                        style: "color:#336699",
                        active: false,
                        isFavorite: false
                    },
                    {
                        role: 'drawing',
                        cat: 'positions',
                        shape: 'shortPositions',
                        subType: infChart.constants.drawingTypes.shape,
                        cls: 'icom icom-short-position',
                        label: 'label.shortPositions',
                        style: "color:#FF4D4D",
                        active: false,
                        isFavorite: false
                    },
                ]
            },
            multiple: {
                role: 'multipleDrawing',
                cls: 'icon ico-mul-pencil',
                label: 'label.multipleDrawing'
            },
            lock: {
                role: 'globalLock',
                cls: 'icom icom-lock ',
                label: 'label.globalLock'
            },
            "delete": {
                role: 'delDrawing',
                cat: "delete",
                cls: 'icon ico-trash-bin',
                options: [
                    {
                        cls: 'icon ico-trash-bin',
                        active: true,
                        label: 'label.eraseDrawing',
                        role: 'delDrawing',
                        subType: "deleteDrawing"
                    },
                    {
                        active: false,
                        cls: 'icom icom-delete-levels',
                        label: 'label.eraseDrawingLevels',
                        role: 'delLevel',
                        subType: "deleteLevels"
                    },
                    {
                        active: false,
                        cls: 'icom icom-trash-all-o',
                        label: 'label.eraseAllDrawing',
                        role: 'deleteAllDrawing',
                        subType: "deleteAllDrawing"
                    }
                ]
            },
            "favorite": {
                role: 'favorite',
                cls: 'icon ico-bookmark-star-favorite active',
                label: 'label.favorite'
            },
            "leftTBToggleButton": {
                label: 'label.leftToolbarToggle',
                showCls: 'icon ico-angle-left',
                hideCls: 'icon ico-angle-right'
            },
            "leftTBScrollButtons": {
                top: {
                    cls: 'icon ico-angle-top'
                },
                bottom: {
                    cls: 'icon ico-angle-bottom'
                }
            },
            crosshair : {
                options : [
                    {key : 'all', ico : 'icon ico-plus1', label : 'label.showcrosshair'},
                    {key : 'last', ico : 'icon ico-ch-last', label : 'label.showCrosshairLast'}
                ]
            },
            trading: {
                role: 'drawing',
                cat: 'trading',
                options: []
            },
            value: {},
            last: {},
            adv: {},
            news: {
                click: function () {
                    alert('news click');
                }
            },
            minMax: {
                minField: 'low',
                maxField: 'high'
            },
            flags: {
                options: [
                    {type: 'flag1', label: 'label.flags.flag1', desc: 'Flag1 (F1)'},
                    {type: 'flag2', label: 'label.flags.flag2', desc: 'Flag1 (F2)'}
                ]
            },
            print: {
                options: [
                    {key: "print", label: "label.printSVG", ico: "icon ico-printer-1"},
                    {key: "png", label: "label.exportPNG", ico: "icon ico-png"},
                    {key: "jpg", label: "label.exportJPG", ico: "icon ico-jpg"},
                    {key: "svg", label: "label.exportSVG", ico: "icon ico-svg"}
                ]
            },
            grid: {
                options: [
                    {key: "all", desc: "All", label: 'label.gridTypes.all', ico: 'icon ico-shape15'},
                    {key: "horizontal", desc: "Horizontal", label: 'label.gridTypes.horizontal', ico: 'icon ico-shape7'},
                    {key: "vertical", desc: "Vertical", label: 'label.gridTypes.vertical', ico: 'icon ico-shape3'},
                    {key: "none", desc: "None", label: 'label.gridTypes.none', ico: 'icon ico-shape1'}
                ]
            },
            tradingPanel: {
                active: 'detail',
                positions: {
                    active: "summary",
                    options: [
                        {key: "summary", desc: "summary", label: 'label.summary', ico: 'icon ico-shape15'}
                    ]
                },
                tradingOptions: {}
            },
            depth: {
                maxWidth:300,
                maxHeight:150,
                options: [
                    {key: "right", desc: "Book Volume on main chart", label: 'label.depthTypes.right', ico: 'icon ico-book-volume-1'},
                    {key: "bottom", desc: "Book Volume on separate axis", label: 'label.depthTypes.bottom', ico: 'icon ico-book-volume-2'}
                ]
            },
            'indicatorPanelView' : {
                'icon' : 'icon ico-indicators',
                'label' : 'label.indicatorPanelView'
            },
            'drawingToolPanelView' : {
                'icon' : 'icon ico-brush',
                'label' : 'label.drawingToolPanelView'
            },
            'symbolSettingsPanelView' : {
                'icon' : 'icon ico-comparisons',
                'label' : 'label.symbolSettingsPanelView'
            },

            reset: {
                icon: 'icon ico-reset-settings',
                title: 'Reset Saved Settings for Currency Pair',
                onClick: function (chartId) {
                    //
                }
            },
            tradeControl: {
                options: [
                    {
                        ctrl: 'buy',
                        locLabel: 'label.buy',
                        btnText: 'Buy',
                        key: 'buy-order',//"buy-order"
                        btnClass: 'btn-content btn-buy clearfix',
                        iconClass: 'fa fa-arrow-left'
                    },
                    {
                        ctrl: 'sell',
                        locLabel: 'label.sell',
                        btnText: 'Sell',
                        key: 'sell-order',//"sell-order"
                        btnClass: 'btn-content btn-sell clearfix',
                        iconClass: 'fa fa-arrow-right'
                    },
                    {
                        ctrl: 'size',
                        btnText: 'Size',
                        key: 'order-size',
                        divClass: 'size-content',
                        titleCtrl: 'size-title'
                    },
                    {
                        ctrl: 'algo-buy',
                        locLabel: 'T',
                        btnText: 'rend',
                        key: 'buy-algo-order',//"buy-order"
                        btnClass: 'btn-content btn-algo-buy clearfix',
                        textClass: 'tiny-text',
                        title: 'Trend Buy'
                    },
                    {
                        ctrl: 'algo-sell',
                        locLabel: 'T',
                        btnText: 'rend',
                        key: 'sell-algo-order',//"sell-order"
                        btnClass: 'btn-content btn-algo-sell clearfix',
                        textClass: 'tiny-text',
                        title: 'Trend Sell'
                    }
                ]
            },
            tradeControlCompact: {
                baseClass: 'compact-show trade-controls',
                // menuClass : 'trade-controls',
                options: [
                    {
                        key: "sell-order",
                        cssClass: 'sell',
                        html: '<a><span inf-ref="sell"></span><span><span class="text-label">Sell</span><span class="text-icon"><i class="fa fa-arrow-left"></i></span></span></a>'
                    },
                    {
                        key: "buy-order",
                        cssClass: 'buy',
                        html: '<a><span inf-ref="buy"></span><span><span class="text-label">Buy</span><span class="text-icon"><i class="fa fa-arrow-right"></i></span></span></a>'
                    },
                    {
                        key: "sell-algo-order",
                        cssClass: 'sell btn-algo-sell',
                        html: '<a><span>T<span class="tiny-text">rend</span></span><span><span class="text-label">Sell</span><span class="text-icon"><i class="fa fa-arrow-left"></i></span></span></a>'
                        // html: '<a><span>Trend </span><span><span class="text-label">Sell</span><span class="text-icon"><i class="fa fa-arrow-left"></i></span></span></a>'
                    },
                    {
                        key: "buy-algo-order",
                        cssClass: 'buy btn-algo-buy',
                        html: '<a><span>T<span class="tiny-text">rend</span></span><span><span class="text-label">Buy</span><span class="text-icon"><i class="fa fa-arrow-right"></i></span></span></a>'
                        // html: '<a><span>Trend </span><span><span class="text-label">Buy</span><span class="text-icon"><i class="fa fa-arrow-right"></i></span></span></a>'
                    }
                ]
            },
            bidAskHistory: {
                layout: '',
                type: "BAH"
            },
            volume: {
                type: "VOLUME"
            },
            spread: {
                type: "SPREAD"
            },
            buy:{
                compactShowOnly : true,
                ctrl: 'buy',
                locLabel: 'label.buy',
                btnText: 'Buy',
                key: 'buy-order',//"buy-order"
                btnClass: 'btn-content btn-buy clearfix',
                iconClass: 'fa fa-arrow-left'
            },
            sell:{
                compactShowOnly : true,
                ctrl: 'sell',
                locLabel: 'label.sell',
                btnText: 'Sell',
                key: 'sell-order',//"sell-order"
                btnClass: 'btn-content btn-sell clearfix',
                iconClass: 'fa fa-arrow-right'
            },
            undo: {title: "label.undo", icon: "fa fa-reply"},
            redo: {title: "label.redo", icon: "fa fa-share"},
            quickDrawingSettings: {
                settings: {
                    role: 'settingDrawing',
                    ctrl: "settings",
                    cls: 'icon ico-cog-gear',
                    label: 'label.settings',
                    btnClass: 'is-settings'
                },
                delete: {
                    role: 'delDrawing',
                    ctrl: "delete",
                    cls: 'icon ico-trash-bin',
                    label: 'label.eraseDrawing',
                    btnClass: 'is-delete'
                },
                lock: {
                    role: 'delDrawing',
                    ctrl: "lock",
                    cls: 'icom icom-unlock',
                    secondaryCls : 'icom icom-lock',
                    label: 'label.lock',
                    secondaryLabel : 'label.unlock',
                    btnClass: 'is-delete'
                }
            }
        }
    },
    contextMenu : {
        enabled : true,
        drawing : {
            enabled : true,
            options : {
                "copyToClipboard" : {
                    icon : "",
                    displayText : "Copy Text"
                },
                "eraseAll" : {
                    icon : "icom icom-trash-o",
                    displayText : "Erase All Drawings"
                },
                "settings" : {
                    icon : "icom icom-cog",
                    displayText : "Settings"
                },
                "erase" : {
                    icon : "icom icom-trash-o",
                    displayText : "Erase"
                },
                "eraseModeON" : {
                    icon : "icom icom-delete-levels-on",
                    displayText : "Erase Mode : ON"
                },
                "eraseModeOFF" : {
                    icon : "icom icom-delete-levels-off",
                    displayText : "Erase Mode : OFF"
                },
                "eraseGroup" : {
                    icon : "icom icom-trash-o",
                    displayText: "Erase Drawing"
                },
                "unlock": {
                    icon: "icom icom-unlock",
                    displayText: "Unlock"
                },
                "lock": {
                    icon: "icom icom-lock",
                    displayText: "Lock"
                }
            }
        },
        indicator: {
            enabled: true,
            options: {
                settings: {
                    icon : "icom icom-cog",
                    displayText : "Settings"
                },
                resetX: {
                    icon : "icom icom-refresh",
                    displayText : "Reset Chart X"
                },
                resetY: {
                    icon : "icom icom-refresh",
                    displayText : "Reset Chart Y"
                },
                removeIndicator: {
                    icon: "icom ico-trash-bin",
                    displayText: "Remove Indicator"
                }
            }
        },
        yAxis: {
            enabled: true,
            options: {
                lastPriceLabel: {
                    icon : "icom icom-check",
                    displayText : "Last Price"
                },
                lastPriceLine: {
                    icon : "icom icom-check",
                    displayText : "Last Price"
                },
                barClosureTime: {
                    icon : "icom icom-check",
                    displayText : "Bar Closure Time"
                },
                bidAskLine: {
                    icon : "icom icom-check",
                    displayText : "Bid/Ask"
                },
                bidAskLabel: {
                    icon : "icom icom-check",
                    displayText : "Bid/Ask"
                },
                labels: {
                    displayText : "Labels"
                },
                lines: {
                    displayText : "Lines"
                },
                resetYAxis: {
                    icon : "icom icom-reset",
                    displayText : "Reset Y Axis"
                }

            }
        },
        favoriteDrawing: {
            enabled: true,
            options: {
                remove: {
                    icon : "icom ico-trash-bin",
                    displayText : "Remove From Favorites"
                }
            }
        },
        xAxis: {
            enabled: true,
            options: {
                resetX: {
                    icon: "icom icom-refresh",
                    displayText: "Reset Chart X"
                },
                timeBreaks: {
                    icon: "icom icom-check",
                    displayText: "Time Breaks",
                    none: {
                        icon: "icon ico-shape1",
                        displayText: "None"
                    }
                }
            }
        },
        custom: {
            enabled: true,
            options: {
                "eraseColor" : {
                    icon : "icom icom-trash-o",
                    displayText : "Remove Color"
                }
            }
        },
        default: {
            enabled: true,
            options: {
                settings: {
                    icon : "icom icom-cog",
                    displayText : "Settings"
                },
                resetX: {
                    icon : "icom icom-refresh",
                    displayText : "Reset Chart X"
                },
                resetY: {
                    icon : "icom icom-refresh",
                    displayText : "Reset Chart Y"
                },
                eraseModeON : {
                    icon : "icom icom-delete-levels-on",
                    displayText : "Erase Mode : ON"
                },
                eraseModeOFF : {
                    icon : "icom icom-delete-levels-off",
                    displayText : "Erase Mode : OFF"
                },
                eraseDrawings: {
                    icon : "icom ico-trash-bin",
                    displayText : "Remove All Drawings"
                },
                removeIndicators: {
                    icon: "icom ico-trash-bin",
                    displayText: "Remove All Indicators"
                },
                gridLines: {
                    icon: "icon ico-shape7",
                    displayText: "Grid Lines",
                    all: {
                        icon: "icon ico-shape15",
                        displayText: "All",
                    },
                    horizontal: {
                        icon: "icon ico-shape7",
                        displayText: "Horizontal",
                    },
                    vertical: {
                        icon: "icon ico-shape3",
                        displayText: "Vertical",
                    },
                    none: {
                        icon: "icon ico-shape1",
                        displayText: "None"
                    }
                },
                "intradayChartOFF" : {
                    icon : "icom icom-intraday-chart-off",
                    displayText : "Candle Info : OFF"
                },
                "intradayChartON" : {
                    icon : "icom icom-intraday-chart-on",
                    displayText : "Candle Info : ON"
                }
            }
        }
    },
    drawingSettings : {
        fibonacci: {
            isContinuousMode : false
        }
    },
    favourtieColors : ["#070fe8", "#09f2ea", "#09f238", "#cbf209", "#f27209"]
};

infChart.intradayChartConfig = {
    'credits' : {
        enabled: false
    },
    'chart' : {
        type: 'candlestick'
    },
    'xAxis' : {
        id: 'intraday_xAxis',
        type: "datetime",
        gridLineWidth: 1,
        ordinal : false,
        labels: {
            showFirstLabel: true,
            showLastLabel: false,
            staggerLines: 1,
            style: {textOverflow: 'unset'},
            formatter: function () {
                return infChart.manager.xAxisLabelFormatter(this);
            }
        },
    },
    'yAxis' : [
        {
            id: "intraday_yAxis",
            gridLineWidth: 1,
            title: {
                text: ""
            },
            opposite: true,
            infBaseYAxis: true,
            labels: {
                align: "left",
                x: 8,
                y: 5,
                style: {textOverflow: 'unset'},
                formatter: function () {
                    return infChart.manager.yAxisLabelFormatter(this, true);
                }
            },
        }
    ],
    'plotOptions': {
        candlestick: {
            lineWidth : 2,
        }
    },
    'tooltip': {
        enabled: false
    },
    'series' : [
        {
            data: [],
            id: "intraday_series",
            type: 'candlestick',
            name: "IntradaySeries",
            infType: "base",
            showInNavigator: true,
            kdNow: true
        }
    ],
    'legend' : {
        enabled: false
    },
    'title' : {
        text: ""
    }
};

infChart.intradayChartSettings = {
    toolbar: {
        items: ["intradayChartType", "intradayInterval"],
        config: {
            intradayChartType: {
                options: [
                    {key: "line", desc: "Line", label: 'label.line', ico: 'icon ico-chart-line'},
                    {key: "area", desc: "Area", label: 'label.area', ico: 'icon ico-chart-area'},
                    {key: "column", desc: "Column", label: 'label.column', ico: 'icon ico-chart-column'},
                    {key: "candlestick", desc: "Candlestick", label: 'label.candlestick', ico: 'icon ico-chart-candlestick'},
                    {key: "ohlc", desc: "OHLC", label: 'label.ohlc', ico: 'icon ico-chart-ohlc'},
                    {key: "hlc", desc: "HLC", label: 'label.hlc', ico: 'icon ico-chart-hlc'}
                ]
            },
            intradayInterval: {
                enableIntervals: {
                    'I_2': ['I_1'],
                    'I_3': ['I_1'],
                    'I_5': ['I_1', 'I_2', 'I_1'],
                    'I_10': ['I_2', 'I_3', 'I_5'],
                    'I_15': ['I_3', 'I_5', 'I_10'],
                    'I_30': ['I_5', 'I_10', 'I_15'],
                    'I_60': ['I_10', 'I_15', 'I_30'],
                    'I_120': ['I_15', 'I_30', 'I_60'],
                    'I_240': ['I_60', 'I_60', 'I_120'],
                    'D': ['I_60', 'I_120', 'I_240'],
                    'W': ['D'],
                    'M': ['W'],
                },
                options: {
                    I_1: {
                        key: "I_1",
                        desc: "1 min",
                        label: "label.intervals.1",
                        grouping: false,
                        maxPeriod: 'D_5',
                        shortDesc: "1m",
                        shortLabel: "label.intervalsShort.I_1"
                    },
                    I_2: {
                        key: "I_2",
                        desc: "2 min",
                        label: "label.intervals.2",
                        grouping: false,
                        maxPeriod: 'M_1',
                        shortDesc: "2m",
                        shortLabel: "label.intervalsShort.I_2"
                    },
                    I_3: {
                        key: "I_3",
                        desc: "3 mins",
                        label: "label.intervals.3",
                        grouping: false,
                        maxPeriod: 'M_1',
                        shortDesc: "3m",
                        shortLabel: "label.intervalsShort.I_3"
                    },
                    I_5: {
                        key: "I_5",
                        desc: "5 mins",
                        label: "label.intervals.5",
                        grouping: false,
                        maxPeriod: 'M_3',
                        shortDesc: "5m",
                        shortLabel: "label.intervalsShort.I_5"
                    },
                    I_10: {
                        key: "I_10",
                        desc: "10 mins",
                        label: "label.intervals.10",
                        grouping: false,
                        maxPeriod: 'M_6',
                        shortDesc: "10m",
                        shortLabel: "label.intervalsShort.I_10"
                    },
                    I_15: {
                        key: "I_15",
                        desc: "15 mins",
                        label: "label.intervals.15",
                        grouping: false,
                        maxPeriod: 'M_6',
                        shortDesc: "15m",
                        shortLabel: "label.intervalsShort.I_15"
                    },
                    I_30: {
                        key: "I_30",
                        desc: "30 mins",
                        label: "label.intervals.30",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "30m",
                        shortLabel: "label.intervalsShort.I_30"
                    },
                    I_60: {
                        key: "I_60",
                        desc: "1 hr",
                        label: "label.intervals.60",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "1H",
                        shortLabel: "label.intervalsShort.I_60"
                    },
                    I_120: {
                        key: "I_120",
                        desc: "2 hrs",
                        label: "label.intervals.120",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "2H",
                        shortLabel: "label.intervalsShort.I_120"
                    },
                    I_240: {
                        key: "I_240",
                        desc: "4 hrs",
                        label: "label.intervals.240",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "2H",
                        shortLabel: "label.intervalsShort.I_240"
                    },
                    I_360: {
                        key: "I_360",
                        desc: "6 hrs",
                        label: "label.intervals.360",
                        grouping: false,
                        maxPeriod: 'Y_1',
                        shortDesc: "6H",
                        shortLabel: "label.intervalsShort.I_360"
                    },
                    D: {
                        key: "D",
                        desc: "Daily",
                        label: 'label.intervals.D',
                        grouping: false,
                        shortDesc: "D",
                        shortLabel: "label.intervalsShort.D"
                    },
                    W: {
                        key: "W",
                        desc: "Weekly",
                        label: 'label.intervals.W',
                        grouping: false,
                        shortDesc: "W",
                        shortLabel: "label.intervalsShort.W"
                    },
                    M: {
                        key: "M",
                        desc: "Monthly",
                        label: 'label.intervals.M',
                        grouping: false,
                        shortDesc: "M",
                        shortLabel: "label.intervalsShort.M"
                    },
                    Y: {
                        key: "Y",
                        desc: "Yearly",
                        label: 'label.intervals.Y',
                        grouping: false,
                        shortDesc: "Y",
                        shortLabel: "label.intervalsShort.Y"
                    }
                }
            }
        }
    }
};

