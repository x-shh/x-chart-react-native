window.infChart = window.infChart || {};

infChart.fib3PointPriceProjectionGenericDrawing = function () {
    this.closeIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1NzYgNTc2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NzYgNTc2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6Izg2ODY4Njt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+CjxnPgoJPGcgaWQ9Imljb21vb24taWdub3JlIj4KCTwvZz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yODgsMS41QzEyOS44LDEuNSwxLjUsMTI5LjgsMS41LDI4OFMxMjkuOCw1NzQuNSwyODgsNTc0LjVTNTc0LjUsNDQ2LjIsNTc0LjUsMjg4UzQ0Ni4yLDEuNSwyODgsMS41eiIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTMzNC4yLDI4OGw3OS4xLTc5LjFjMTIuOC0xMi44LDEyLjgtMzMuNCwwLTQ2LjJsMCwwYy0xMi44LTEyLjgtMzMuNC0xMi44LTQ2LjIsMEwyODgsMjQxLjhsLTc5LjEtNzkuMQoJCWMtMTIuOC0xMi44LTMzLjQtMTIuOC00Ni4yLDBsMCwwYy0xMi44LDEyLjgtMTIuOCwzMy40LDAsNDYuMmw3OS4xLDc5LjFsLTc5LjEsNzkuMWMtMTIuOCwxMi44LTEyLjgsMzMuNCwwLDQ2LjJsMCwwCgkJYzEyLjgsMTIuOCwzMy40LDEyLjgsNDYuMiwwbDc5LjEtNzkuMWw3OS4xLDc5LjFjMTIuOCwxMi44LDMzLjQsMTIuOCw0Ni4yLDBsMCwwYzEyLjgtMTIuOCwxMi44LTMzLjQsMC00Ni4yTDMzNC4yLDI4OHoiLz4KPC9nPgo8L3N2Zz4K" alt="Close" />';
    infChart.drawingObject.apply(this, arguments);
    this.fibLevels = [
        {
            id: 'level_0',
            value: 0.0,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_1',
            value: 23.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_2',
            value: 38.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_3',
            value: 50,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_4',
            value: 61.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_5',
            value: 78.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_6',
            value: 100,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_7',
            value: 127.2,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#800e56',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_8',
            value: 161.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#4b0832',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_9',
            value: 200,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_10',
            value: 261.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_11',
            value: 300,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_12',
            value: 361.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_13',
            value: 461.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_14',
            value: 561.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_15',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#959595',
            lineWidth: 1,
            fontColor: '#959595',
            fontSize: '10',
            fontWeight: 'normal'
        }
    ];
    this.fibExtentionLevels = [
        {
            id: 'level_0',
            value: 0.0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_1',
            value: 23.6,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_2',
            value: 38.2,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_3',
            value: 50,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_4',
            value: 61.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_5',
            value: 78.6,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_6',
            value: 100,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_7',
            value: 127.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#800e56',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_8',
            value: 161.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#4b0832',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_9',
            value: 200,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_10',
            value: 261.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_11',
            value: 300,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_12',
            value: 361.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_13',
            value: 461.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_14',
            value: 561.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_15',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#0099FF',
            lineWidth: 1,
            fontColor: '#0099FF',
            fontSize: '10',
            fontWeight: 'normal'
        },
    ];
    this.fibRetrancementLevels = [
        {
            id: 'level_0',
            value: 0.0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_1',
            value: 23.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#835974',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_2',
            value: 38.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_3',
            value: 50,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_4',
            value: 61.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_5',
            value: 78.6,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_6',
            value: 100,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_7',
            value: 127.2,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#800e56',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_8',
            value: 161.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#4b0832',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_9',
            value: 200,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_10',
            value: 261.8,
            enable: true,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#726a6f',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_11',
            value: 300,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#7b6171',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_12',
            value: 361.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f8bce2',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_13',
            value: 461.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#f075c3',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_14',
            value: 561.8,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#eb40ab',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        },
        {
            id: 'level_15',
            value: 0,
            enable: false,
            drawingPosX: -41,
            drawingPosY: 7,
            fillColor: '#c71585',
            lineColor: '#FF9933',
            lineWidth: 1,
            fontColor: '#FF9933',
            fontSize: '10',
            fontWeight: 'normal'
        }
    ];
    this.fibRetrancementAdditionalDrawing = {};
    this.settings = {};
    this.defaultDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'mainDrawing'});
    this.fibLevelDragSupporterStyles = Object.assign({}, infChart.drawingUtils.common.dragSupporterStyles, {cursor: 'pointer', type:'fibLevelDrawing'});
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.fib3PointPriceProjectionGenericDrawing.prototype.select = function(event){
    var self = this,
    ann = self.annotation,
    options = ann.options;

    if (event && event.target) {
        var drawingtype = event.target.getAttribute('type');
        if (drawingtype) {
            if (drawingtype == "mainDrawing") {
                options.selectedDrawing = "mainDrawing";
            }
            if (drawingtype == "fibLevelDrawing") {
                options.selectedDrawing = "fibLevelDrawing";
            }
        } else if (event.target.parentNode && event.target.parentNode.getAttribute('type')) {
            //this used when clicked on levels of start, end, trend
            var drawingtype = event.target.parentNode.getAttribute('type');
            if (drawingtype == "fibLevelDrawing") {
                options.selectedDrawing = "fibLevelDrawing";
            }
        } else {
            //this used when clicked on fibbonacci levels
            if (event.target.parentNode.parentNode && event.target.parentNode.parentNode.getAttribute('type')) {
                var drawingtype = event.target.parentNode.parentNode.getAttribute('type');
                if (drawingtype == "fibLevelDrawing") {
                    options.selectedDrawing = "fibLevelDrawing";
                }
            }
        }
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
        var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
            newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(options.xValue);
        var nearestYValue, newY;
        if(futureValue >= nearestDataPointForXValue.xData){
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, self.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  options.isSnapTopHighLow));
        } else {
            nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValue));
        }
        newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue);

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, newY);

    if (options.trendXValue !== Number.MIN_SAFE_INTEGER && options.trendYValue !== Number.MIN_SAFE_INTEGER) {
        var labelAttr = {
            'color': ann.options.shape.params.stroke,
            fontSize: "12px"
        };
            
        var fibExtentionLevels = options.fibExtentionLevels ?  options.fibExtentionLevels : this.fibExtentionLevels, 
            fibRetrancementLevels = options.fibRetrancementLevels ?  options.fibRetrancementLevels : this.fibRetrancementLevels,
            additionalDrawingsArr = self.additionalDrawings,
            fibonacciDrawingsArr = self.fibonacciDrawings,
            theme = infChart.drawingUtils.common.getTheme.call(this),
            drawingFillAttr,
            drawingAttr,
            baseFillOpacityExtention = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibExtention && typeof theme.fib3PointPriceProjectionGeneric.fibExtention.fillOpacity !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibExtention.fillOpacity : infChart.drawingUtils.common.baseFillOpacity,
            baseFontColorExtention = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibExtention && typeof theme.fib3PointPriceProjectionGeneric.fibExtention.fontColor !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibExtention.fontColor : infChart.drawingUtils.common.baseFontColor,
            baseFontSizeExtention = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibExtention && typeof theme.fib3PointPriceProjectionGeneric.fibExtention.fontSize !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibExtention.fontSize : infChart.drawingUtils.common.baseFontSize,
            baseFontWeightExtention = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibExtention && typeof theme.fib3PointPriceProjectionGeneric.fibExtention.fontWeight !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibExtention.fontWeight : infChart.drawingUtils.common.fontWeight;


        fibonacciDrawingsArr.labels = {};
        fibonacciDrawingsArr.lines = {};
        fibonacciDrawingsArr.fill = {};
        fibonacciDrawingsArr.hideFibLevelButton = {};

        var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        var nearestTrendYValue;
        if(futureValue >= nearestDataPointForTrendXValue.xData){
            nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
        } else {
            nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
        }
        additionalDrawingsArr.referenceLine = chart.renderer.path(["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', newX, newY]).attr({
            'stroke-width': options.trendLineWidth,
            fill: ann.options.shape.params.fill,
            stroke: ann.options.shape.params.stroke,
            'z-index': 2,
            cursor: 'default',
            opacity: options.trendLineOpacity,
            dashstyle: options.trendLineStyle,                                                                                                                      
        }).add(ann.group);

        var hiddenLevelsEx = [];
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels);
        fibExtentionLevels.forEach(function (fibLevel) {
            var themeFillColor = theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibExtention && theme.fib3PointPriceProjectionGeneric.fibExtention.fibLevelFillColors && theme.fib3PointPriceProjectionGeneric.fibExtention.fibLevelFillColors[fibLevel.id];
            if (!fibLevel.enable) {
                hiddenLevelsEx.push(fibLevel.id);
            }
            drawingFillAttr = {
                'stroke-width': 0,
                fill: options.isSingleColorExtention && options.extentionFillColor ? options.extentionFillColor : fibLevel && fibLevel.fillColor ? fibLevel.fillColor : themeFillColor,
                'fill-opacity': options.isSingleColorExtention && options.extentionFillOpacity ? options.extentionFillOpacity : fibLevel && fibLevel.fillOpacity ? fibLevel.fillOpacity : baseFillOpacityExtention,
                stroke: ann.options.shape.params.stroke,
                'z-index': 2,
                cursor: 'default',
                'level': fibLevel.id,
                'pointer-events':'none'
            };
            drawingAttr = {
                'stroke-width': options.Extention && options.extentionLineWidth  ? options.extentionLineWidth : fibLevel && fibLevel.lineWidth ? fibLevel.lineWidth : ann.options.shape.params['stroke-width'],
                fill: ann.options.shape.params.fill,
                stroke: options.isSingleColorExtention && options.extentionLineColor ? options.extentionLineColor : fibLevel && fibLevel.lineColor ? fibLevel.lineColor : ann.options.shape.params.stroke,
                'z-index': 2,
                cursor: 'default',
                'level': fibLevel.id
            };

            var fontColorExtention = options.isSingleColorExtention && options.extentionFontColor ? options.extentionFontColor : fibLevel && fibLevel.fontColor ? fibLevel.fontColor : baseFontColorExtention;
            var fontSizeExtention = options.isSingleColorExtention && options.extentionFontSize ? options.extentionFontSize :  fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSizeExtention;
            var fontWeightExtention = options.isSingleColorExtention && options.extentionFontWeight ? options.extentionFontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeightExtention;

            labelCSSAttr = {
                'color': fontColorExtention,
                fontSize: fontSizeExtention + 'px',
                'font-weight': fontWeightExtention
            };
            labelAttr = {
                'level': fibLevel.id,
                'font-color': fontColorExtention,
                'font-size': fontSizeExtention,
                'font-weight': fontWeightExtention,
                subType: 'fibExtention',
            };
            
            fibonacciDrawingsArr.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
            fibonacciDrawingsArr.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
            fibonacciDrawingsArr.labels[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1), fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelCSSAttr).attr(labelAttr).add(ann.group);
            fibonacciDrawingsArr.hideFibLevelButton[fibLevel.id] = chart.renderer.createElement('foreignObject').add(ann.group).attr({
                width: '20',
                height: '20',
                level: fibLevel.id,
                type: 'fibExtention',
                rel: 'hideFibLevelButton',
                cursor: 'pointer'
            }).add(ann.group);
            var labelHtml = "<div>" + self.closeIcon + "</div>";
            fibonacciDrawingsArr.hideFibLevelButton[fibLevel.id].element.innerHTML = labelHtml;
            $(fibonacciDrawingsArr.hideFibLevelButton[fibLevel.id].element).mousedown(function (event) {
                if (event.which == 1 || event.button == 0) {
                    event.stopPropagation();
                    setTimeout(function () {
                        var selectedLevel = event.currentTarget.getAttribute('level');
                        var subType = event.currentTarget.getAttribute('type');
                        var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(self.annotation.chart);
                        if (selectedLevel) {
                            if (self.isVisibleLastLevel()) {
                                infChart.drawingsManager.removeDrawing(chartId, self.drawingId, undefined, true);
                            } else {
                                self.onFibLevelChange(selectedLevel, false, subType, true);
                            }
                        }
                    }, 0);
                }
            });
            fibonacciDrawingsArr.hideFibLevelButton[fibLevel.id].toFront();
        });

        var baseFillOpacityRetransment = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibRetrancement && typeof theme.fib3PointPriceProjectionGeneric.fibRetrancement.fillOpacity !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibRetrancement.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
        var baseFontColorRetransment = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibRetrancement && typeof theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontColor !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontColor : infChart.drawingUtils.common.baseFontColor;
        var baseFontSizeRetransment = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibRetrancement && typeof theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontSize !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontSize : infChart.drawingUtils.common.baseFontSize;
        var baseFontWeightRetransment = (theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibRetrancement && typeof theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontWeight !== "undefined") ? theme.fib3PointPriceProjectionGeneric.fibRetrancement.fontWeight : infChart.drawingUtils.common.fontWeight;

        self.fibRetrancementAdditionalDrawing.lines = {};
        self.fibRetrancementAdditionalDrawing.labels = {};
        self.fibRetrancementAdditionalDrawing.fill = {};
        self.fibRetrancementAdditionalDrawing.hideFibLevelButton = {};

        var hiddenLevelsRe = [];
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels);
        fibRetrancementLevels.forEach(function (fibLevel) {
            var themeFillColor = theme.fib3PointPriceProjectionGeneric && theme.fib3PointPriceProjectionGeneric.fibRetrancement && theme.fib3PointPriceProjectionGeneric.fibRetrancement.fibLevelFillColors && theme.fib3PointPriceProjectionGeneric.fibRetrancement.fibLevelFillColors[fibLevel.id];
            if (!fibLevel.enable) {
                hiddenLevelsRe.push(fibLevel.id);
            }
            drawingFillAttr = {
                'stroke-width': 0,
                fill: options.isSingleColorRetracement && options.retrancementFillColor ? options.retrancementFillColor : fibLevel && fibLevel.fillColor ? fibLevel.fillColor : themeFillColor,
                'fill-opacity': options.isSingleColorRetracement && options.retrancementFillOpacity ? options.retrancementFillOpacity : fibLevel && fibLevel.fillOpacity ? fibLevel.fillOpacity : baseFillOpacityRetransment,
                stroke: ann.options.shape.params.stroke,
                'z-index': 2,
                cursor: 'default',
                'level': fibLevel.id,
                'pointer-events':'none'
            };
            drawingAttr = {
                'stroke-width': options.isSingleColorRetracement && options.retrancementLineWidth ? options.retrancementLineWidth : fibLevel && fibLevel.lineWidth ? fibLevel.lineWidth : ann.options.shape.params['stroke-width'],
                fill: ann.options.shape.params.fill,
                stroke: options.isSingleColorRetracement && options.retrancementLineColor ? options.retrancementLineColor : fibLevel && fibLevel.lineColor ? fibLevel.lineColor : ann.options.shape.params.stroke,
                'z-index': 2,
                cursor: 'default',
                'level': fibLevel.id
            };

            var fontColorRetransment = options.isSingleColorRetracement && options.retrancementFontColor ? options.retrancementFontColor : fibLevel && fibLevel.fontColor ? fibLevel.fontColor : baseFontColorRetransment;
            var fontSizeRetransment = options.isSingleColorRetracement && options.retrancementFontSize ? options.retrancementFontSize :  fibLevel && fibLevel.fontSize ? fibLevel.fontSize : baseFontSizeRetransment;
            var fontWeightRetrancement = options.isSingleColorRetracement && options.retrancementFontWeight ? options.retrancementFontWeight : fibLevel && fibLevel.fontWeight ? fibLevel.fontWeight : baseFontWeightRetransment;

            labelCSSAttr = {
                'color': fontColorRetransment,
                fontSize: fontSizeRetransment + 'px',
                'font-weight': fontWeightRetrancement
            };
            labelAttr = {
                'level': fibLevel.id,
                'font-color': fontColorRetransment,
                'font-size': fontSizeRetransment,
                'font-weight': fontWeightRetrancement,
                subType: 'fibRetracement'
            };
            
            self.fibRetrancementAdditionalDrawing.fill[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr(drawingFillAttr).add(ann.group);
            self.fibRetrancementAdditionalDrawing.lines[fibLevel.id] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingAttr).add(ann.group);
            self.fibRetrancementAdditionalDrawing.labels[fibLevel.id] = chart.renderer.label(infChart.drawingUtils.common.formatValue(fibLevel.value, 1), fibLevel.drawingPosX, fibLevel.drawingPosY).css(labelCSSAttr).attr(labelAttr).add(ann.group);
            self.fibRetrancementAdditionalDrawing.hideFibLevelButton[fibLevel.id] = chart.renderer.createElement('foreignObject').add(ann.group).attr({
                width: '20',
                height: '20',
                level: fibLevel.id,
                type: 'fibRetracement',
                rel: 'hideFibLevelButton',
                cursor: 'pointer'
            }).add(ann.group);
            var labelHtml = "<div>" + self.closeIcon + "</div>";
            self.fibRetrancementAdditionalDrawing.hideFibLevelButton[fibLevel.id].element.innerHTML = labelHtml;
            $(self.fibRetrancementAdditionalDrawing.hideFibLevelButton[fibLevel.id].element).mousedown(function (event) {
                if (event.which == 1 || event.button == 0) {
                    event.stopPropagation();
                    setTimeout(function () {
                        var selectedLevel = event.currentTarget.getAttribute('level');
                        var subType = event.currentTarget.getAttribute('type');
                        var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(self.annotation.chart);
                        if (selectedLevel) {
                            if (self.isVisibleLastLevel()) {
                                infChart.drawingsManager.removeDrawing(chartId, self.drawingId, undefined, true);
                            } else {
                                self.onFibLevelChange(selectedLevel, false, subType, true);
                            }
                        }
                    }, 0);
                }
            });
            self.fibRetrancementAdditionalDrawing.hideFibLevelButton[fibLevel.id].toFront();
        });

        hiddenLevelsEx.forEach(function (id) {
            self.onFibLevelChange(id, false, "fibExtention", false);
        });

        hiddenLevelsRe.forEach(function (id) {
            self.onFibLevelChange(id, false, "fibRetracement", false);
        });
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.isVisibleLastLevel = function () {
    var self = this;
    var count = 0;
    $.each(self.fibonacciDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            count = count + 1;
        }
    });
    $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            count = count + 1;
        }
    });

    return count === 1;
}

infChart.fib3PointPriceProjectionGenericDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    var onChangeSnapToHighLow = function (checked, isPropertyChange) {
        self.onChangeSnapToHighLow.call(self, checked, isPropertyChange);
    };

    var onTrendLineToggleShow = function (show) {
        var isPropertyChange = true;
        if (self.settingsPopup) {
            isPropertyChange = self.isSettingsPropertyChange();
        }
        self.onTrendLineToggleShow.call(self, show, isPropertyChange);
    };

    return infChart.drawingUtils.common.bindFibGenericSettingsEvents.call(this, infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseLineWidth,
        undefined, undefined, onChangeSnapToHighLow, onTrendLineToggleShow);
};


infChart.fib3PointPriceProjectionGenericDrawing.prototype.deselect = function (isMouseOut) {
    infChart.drawingUtils.common.onDeselect.call(this);
    this.annotation.options.selectedDrawing = undefined;
    if (isMouseOut) {
        if (this.annotation) {
            if(this.annotation.options && !this.annotation.options.isTrendLineAlways){
                this.annotation.shape.hide();
            }
            if(this.additionalDrawings && this.additionalDrawings.referenceLine){
                if(this.annotation.options && !this.annotation.options.isTrendLineAlways){
                    this.additionalDrawings.referenceLine.hide();
                    this.resetDragSupporters();
                }
            }
            this.toggleFibLevelEraseIcon(true);
        }
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.toggleFibLevelEraseIcon = function (hide) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        fibonacciExpansionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        chart = ann.chart,
        line = ann.shape.d.split(' '),
        dx = line[4],
        xAxis = chart.xAxis[options.xAxis];

    if (hide) {
        if(self.fibonacciDrawings.hideFibLevelButton){
            $.each(self.fibonacciDrawings.hideFibLevelButton, function (key, value) {
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
                if(hideFibLevelButton){
                    hideFibLevelButton.hide();
                }
            });
        }
        if(self.fibRetrancementAdditionalDrawing.hideFibLevelButton){
            $.each(self.fibRetrancementAdditionalDrawing.hideFibLevelButton, function (key, value) {
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
                if(hideFibLevelButton){
                    hideFibLevelButton.hide();
                }
            });
        }
    } else {
        $.each(self.fibonacciDrawings.lines, function (key, value) {
            if (self.fibonacciDrawings.lines[key].visibility !== "hidden") {
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
                var drawingLabel = fibonacciExpansionDrawingLabels[key];
                var labelStartPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
                self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, value.d.split(' '), "fibExtention");
                if(hideFibLevelButton){
                    hideFibLevelButton.show();
                }
            }
        });

        $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
            if (self.fibRetrancementAdditionalDrawing.lines[key].visibility !== "hidden") {
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
                var drawingLabel = fibonacciRetrancementDrawingLabels[key];
                var labelStartPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
                self.positionHideIcon(hideFibLevelButton, labelStartPosition, drawingLabel, value.d.split(' '), "fibRetracement");
                if(hideFibLevelButton){
                    hideFibLevelButton.show();
                }
            }
        });
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getConfig = function (shape) {
    var self = this,
        shape = self.shape,
        annotation = self.annotation,
        options = annotation.options,
        fibLevels = options.fibLevels ? options.fibLevels : self.fibLevels;
        fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibLevels),
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : self.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : self.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels);

    return {
        shape: shape,
        extentionLabelPosition: annotation.options.extentionLabelPosition,
        extentionLineColor: annotation.options.extentionLineColor,
        extentionFillColor: annotation.options.extentionFillColor,
        extentionFillOpacity: annotation.options.extentionFillOpacity,
        extentionLineWidth: annotation.options.extentionLineWidth,
        extentionFontColor: annotation.options.extentionFontColor,
        extentionFontSize: annotation.options.extentionFontSize,
        extentionFontWeight: annotation.options.extentionFontWeight,
        retracementLabelPosition: annotation.options.retracementLabelPosition,
        retrancementLineColor: annotation.options.retrancementLineColor,
        retrancementFillColor: annotation.options.retrancementFillColor,
        retrancementFillOpacity: annotation.options.retrancementFillOpacity,
        retrancementLineWidth: annotation.options.retrancementLineWidth,
        retrancementFontColor: annotation.options.retrancementFontColor,
        retrancementFontSize: annotation.options.retrancementFontSize,
        retrancementFontWeight: annotation.options.retrancementFontWeight,
        trendXValue: annotation.options.trendXValue,
        trendYValue: annotation.options.trendYValue,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        isSingleColorExtention: annotation.options.isSingleColorExtention,
        isSingleColorRetracement: annotation.options.isSingleColorRetracement,
        isHLH: annotation.options.isHLH,
        isSnapTopHighLow: annotation.options.isSnapTopHighLow,
        fibExtentionLevels: fibExtentionLevels,
        fibRetrancementLevels: fibRetrancementLevels,
        isTrendLineAlways: annotation.options.isTrendLineAlways,
        trendLineColor: annotation.options.trendLineColor,
        trendLineOpacity: annotation.options.trendLineOpacity,
        trendLineWidth: annotation.options.trendLineWidth,
        trendLineStyle: annotation.options.trendLineStyle,
        isLocked : annotation.options.isLocked

    };
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options , event) {
    var self = this;
    var level = event.target.getAttribute('level');
    var subType = event.target.getAttribute('subType');
    if(!level && event.target.parentElement){
        level = event.target.parentElement.getAttribute('level');
        subType = event.target.parentElement.getAttribute('subType');
        if(!level && event.target.parentElement.parentElement){
            level = event.target.parentElement.parentElement.getAttribute('level');
            subType = event.target.parentElement.parentElement.getAttribute('subType');
        }
    }

    var contextMenu = {
        "copyToClipboard" : {
            icon : options.copyToClipboard.icon,
            displayText : options.copyToClipboard.displayText,
            action : function () {
                if(level) {
                    infChart.drawingUtils.common.onFibLevelCopy.call(self, level, subType);
                }
            }
        }
    };
    if (!self.isVisibleLastLevel()) {
        var eraseThis = {
            icon: options.erase.icon,
            displayText: options.erase.displayText,
            action: function () {
                if (level) {
                    self.onFibLevelChange(level, false, subType, true);
                }
            }
        }
        contextMenu["eraseThis"] = eraseThis;
    }
    if(level) {
        contextMenu = Object.assign(contextMenu, infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options));
        return infChart.drawingUtils.common.reorderContextMenu(contextMenu);
    }else{
        return  infChart.drawingUtils.common.getContextMenuOptions(chartId, drawingId, options)
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getFormattedLabel = function (yAxis, yValue, trendYValue, yValueEnd, percentage, stockChart, type) {
    var percentageValue = percentage/100;
    if(type == "fibExtention"){
        var labelYValue = yValue > trendYValue ? yValueEnd + (yValue - trendYValue) * percentageValue : yValueEnd - (trendYValue - yValue) * percentageValue;
    }
    if(type == "fibRetracement"){
        var labelYValue = yValueEnd > yValue ? yValueEnd - (yValueEnd - yValue) * percentageValue : yValueEnd + (yValue - yValueEnd) * percentageValue; 
    }
    var formatedLabelYValue = stockChart.formatValue(labelYValue, stockChart.getMainSeries().options.dp, undefined, false, false);
    if(type == "fibExtention"){
        return formatedLabelYValue + " " + ((percentageValue == 0) ? "" : percentageValue >= 1 ? "PP": "PP") + " " + infChart.drawingUtils.common.formatValue(percentageValue, 3);
    }
    if(type == "fibRetracement"){
        return formatedLabelYValue + " " + ((percentageValue == 0 || percentageValue == 1) ? "" : percentageValue > 1 ? "EX": "RET") + " " + infChart.drawingUtils.common.formatValue(percentageValue, 3);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getNearestYValue = function (isHLH, isLineStartYValue, referredYValue, nearestDataPoint, trendYValue, isSnapTopHighLow, chart) {
    var self = this;
    var nearestYValue = referredYValue;
    if(!chart){
        chart = this.annotation.chart; 
    }
    if (!isSnapTopHighLow) {
        var nearestReturnYValue = nearestYValue;
        var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
        var chartInstance = infChart.manager.getChart(stockChartId);
        if (chartInstance.isCompare || chartInstance.isLog) {
            nearestReturnYValue = infChart.drawingUtils.common.getBaseYValue.call(this, nearestYValue);
        }
        return nearestReturnYValue;
    }

    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);

    var nearestYValueOpenValue, nearestYValueCloseValue;
    if (chartInstance.isLog || chartInstance.isCompare) {
        nearestYValueOpenValue = infChart.drawingUtils.common.getYValue.call(self, nearestDataPoint.yData[1]);
        nearestYValueCloseValue = infChart.drawingUtils.common.getYValue.call(self,nearestDataPoint.yData[2]);
    } else {
        nearestYValueOpenValue = nearestDataPoint.yData[1];
        nearestYValueCloseValue = nearestDataPoint.yData[2];
    }

    if (referredYValue) {
        if (Math.abs(referredYValue - nearestYValueOpenValue) < Math.abs(referredYValue - nearestYValueCloseValue)) {
            nearestYValue = nearestDataPoint.yData[1];
        } else {
            nearestYValue = nearestDataPoint.yData[2];
        }
    }

    return nearestYValue;
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getOptions = function (properties, chart, isHLH) {
    var isHLH = (this.shape == 'fib3PointPriceProjectionHLH') ? true : false ;
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXValue: nearestDataForXValue.xData,
        trendXValue: Number.MIN_SAFE_INTEGER,
        trendYValue: Number.MIN_SAFE_INTEGER,
        allowDragX: true,
        allowDragY: true,
        allowDragByHandle: true,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0]
            }
        },
        isHLH: isHLH
    };

    var theme = infChart.drawingUtils.common.getTheme.call(this);
    var shapeTheme = theme["fib3PointPriceProjectionGeneric"];
    var baseFillColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.singleFillColor) ? theme.fib3PointPriceProjection.singleFillColor : (theme.fibonacci && theme.fibonacci.singleFillColor) ? theme.fibonacci.singleFillColor : infChart.drawingUtils.common.baseFillColor;
    var baseFillOpacity = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.fillOpacity !== "undefined") ? theme.fib3PointPriceProjection.fillOpacity : (theme.fibonacci && typeof theme.fibonacci.fillOpacity !== "undefined") ? theme.fibonacci.fillOpacity : infChart.drawingUtils.common.baseFillOpacity;
    var baseBorderColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.borderColor) ? theme.fib3PointPriceProjection.borderColor : (theme.fibonacci && theme.fibonacci.borderColor) ? theme.fibonacci.borderColor : infChart.drawingUtils.common.baseBorderColor;
    var baseLineWidth = (theme.fib3PointPriceProjection && typeof theme.fib3PointPriceProjection.lineWidth !== "undefined") ? theme.fib3PointPriceProjection.lineWidth : (theme.fibonacci && theme.fibonacci.lineWidth) ? theme.fibonacci.lineWidth : infChart.drawingUtils.common.baseLineWidth;
    var baseFontColor = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontColor) ? theme.fib3PointPriceProjection.fontColor: (theme.fibonacci && theme.fibonacci.fontColor) ? theme.fibonacci.fontColor : infChart.drawingUtils.common.baseFontColor;
    var baseFontSize = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontSize) ? theme.fib3PointPriceProjection.fontSize: (theme.fibonacci && theme.fibonacci.fontSize) ? theme.fibonacci.fontSize : infChart.drawingUtils.common.baseFontSize;
    var baseFontWeight = (theme.fib3PointPriceProjection && theme.fib3PointPriceProjection.fontWeight) ? theme.fib3PointPriceProjection.fontWeight: (theme.fibonacci && theme.fibonacci.fontWeight) ? theme.fibonacci.fontWeight : infChart.drawingUtils.common.baseFontWeight;

    options.extentionFillColor = properties.extentionFillColor ? properties.extentionFillColor : baseFillColor;
    options.extentionFillOpacity = properties.extentionFillOpacity ? properties.extentionFillOpacity : baseFillOpacity;
    options.extentionLineColor = properties.extentionLineColor ? properties.extentionLineColor : baseBorderColor;
    options.extentionLineWidth = properties.extentionLineWidth ? properties.extentionLineWidth : baseLineWidth;
    options.extentionFontColor = properties.extentionFontColor ? properties.extentionFontColor : baseFontColor;
    options.extentionFontSize = properties.extentionFontSize ? properties.extentionFontSize : baseFontSize;
    options.extentionFontWeight = properties.extentionFontWeight ? properties.extentionFontWeight : baseFontWeight;
    options.extentionLabelPosition = properties.extentionLabelPosition ? properties.extentionLabelPosition : "topLeft";

    options.trendLineColor = properties.trendLineColor ? properties.trendLineColor : shapeTheme.stroke || "#959595";
    options.trendLineOpacity = properties.trendLineOpacity ? properties.trendLineOpacity : shapeTheme.opacity || 1;
    options.trendLineWidth = properties.trendLineWidth ? properties.trendLineWidth : baseLineWidth || 1;
    options.trendLineStyle = properties.trendLineStyle ? properties.trendLineStyle : shapeTheme.dashstyle || 'solid';

    options.retrancementFillColor = properties.retrancementFillColor ? properties.retrancementFillColor : baseFillColor;
    options.retrancementFillOpacity = properties.retrancementFillOpacity ? properties.retrancementFillOpacity : baseFillOpacity;
    options.retrancementLineColor = properties.retrancementLineColor ? properties.retrancementLineColor : baseBorderColor;
    options.retrancementLineWidth = properties.retrancementLineWidth ? properties.retrancementLineWidth : baseLineWidth;
    options.retrancementFontColor = properties.retrancementFontColor ? properties.retrancementFontColor : baseFontColor;
    options.retrancementFontSize = properties.retrancementFontSize ? properties.retrancementFontSize : baseFontSize;
    options.retrancementFontWeight = properties.retrancementFontWeight ? properties.retrancementFontWeight : baseFontWeight;
    options.retracementLabelPosition = properties.retracementLabelPosition ? properties.retracementLabelPosition : "topRight";

    options.shape.params.fill = baseFillColor;
    options.shape.params['fill-opacity'] = baseFillOpacity;
    options.shape.params.stroke = options.trendLineColor;
    options.shape.params.opacity =  options.trendLineOpacity;
    options.shape.params['stroke-width'] = options.trendLineWidth;
    options.shape.params.dashstyle = options.trendLineStyle ;
    options.shape.params['font-color'] = baseFontColor;
    options.shape.params['font-size'] = baseFontSize;
    options.showSnapToHighLowToggle = true;
    options.showTrendLineAlwaysToggle = true;
    options.isSnapTopHighLow = typeof properties.isSnapTopHighLow !== "undefined" ? properties.isSnapTopHighLow : false;
    options.isTrendLineAlways = typeof properties.isTrendLineAlways !== "undefined" ? properties.isTrendLineAlways : true;
    if(futureValue >= options.nearestXValue){
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(isHLH, true, properties.yValue, nearestDataForXValue, properties.trendYValue,  properties.isSnapTopHighLow, chart));
    } else {
        options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, properties.yValue));
    }
    options.yValue = options.nearestYValue;


    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        if(futureValue >= options.nearestXValueEnd){
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(isHLH, false, properties.yValueEnd, nearestDataForXValueEnd, properties.trendYValue, properties.isSnapTopHighLow, chart));
        } else {
            options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, properties.yValueEnd));
        }
        options.yValueEnd = options.nearestYValueEnd;
    }

    if (properties.trendXValue && properties.trendYValue) {
        options.trendXValue = properties.trendXValue;
        options.trendYValue = properties.trendYValue;

        var nearestDataForTrendXValue = infChart.math.findNearestDataPoint(chart, properties.trendXValue, undefined, true, true);
        options.nearestTrendXValue = nearestDataForTrendXValue.xData;
        if(futureValue >= options.nearestTrendXValue){
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataForTrendXValue, options.trendXValue, properties.isSnapTopHighLow, chart));
        } else {
            options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
        }
        options.trendYValue = options.nearestTrendYValue;
    } else {
        options.events = null;
    }

    options.isSingleColorExtention = typeof properties.isSingleColorExtention !== "undefined" ? properties.isSingleColorExtention : false;
    options.isSingleColorRetracement = typeof properties.isSingleColorRetracement !== "undefined" ? properties.isSingleColorRetracement : false;
    options.fibLevels = properties.fibLevels ? properties.fibLevels : this.fibLevels;
    options.fibLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibLevels), baseFillOpacity);
    options.fibExtentionLevels = properties.fibExtentionLevels ? properties.fibExtentionLevels : this.fibExtentionLevels;
    options.fibExtentionLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibExtentionLevels), baseFillOpacity);
    options.fibRetrancementLevels = properties.fibRetrancementLevels ? properties.fibRetrancementLevels : this.fibRetrancementLevels;
    options.fibRetrancementLevels = infChart.drawingUtils.common.getFibLevelsWithOpacity(infChart.drawingUtils.common.sortFibLevelsByValue(options.fibRetrancementLevels), baseFillOpacity);
    options.isRealTimeTranslation = true;
    options.disableIntermediateScale = true;
    options.validateTranslationFn = function (newXValue) {
        var annotation = this.annotation,
            chart = annotation.chart,
            options = annotation.options,
            xVal = options.xValue,
            xValEnd = options.xValueEnd,
            newXValueEnd = xValEnd - xVal + newXValue,
            newTrendXValueEnd = options.trendXValue - xVal + newXValue,
            xAxis = chart.xAxis[options.xAxis],
            seriesData = chart.series[0].xData,
            dataMin = seriesData[0],
            totalPoints = infChart.drawingsManager.getTotalPoints(chart),
            dataMax = totalPoints[totalPoints.length - 1];

        return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax) && (newTrendXValueEnd >= dataMin && newTrendXValueEnd <= dataMax) && (options.selectedDrawing == "mainDrawing");
    }

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getGenericQuickFibSettings();
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.getSettingsPopup = function () {
    var self = this;
    var options = self.annotation.options;
    var fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : self.fibExtentionLevels;
    var fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : self.fibRetrancementLevels;
    var properties = {
        extentionFillColor: options.extentionFillColor,
        extentionFillOpacity: options.extentionFillOpacity,
        extentionLineColor: options.extentionLineColor,
        extentionLineWidth: options.extentionLineWidth,
        extentionFontColor: options.extentionFontColor,
        extentionFontSize: options.extentionFontSize,
        extentionFontWeight: options.extentionFontWeight,
        retrancementFillColor: options.retrancementFillColor,
        retrancementFillOpacity: options.retrancementFillOpacity,
        retrancementLineColor: options.retrancementLineColor,
        retrancementLineWidth: options.retrancementLineWidth,
        retrancementFontColor: options.retrancementFontColor,
        retrancementFontSize: options.retrancementFontSize,
        retrancementFontWeight: options.retrancementFontWeight,
        fibExtentionLevels: fibExtentionLevels,
        fibRetrancementLevels: fibRetrancementLevels,
        templates: self.getDrawingTemplates(),
        showFibModeToggle: false,
        showSnapToHighLowToggle: options.showSnapToHighLowToggle,
        userDefaultSettings: self.getUserDefaultSettings(),
        showTrendLineAlwaysToggle: options.showTrendLineAlwaysToggle,
        trendLineColor: options.trendLineColor,
        trendLineOpacity: options.trendLineOpacity,
        trendLineWidth: options.trendLineWidth,
        trendLineStyle: options.trendLineStyle
    }
    return infChart.drawingUtils.common.getGenericFibSettings(properties);
};


/**
 * on snap to high/low change
 * @param {boolean} checked - snap to high/low checked
 * @param {boolean} isPropertyChange - is propery changed
 * @param {boolean} ignoreSettingsSave - this is to indicate to this change does not affect to subsequent drawing
 */
infChart.fib3PointPriceProjectionGenericDrawing.prototype.onChangeSnapToHighLow = function (checked, isPropertyChange, ignoreSettingsSave) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;

    options.isSnapTopHighLow = checked;
    //var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    // if (options.isSnapTopHighLow) {
    //     var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    //     var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
    //     var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
    //     if(futureValue >= nearestDataPointForTrendXValue.xData){
    //         options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
    //     } else {
    //         options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestTrendYValue));
    //     }
    //     if(futureValue >= nearestDataForXValue.xData){
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, self.nearestYValue, nearestDataForXValue, options.trendXValue, options.isSnapTopHighLow));
    //     } else {
    //         options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestYValue));
    //     }
    //     if(futureValue >= nearestDataForXValueEnd.xData){
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, self.nearestYValueEnd, nearestDataForXValueEnd, options.trendXValue, options.isSnapTopHighLow));
    //     } else {
    //         options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.nearestYValueEnd));
    //     }
    // } else {
    //     options.nearestYValue = options.yValue;
    //     options.nearestYValueEnd = options.yValueEnd;
    //     options.nearestTrendYValue = options.trendYValue;
    // }

    // infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd);

    // self.scale();
    // self.selectAndBindResize();
    // chart.selectedAnnotation = ann;
    // self.updateSettings( self.getConfig());
    isPropertyChange && self.onPropertyChange();

    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.moveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        options = ann.options,
        x = e.chartX,
        y = e.chartY,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibonacciExtentionDrawingsFill = self.fibonacciDrawings.fill,
        fibonacciRetrancementDrawingsFill = self.fibRetrancementAdditionalDrawing.fill,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines,
        pathDefinition = ann.shape.d.split(' '),
        dx = parseFloat(pathDefinition[4]),
        dy = parseFloat(pathDefinition[5]),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1],
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        var nearestTrendYValue;
        if(options.isSnapTopHighLow) {
            if(futureValue >= nearestDataPointForTrendXValue.xData){
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
            } else {
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
            }
        } else {
            nearestTrendYValue = yAxis.toValue(y);
            //nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
        }

    ann.update({
        trendXValue: xAxis.toValue(x),
        trendYValue: nearestTrendYValue,
        nearestTrendXValue: nearestDataPointForTrendXValue.xData
        // trendYValue: yAxis.toValue(y),
        // nearestTrendXValue: nearestDataPointForTrendXValue.xData,
        // nearestTrendYValue: nearestTrendYValue
    });

    self.additionalDrawings.referenceLine.attr({
        d: ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', pathDefinition[1], pathDefinition[2]]
    });

    $.each(fibExtentionlineDrawings, function (key, value) {
        var fibLevel = fibExtentionLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue)) * percentage / 100) + dy;
        var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
        var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
        var fibExtentionHideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
        var line = ["M", 0, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: line
        });

        fibExtentionDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, nearestTrendYValue, options.yValueEnd, percentage, stockChart, "fibExtention"));

        self.positionDrawingLabel(fibExtentionDrawingLabel, line, "fibExtention");
        self.positionHideIcon(fibExtentionHideFibLevelButton, lineEndPosition, fibExtentionDrawingLabel, line, "fibExtention");
    });

    fibExtentionLevels.forEach(function (value, index, arr) {
        fill = fibonacciExtentionDrawingsFill && fibonacciExtentionDrawingsFill[value.id];
        currentLine = fibExtentionlineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibExtentionlineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });


    $.each(fibRetrancementLineDrawings, function (key, value) {
        var fibLevel = fibRetrancementLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue)) * percentage / 100) + dy;
        var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
        var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
        var fibRetrancementHideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
        var line = ["M", 0, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: line
        });

        fibRetrancementDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, nearestTrendYValue, options.yValueEnd, percentage, stockChart, "fibRetracement"));

        self.positionDrawingLabel(fibRetrancementDrawingLabel, line, "fibRetracement");
        self.positionHideIcon(fibRetrancementHideFibLevelButton, lineEndPosition, fibRetrancementDrawingLabel, line, "fibRetracement");
    });

    fibRetrancementLevels.forEach(function (value, index, arr) {
        fill = fibonacciRetrancementDrawingsFill && fibonacciRetrancementDrawingsFill[value.id];
        currentLine = fibRetrancementLineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibRetrancementLineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    return {line: pathDefinition, nearestTrendYValue: nearestTrendYValue};
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        stockChart,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibonacciExtentionDrawingsFill = self.fibonacciDrawings.fill,
        fibonacciRetrancementDrawingsFill = self.fibRetrancementAdditionalDrawing.fill,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines,
        stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart),
        chartInstance = infChart.manager.getChart(stockChartId),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1],
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineId,
        nextLineP,
        xValueInPixels = xAxis.toPixels(options.xValue),
        yValueInPixels = yAxis.toPixels(options.yValue),
        fibLevelLines = {};

        if (isCalculateNewValueForScale) {
            stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id))
            nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
            options.nearestXValue = nearestDataForXValue.xData;
            nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
            options.nearestXValueEnd = nearestDataForXValueEnd.xData;
            nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
            options.nearestTrendXValue = nearestDataPointForTrendXValue.xData;

            if(futureValue >= options.nearestXValue){
                options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataForXValue, options.trendXValue, false));
            } else {
                options.nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(this, options.yValue));
            }
            if(futureValue >= options.nearestXValueEnd){
                options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.yValueEnd, nearestDataForXValueEnd, options.trendXValue, false));
            } else {
                options.nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(self, options.yValueEnd));
            }
            if(futureValue >= options.nearestTrendXValue){
                options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue, false));
            } else {
                options.nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValue.call(self, options.trendYValue));
            }
            
            if (chartInstance.isLog || chartInstance.isCompare) {
                self.nearestYValue = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValue);
                self.nearestYValueEnd = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestYValueEnd);
                self.nearestTrendYValue = infChart.drawingUtils.common.getBaseYValue.call(self, options.nearestTrendYValue);
            } else {
                self.nearestYValue = options.nearestYValue;
                self.nearestYValueEnd = options.nearestYValueEnd;
                self.nearestTrendYValue = options.nearestTrendYValue;
            }
        } 

        var newX = xAxis.toPixels(options.nearestXValue) - xValueInPixels,
        newXEnd = xAxis.toPixels(options.nearestXValueEnd) - xValueInPixels,
        newY = yAxis.toPixels(options.yValue) - yValueInPixels,
        newYEnd = yAxis.toPixels(options.yValueEnd) - yValueInPixels;

    line[1] = (!isNaN(newX) && newX) || 0;
    line[2] = (!isNaN(newY) && newY) || 0;
    line[4] = (!isNaN(newXEnd) && newXEnd) || 0;
    line[5] = (!isNaN(newYEnd) && newYEnd) || 0;

    ann.update({
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    if(ann.shape.visibility !== "hidden"){
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }

    var dx = line[4], dy = line[5];

    if (fibExtentionlineDrawings) {
        self.additionalDrawings.referenceLine.attr({
            d: ["M", xAxis.toPixels(options.nearestTrendXValue) - xValueInPixels, yAxis.toPixels(options.trendYValue) - yValueInPixels, 'L', newX, newY]
        });
        if(self.additionalDrawings && self.additionalDrawings.referenceLine && self.additionalDrawings.referenceLine.visibility !== "hidden"){
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, self.additionalDrawings.referenceLine.d.split(' '), self.dragSupporters, undefined, self.defaultDragSupporterStyles);
        }
        var lineStartPosition = newX;
        var lineEndPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
        var lineWidthInPixels = (yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue));

        $.each(fibExtentionlineDrawings, function (key, value) {
            var fibLevel = fibExtentionLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -(lineWidthInPixels * percentage / 100) + dy;
            var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];
            fibLevelLines[key] = line;

            value.attr({
                d: line
            });

            if(isCalculateNewValueForScale) {
                fibExtentionDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart, "fibExtention"));
            }

            self.positionDrawingLabel(fibExtentionDrawingLabel, line, "fibExtention");
            if(chart.selectedAnnotation && chart.selectedAnnotation.options.id === options.id) {
                self.positionHideIcon(self.fibonacciDrawings.hideFibLevelButton[key], lineEndPosition, fibExtentionDrawingLabel, line, "fibExtention");
            }

            if(value.visibility !== 'hidden'){
                var customAttributes = {
                    'level' : key,
                    'visibility':fibExtentionlineDrawings[key].visibility,
                    'stroke-width': 10,
                    'subType': 'fibExtention'
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });

        fibExtentionLevels.forEach(function (value, index, arr) {
            fill = fibonacciExtentionDrawingsFill && fibonacciExtentionDrawingsFill[value.id];
            currentLine = fibExtentionlineDrawings[value.id];
        currentLineP = currentLine && fibLevelLines[value.id];

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = fibExtentionlineDrawings[arr[i].id];
                if (lineTemp && lineTemp.visibility != "hidden") {
                    nextLine = lineTemp;
                nextLineId = arr[i].id;
                    break;
                }
            }
        nextLineP = nextLine && fibLevelLines[nextLineId];
            if (currentLine && nextLine) {
                fill.attr({
                    d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
                });
            }
            nextLine = undefined;
        });
    }

    fibLevelLines = {};

    if (fibRetrancementLineDrawings) {
        self.additionalDrawings.referenceLine.attr({
            d: ["M", xAxis.toPixels(options.nearestTrendXValue) - xValueInPixels, yAxis.toPixels(options.trendYValue) - yValueInPixels, 'L', newX, newY]
        });
        var lineStartPosition = newX;
        var lineEndPosition = xAxis.toValue(xAxis.width) > Math.min(options.xValue, options.xValueEnd) ? (xAxis.width - xAxis.toPixels(ann.options.xValue)) : dx > 0 ? dx : 0;
        var lineWidthInPixels = (yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue));

        $.each(fibRetrancementLineDrawings, function (key, value) {
            var fibLevel = fibRetrancementLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -(lineWidthInPixels * percentage / 100) + dy;
            var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];
            fibLevelLines[key] = line;

            value.attr({
                d: line
            });

            if(isCalculateNewValueForScale) {
                fibRetrancementDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart, "fibRetracement"));
            }
            self.positionDrawingLabel(fibRetrancementDrawingLabel, line, "fibRetracement");

            if(chart.selectedAnnotation && chart.selectedAnnotation.options.id === options.id && !chart.annotationChangeInProgress) {
                self.positionHideIcon(self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key], lineEndPosition, fibRetrancementDrawingLabel, line, "fibRetracement");
            }

            if(value.visibility !== 'hidden'){
                var customAttributes = {
                    'level' : key,
                    'visibility':fibRetrancementLineDrawings[key].visibility,
                    'stroke-width': 10,
                    'subType': 'fibRetracement'
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });

        fibExtentionLevels.forEach(function (value, index, arr) {
            fill = fibonacciRetrancementDrawingsFill && fibonacciRetrancementDrawingsFill[value.id];
            currentLine = fibRetrancementLineDrawings[value.id];
            currentLineP = currentLine && fibLevelLines[value.id];

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = fibRetrancementLineDrawings[arr[i].id];
                if (lineTemp && lineTemp.visibility != "hidden") {
                    nextLine = lineTemp;
                nextLineId = arr[i].id;
                    break;
                }
            }
            nextLineP = nextLine && fibLevelLines[nextLineId];
            if (currentLine && nextLine) {
                fill.attr({
                    d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
                });
            }
            nextLine = undefined;
        });
        self.highlightEachLine();
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        pathDefinition, width, height, referenceLine = this.additionalDrawings.referenceLine;

    ann.events.deselect.call(ann);
    ann.shape.show();
    if(referenceLine){
        referenceLine.show();
    }
    if(ann && ann.chart && !ann.chart.annotationChangeInProgress){
        this.toggleFibLevelEraseIcon(false);
    }
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');
    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    var chart = ann.chart,
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis];

    this.resetDragSupporters();
    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, parseFloat(pathDefinition[1]), parseFloat(pathDefinition[2]), this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, xAxis.toPixels(options.nearestTrendXValue) - xAxis.toPixels(options.xValue), yAxis.toPixels(options.trendYValue) - yAxis.toPixels(options.yValue), this.moveStartPoint, this.updateMoveStartPoint, true);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.setNearestYValues = function (options, chart) {
    var self = this;
    var isHLH = (self.shape === 'fib3PointPriceProjectionHLH');
    var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
    if(futureValue >= nearestDataForXValue.xData){
        self.nearestYValue = self.getNearestYValue(isHLH, true, options.yValue, nearestDataForXValue, options.trendYValue, options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValue = options.yValue;
    }

    var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
    if(futureValue >= nearestDataForXValueEnd.xData){
        self.nearestYValueEnd = self.getNearestYValue(isHLH, false, options.yValueEnd, nearestDataForXValueEnd, options.trendYValue, options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValueEnd = options.yValueEnd;
    }

    var nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
    if(futureValue >= nearestDataPointForTrendXValue.xData){
        self.nearestTrendYValue = this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow, chart);
    } else {
        self.nearestYValueEnd = options.trendYValue;
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.resetDragSupporters = function(){
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);

    if(ann.shape.visibility !== "hidden"){
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }
    if(self.additionalDrawings && self.additionalDrawings.referenceLine && self.additionalDrawings.referenceLine.visibility !== "hidden"){
        var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    }

    $.each(self.fibonacciDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.fibonacciDrawings.lines[key].visibility,
                'stroke-width': 10,
                'subType': 'fibExtention'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.fibRetrancementAdditionalDrawing.lines[key].visibility,
                'stroke-width': 10,
                'subType': 'fibRetracement'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });
    self.highlightEachLine();
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.positionHideIcon = function (hideFibLevelButton, lineEndPosition, drawingLabel, line, subType) {
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if (subType == "fibExtention") {
        var linePosition = options.extentionLabelPosition;
        if (linePosition == "bottomLeft") {
            hideFibLevelButton.attr({
                x: parseFloat(line[1]) + drawingLabel.width + hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topLeft") {
            hideFibLevelButton.attr({
                x: parseFloat(line[1]) + drawingLabel.width + hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
        if (linePosition == "bottomCenter") {
            hideFibLevelButton.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2 - drawingLabel.width / 2,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topCenter") {
            hideFibLevelButton.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2 - drawingLabel.width / 2,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
        if (linePosition == "bottomRight") {
            hideFibLevelButton.attr({
                x: parseFloat(line[4]) - drawingLabel.width - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topRight") {
            hideFibLevelButton.attr({
                x: parseFloat(line[4]) - drawingLabel.width - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
    }
    if (subType == "fibRetracement") {
        var linePosition = options.retracementLabelPosition;
        if (linePosition == "bottomLeft") {
            hideFibLevelButton.attr({
                x: parseFloat(line[1]) + drawingLabel.width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topLeft") {
            hideFibLevelButton.attr({
                x: parseFloat(line[1]) + drawingLabel.width,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
        if (linePosition == "bottomCenter") {
            hideFibLevelButton.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2 - drawingLabel.width / 2 - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topCenter") {
            hideFibLevelButton.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2 - drawingLabel.width / 2 - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
        if (linePosition == "bottomRight") {
            hideFibLevelButton.attr({
                x: parseFloat(line[4]) - drawingLabel.width - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topRight") {
            hideFibLevelButton.attr({
                x: parseFloat(line[4]) - drawingLabel.width - hideFibLevelButton.getBBox().width,
                y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
            });
        }
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.positionDrawingLabel = function (drawingLabel, line, subType) {
    var self = this,
        ann = self.annotation,
        options = ann.options;


    if (subType == "fibExtention") {
        var linePosition = options.extentionLabelPosition;
        if (linePosition == "bottomLeft") {
            drawingLabel.attr({
                x: line[1],
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topLeft") {
            drawingLabel.attr({
                x: line[1],
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
        if (linePosition == "bottomCenter") {
            drawingLabel.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topCenter") {
            drawingLabel.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2,
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
        if (linePosition == "bottomRight") {
            drawingLabel.attr({
                x: line[4] - drawingLabel.width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topRight") {
            drawingLabel.attr({
                x: line[4] - drawingLabel.width,
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
    }
    if (subType == "fibRetracement") {
        var linePosition = options.retracementLabelPosition;
        if (linePosition == "bottomLeft") {
            drawingLabel.attr({
                x: line[1],
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topLeft") {
            drawingLabel.attr({
                x: line[1],
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
        if (linePosition == "bottomCenter") {
            drawingLabel.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topCenter") {
            drawingLabel.attr({
                x: (parseFloat(line[1]) + parseFloat(line[4])) / 2,
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
        if (linePosition == "bottomRight") {
            drawingLabel.attr({
                x: parseFloat(line[4]) - drawingLabel.width,
                y: parseFloat(line[2])
            });
        }
        if (linePosition == "topRight") {
            drawingLabel.attr({
                x: parseFloat(line[4]) - drawingLabel.width,
                y: parseFloat(line[2]) - drawingLabel.height
            });
        }
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.step = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        options = ann.options,
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibonacciExtentionDrawingsFill = self.fibonacciDrawings.fill,
        fibonacciRetrancementDrawingsFill = self.fibRetrancementAdditionalDrawing.fill,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines,
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineP,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestXValue = nearestDataPointForXValue.xData,
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true),
        nearestXValueEnd = nearestDataPointForXValueEnd.xData,
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(options.xValue);

        var futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];
        var nearestYValue, nearestYValueEnd;
        if(options.isSnapTopHighLow){
            if (isStartPoint) {
                if(futureValue >= nearestXValue){
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  options.isSnapTopHighLow));
                } else {
                    nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.yValue));
                }
                ann.update({
                    yValue: nearestYValue
                });
                nearestYValueEnd = yValueEnd;
            } else {
                if(futureValue >= nearestXValueEnd){
                    nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, yValueEnd, nearestDataPointForXValueEnd, options.trendXValue,  options.isSnapTopHighLow));
                } else {
                    nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, yValueEnd));
                }
                ann.update({
                    yValueEnd: nearestYValueEnd
                });
                nearestYValue = options.yValue;
            }
        } else {
            nearestYValue = options.yValue;
            nearestYValueEnd = yValueEnd;
        }

        //var newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue)
        var newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue),
            nearestDataPointForTrendXValue,
            nearestTrendYValue;
    
        var drawingLine = ["M", newX, 0, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];
    
        ann.shape.attr({
            d: drawingLine
        });

    if (fibExtentionlineDrawings) {
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true);
        nearestTrendYValue;
        if (!isStartPoint) {
            if(futureValue >= nearestDataPointForTrendXValue.xData){
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  options.isSnapTopHighLow));
            } else {
                nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.trendYValue));
            }
        } else {
            nearestTrendYValue = options.trendYValue;
            //nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(self, options.trendYValue));
        }
        self.additionalDrawings.referenceLine.attr({
            d: ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(options.xValue), yAxis.toPixels(self.annotation.options.trendYValue) - yAxis.toPixels(self.annotation.options.yValue), 'L', newX, 0]
        });

        $.each(fibExtentionlineDrawings, function (key, value) {
            var fibLevel = fibExtentionLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue)) * percentage / 100) + drawingLine[5];
            var lineStartPosition = newX;
            var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
            var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
            var fibExtentionFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

            value.attr({
                d: line
            });

            fibExtentionDrawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart, "fibExtention"));

            self.positionDrawingLabel(fibExtentionDrawingLabel, line, "fibExtention");
            self.positionHideIcon(fibExtentionFibLevelButton, lineEndPosition, fibExtentionDrawingLabel, line, "fibExtention");
        });

        fibExtentionLevels.forEach(function (value, index, arr) {
            fill = fibonacciExtentionDrawingsFill && fibonacciExtentionDrawingsFill[value.id];
            currentLine = fibExtentionlineDrawings[value.id];
            currentLineP = currentLine && currentLine.d.split(' ');

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = fibExtentionlineDrawings[arr[i].id];
                if (lineTemp && lineTemp.visibility != "hidden") {
                    nextLine = lineTemp;
                    break;
                }
            }
            nextLineP = nextLine && nextLine.d.split(' ');
            if (currentLine && nextLine) {
                fill.attr({
                    d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
                });
            }
            nextLine = undefined;
        });
    }

    if (fibRetrancementLineDrawings) {
        $.each(fibRetrancementLineDrawings, function (key, value) {
            var fibLevel = fibRetrancementLevels.find(function (level) {
                return level.id === key;
            });
            var percentage = parseFloat(fibLevel.value);
            var percentageY = -((yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue)) * percentage / 100) + drawingLine[5];
            var lineStartPosition = newX;
            var lineEndPosition = (xAxis.width - xAxis.toPixels(ann.options.xValue));
            var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
            var fibRetrancementFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
            var line = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

            value.attr({
                d: line
            });

            fibRetrancementDrawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart, "fibRetracement"));

            self.positionDrawingLabel(fibRetrancementDrawingLabel, line, "fibRetracement");
            self.positionHideIcon(fibRetrancementFibLevelButton, lineEndPosition, fibRetrancementDrawingLabel, line, "fibRetracement");
        });

        fibRetrancementLevels.forEach(function (value, index, arr) {
            fill = fibonacciRetrancementDrawingsFill && fibonacciRetrancementDrawingsFill[value.id];
            currentLine = fibRetrancementLineDrawings[value.id];
            currentLineP = currentLine && currentLine.d.split(' ');

            for (var i = index + 1; i < arr.length; i++) {
                var lineTemp = fibRetrancementLineDrawings[arr[i].id];
                if (lineTemp && lineTemp.visibility != "hidden") {
                    nextLine = lineTemp;
                    break;
                }
            }
            nextLineP = nextLine && nextLine.d.split(' ');
            if (currentLine && nextLine) {
                fill.attr({
                    d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
                });
            }
            nextLine = undefined;
        });
    }

    return {
        line: drawingLine,
        points: points,
        nearestXValue: nearestXValue,
        nearestXValueEnd: nearestXValueEnd,
        nearestTrendXValue: nearestDataPointForTrendXValue ? nearestDataPointForTrendXValue.xData : Number.MIN_SAFE_INTEGER,
        nearestYValue: nearestYValue,
        nearestYValueEnd: nearestYValueEnd,
        nearestTrendYValue: nearestTrendYValue
    };
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = this.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(lineData.points.dx + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(lineData.points.dy + yAxis.toPixels(ann.options.yValue));

    //if (options.isSnapTopHighLow) {
        line[2] = 0;
        line[5] = yAxis.toPixels(lineData.nearestYValueEnd) - yAxis.toPixels(lineData.nearestYValue);
        referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        referenceLine[2] =  yAxis.toPixels(options.trendYValue) - yAxis.toPixels(lineData.nearestYValue);
        referenceLine[5] =  0;
        self.additionalDrawings.referenceLine.attr({
            d: ["M", referenceLine[1], yAxis.toPixels(options.trendYValue) - yAxis.toPixels(lineData.nearestYValue), 'L', referenceLine[4], "0"]
        });
    //     ann.update({
    //         xValueEnd: x,
    //         yValue: lineData.nearestYValue,
    //         trendYValue: lineData.nearestTrendYValue,
    //         yValueEnd: lineData.nearestYValueEnd,
    //         nearestXValue: lineData.nearestXValue,
    //         nearestXValueEnd: lineData.nearestXValueEnd,
    //         nearestTrendXValue: lineData.nearestTrendXValue,
    //         nearestYValue: lineData.nearestYValue,
    //         nearestYValueEnd: lineData.nearestYValueEnd,
    //         nearestTrendYValue: lineData.nearestTrendYValue,
    //         shape: {
    //             params: {
    //                 d: line
    //             }
    //         }
    //     });
    //     self.scale(true);
    // } else {
        ann.update({
            xValueEnd: x,
            yValue: lineData.nearestYValue,
            yValueEnd: lineData.nearestYValueEnd,
            nearestXValue: lineData.nearestXValue,
            nearestXValueEnd: lineData.nearestXValueEnd,
            nearestTrendXValue: lineData.nearestTrendXValue,
            //nearestYValue: lineData.nearestYValue,
            //nearestYValueEnd: lineData.nearestYValueEnd,
            //nearestTrendYValue: lineData.nearestTrendYValue,
            shape: {
                params: {
                    d: line
                }
            }
        });
    //}
    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd, ann.options.trendYValue);
    //infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, ann.options.nearestTrendYValue);

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    if (self.fibonacciDrawings && self.fibonacciDrawings.lines) {
        $.each(self.fibonacciDrawings.lines, function (key, value) {
            if(value.visibility !== 'hidden'){
                var line = value.d.split(' ');
                var customAttributes = {
                    'level': key,
                    'visibility':self.fibonacciDrawings.lines[key].visibility,
                    'stroke-width': 10,
                    'subType': 'fibExtention'
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });
    } else {
        console.error("3 point price projection error");
    }

    if (self.fibRetrancementAdditionalDrawing && self.fibRetrancementAdditionalDrawing.lines) {
        $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
            if(value.visibility !== 'hidden'){
                var line = value.d.split(' ');
                var customAttributes = {
                    'level': key,
                    'visibility':self.fibRetrancementAdditionalDrawing.lines[key].visibility,
                    'stroke-width': 10,
                    'subType': 'fibRetracement'
                }
                infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
            }
        });
    } else {
        console.error("3 point price projection error");
    }
    self.highlightEachLine();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.translate = function (e) {
    var self =this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        options = ann.options,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibonacciExtentionDrawingsFill = self.fibonacciDrawings.fill,
        fibonacciRetrancementDrawingsFill = self.fibRetrancementAdditionalDrawing.fill,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines, 
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineP;

    $.each(fibExtentionlineDrawings, function (key, value) {
        var fibLevel = fibExtentionLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
        var fibExtentionHideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
        var line = value.d.split(' ');
        var lineEndPosition = xAxis.width - xAxis.toPixels(options.xValue);
        var newLine = ["M", line[1], line[2], 'L', lineEndPosition, line[5]];

        value.attr({
            d: newLine
        });
        fibExtentionDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart, "fibExtention"));

        self.positionDrawingLabel(fibExtentionDrawingLabel, line, "fibExtention");
        self.positionHideIcon(fibExtentionHideFibLevelButton, lineEndPosition, fibExtentionDrawingLabel, line, "fibExtention");
    });

    fibExtentionLevels.forEach(function (value, index, arr) {
        fill = fibonacciExtentionDrawingsFill && fibonacciExtentionDrawingsFill[value.id];
        currentLine = fibExtentionlineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibExtentionlineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    $.each(fibRetrancementLineDrawings, function (key, value) {
        var fibLevel = fibRetrancementLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var line = value.d.split(' ');
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
        var fibRetrancementHideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
        var newLine = ["M", line[1], line[2], 'L', lineEndPosition, line[5]];

        value.attr({
            d: newLine
        });
        fibRetrancementDrawingLabel.textSetter(self.getFormattedLabel(yAxis, options.yValue, options.trendYValue, options.yValueEnd, percentage, stockChart, "fibRetracement"));

        self.positionDrawingLabel(fibRetrancementDrawingLabel, newLine, "fibRetracement");
        self.positionHideIcon(fibRetrancementHideFibLevelButton, lineEndPosition, fibRetrancementDrawingLabel, newLine, "fibRetracement");

    });

    fibRetrancementLevels.forEach(function (value, index, arr) {
        fill = fibonacciRetrancementDrawingsFill && fibonacciRetrancementDrawingsFill[value.id];
        currentLine = fibRetrancementLineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibRetrancementLineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });
    this.toggleFibLevelEraseIcon(true);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.translateEnd = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        stockChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id)),
        options = ann.options,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibonacciExtentionDrawingsFill = self.fibonacciDrawings.fill,
        fibonacciRetrancementDrawingsFill = self.fibRetrancementAdditionalDrawing.fill,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines, 
        fill,
        currentLine,
        currentLineP,
        nextLine,
        nextLineP,
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true),
        nearestDataPointForTrendXValue = infChart.math.findNearestDataPoint(chart, options.trendXValue, undefined, true, true),
        futureValue = chart.series[0].xData[chart.series[0].xData.length - 1];

    var nearestYValue;
    if(futureValue >= nearestDataPointForXValue.xData) {
        nearestYValue = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, true, options.yValue, nearestDataPointForXValue, options.trendXValue,  false));
    } else {
        nearestYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValue));
    }

    var nearestYValueEnd;
    if(futureValue >= nearestDataPointForXValueEnd.xData){
        nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, this.getNearestYValue(options.isHLH, false, options.yValueEnd, nearestDataPointForXValueEnd, options.trendXValue,  false));
    } else {
        nearestYValueEnd = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.yValueEnd));
    }

    var nearestTrendYValue;
    if(futureValue >= nearestDataPointForTrendXValue.xData){
        nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this,this.getNearestYValue(options.isHLH, false, options.trendYValue, nearestDataPointForTrendXValue, options.trendXValue,  false));
    } else {
        nearestTrendYValue = infChart.drawingUtils.common.getYValue.call(this, infChart.drawingUtils.common.getBaseYValues.call(this, options.trendYValue));
    }
    // if(options.isSnapTopHighLow){
    //     var newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
    //         newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
    //         newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(nearestYValue),
    //         newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue);

    //     var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

    //     ann.update({
    //         xValue: nearestDataPointForXValue.xData,
    //         xValueEnd: nearestDataPointForXValueEnd.xData,
    //         trendXValue: nearestDataPointForTrendXValue.xData,
    //         yValue: nearestYValue,
    //         yValueEnd: nearestYValueEnd,
    //         trendYValue: nearestTrendYValue,
    //         nearestXValue: nearestDataPointForXValue.xData,
    //         nearestXValueEnd: nearestDataPointForXValueEnd.xData,
    //         nearestTrendXValue: nearestDataPointForTrendXValue.xData,
    //         nearestYValue: nearestYValue,
    //         nearestYValueEnd: nearestYValueEnd,
    //         nearestTrendYValue: nearestTrendYValue,
    //         shape: {
    //             params: {
    //                 d: line
    //             }
    //         }
    //     });
    //     var newReferenceLine = ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue), 'L', newX, newY];
    //     self.additionalDrawings.referenceLine.attr({
    //         d: newReferenceLine
    //     });
    // } else {
        var newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
            newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData),
            newY = yAxis.toPixels(nearestYValue) - yAxis.toPixels(options.yValue),
            newYEnd = yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(options.yValue);

        var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), parseInt(newYEnd, 10)];

        ann.update({
            xValue: nearestDataPointForXValue.xData,
            xValueEnd: nearestDataPointForXValueEnd.xData,
            trendXValue: nearestDataPointForTrendXValue.xData,
            nearestXValue: nearestDataPointForXValue.xData,
            nearestXValueEnd: nearestDataPointForXValueEnd.xData,
            nearestTrendXValue: nearestDataPointForTrendXValue.xData,
            nearestYValue: nearestYValue,
            nearestYValueEnd: nearestYValueEnd,
            nearestTrendYValue: nearestTrendYValue,
            shape: {
                params: {
                    d: line
                }
            }
        });
        var newReferenceLine = ["M", xAxis.toPixels(nearestDataPointForTrendXValue.xData) - xAxis.toPixels(nearestDataPointForXValue.xData), yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(options.yValue), 'L', newX, newY];
        self.additionalDrawings.referenceLine.attr({
            d: newReferenceLine
        });
    //}

    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, line, self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newReferenceLine, self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(fibExtentionlineDrawings, function (key, value) {
        var fibLevel = fibExtentionLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestTrendYValue) - yAxis.toPixels(nearestYValue)) * percentage / 100) + line[5];
        var lineStartPosition = newX;
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
        var fibExtentionHideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
        var newLine = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: newLine
        });

        fibExtentionDrawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart, "fibExtention"));

        self.positionDrawingLabel(fibExtentionDrawingLabel, newLine, "fibExtention");
        self.positionHideIcon(fibExtentionHideFibLevelButton, lineEndPosition, fibExtentionDrawingLabel, newLine, "fibExtention");

        if(value.visibility !== 'hidden'){
            var customAttributes = {
                'level': key,
                'visibility':fibExtentionlineDrawings[key].visibility,
                'stroke-width': 10,
                'subType': 'fibExtention'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newLine, self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    fibExtentionLevels.forEach(function (value, index, arr) {
        fill = fibonacciExtentionDrawingsFill && fibonacciExtentionDrawingsFill[value.id];
        currentLine = fibExtentionlineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibExtentionlineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    $.each(fibRetrancementLineDrawings, function (key, value) {
        var fibLevel = fibRetrancementLevels.find(function (level) {
            return level.id === key;
        });
        var percentage = parseFloat(fibLevel.value);
        var percentageY = -((yAxis.toPixels(nearestYValueEnd) - yAxis.toPixels(nearestYValue)) * percentage / 100) + line[5];
        var lineStartPosition = newX;
        var lineEndPosition = xAxis.width - xAxis.toPixels(ann.options.xValue);
        var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
        var fibRetrancementHideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
        var newLine = ["M", lineStartPosition, percentageY, 'L', lineEndPosition, percentageY];

        value.attr({
            d: newLine
        });

        fibRetrancementDrawingLabel.textSetter(self.getFormattedLabel(yAxis, nearestYValue, nearestTrendYValue, nearestYValueEnd, percentage, stockChart, "fibRetracement"));

        self.positionDrawingLabel(fibRetrancementDrawingLabel, newLine, "fibRetracement");
        self.positionHideIcon(fibRetrancementHideFibLevelButton, lineEndPosition, fibRetrancementDrawingLabel, newLine, "fibRetracement");

        if(value.visibility !== 'hidden'){
            var customAttributes = {
                'level': key,
                'visibility':fibRetrancementLineDrawings[key].visibility,
                'stroke-width': 10,
                'subType': 'fibRetracement'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, newLine, self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    fibRetrancementLevels.forEach(function (value, index, arr) {
        fill = fibonacciRetrancementDrawingsFill && fibonacciRetrancementDrawingsFill[value.id];
        currentLine = fibRetrancementLineDrawings[value.id];
        currentLineP = currentLine && currentLine.d.split(' ');

        for (var i = index + 1; i < arr.length; i++) {
            var lineTemp = fibRetrancementLineDrawings[arr[i].id];
            if (lineTemp && lineTemp.visibility != "hidden") {
                nextLine = lineTemp;
                break;
            }
        }
        nextLineP = nextLine && nextLine.d.split(' ');
        if (currentLine && nextLine) {
            fill.attr({
                d: ['M', currentLineP[1], currentLineP[2], 'L', currentLineP[4], currentLineP[5], 'L', nextLineP[4], nextLineP[5], 'L', nextLineP[1], nextLineP[2], 'L', currentLineP[1], currentLineP[2]]
            });
        }
        nextLine = undefined;
    });

    self.highlightEachLine();
    self.selectAndBindResize();
    chart.selectedAnnotation = ann;
    this.toggleFibLevelEraseIcon(false);
    options.selectedDrawing = undefined;
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.updateMoveStartPoint = function (e) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        lineData = this.moveStartPoint(e),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue));

        // if (options.isSnapTopHighLow) {
        //     line[2] = 0;
        //     line[5] = yAxis.toPixels(options.nearestYValueEnd) - yAxis.toPixels(options.nearestYValue);
        //     referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
        //     referenceLine[2] =  yAxis.toPixels(options.nearestTrendYValue) - yAxis.toPixels(options.nearestYValue);
        //     referenceLine[5] =  0;
        //     self.additionalDrawings.referenceLine.attr({
        //         d: ["M", referenceLine[1], yAxis.toPixels(options.nearestTrendYValue) - yAxis.toPixels(options.nearestYValue), 'L', referenceLine[4], "0"]
        //     });
        //     ann.update({
        //         yValue: options.nearestYValue,
        //         trendYValue: options.nearestTrendYValue,
        //         yValueEnd: options.nearestYValueEnd,
        //         shape: {
        //             params: {
        //                 d: line
        //             }
        //         }
        //     });
        //     self.scale();
        // }
        ann.update({
            trendYValue: lineData.nearestTrendYValue,
            // shape: {
            //     params: {
            //         d: line
            //     }
            // }
        });

    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, ann.options.yValueEnd, ann.options.trendYValue);
    //infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, ann.options.nearestTrendYValue);
    infChart.drawingUtils.common.removeDragSupporters.call(self, self.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);
    var referenceLine = self.additionalDrawings.referenceLine.d.split(' ');
    infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', referenceLine[1], referenceLine[2], 'L', referenceLine[4], referenceLine[5]], self.dragSupporters, undefined, self.defaultDragSupporterStyles);

    $.each(self.fibonacciDrawings.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.fibonacciDrawings.lines[key].visibility,
                'stroke-width': 10,
                'subType': 'fibExtention'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
        if(value.visibility !== 'hidden'){
            var line = value.d.split(' ');
            var customAttributes = {
                'level' : key,
                'visibility':self.fibRetrancementAdditionalDrawing.lines[key].visibility,
                'stroke-width': 10,
                'subType': 'fibRetracement'
            }
            infChart.drawingUtils.common.addDragSupporters.call(self, ann, chart, ['M', line[1], line[2], 'L', line[4], line[5]], self.dragSupporters, customAttributes, self.fibLevelDragSupporterStyles);
        }
    });

    self.highlightEachLine();
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(self);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.updateSettings = function (properties) {
    var updateProperties = {
        extentionFillColor: properties.extentionFillColor,
        extentionFillOpacity: properties.extentionFillOpacity,
        extentionLineColor: properties.extentionLineColor,
        extentionLineWidth: properties.extentionLineWidth,
        extentionFontSize: properties.extentionFontSize,
        extentionFontColor: properties.extentionFontColor,
        extentionFontWeight: properties.extentionFontWeight,
        extentionLabelPosition: properties.extentionLabelPosition,
        retrancementFillColor: properties.retrancementFillColor,
        retrancementFillOpacity: properties.retrancementFillOpacity,
        retrancementLineColor: properties.retrancementLineColor,
        retrancementLineWidth: properties.retrancementLineWidth,
        retrancementFontSize: properties.retrancementFontSize,
        retrancementFontColor: properties.retrancementFontColor,
        retrancementFontWeight: properties.retrancementFontWeight,
        retracementLabelPosition: properties.retracementLabelPosition,
        isSingleColorExtention: properties.isSingleColorExtention,
        isSingleColorRetracement: properties.isSingleColorRetracement,
        fibExtentionLevels: properties.fibExtentionLevels,
        fibRetrancementLevels: properties.fibRetrancementLevels,
        isSnapTopHighLowEnabled: properties.isSnapTopHighLow,
        isTrendLineAlwaysEnabled: properties.isTrendLineAlways,
        trendLineColor: properties.trendLineColor,
        trendLineOpacity: properties.trendLineOpacity,
        trendLineWidth: properties.trendLineWidth,
        trendLineStyle: properties.trendLineStyle
    }
    infChart.structureManager.drawingTools.updateGenericFibSettings(this.settingsPopup, updateProperties);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelLineColorChange = function(rgb, value, fibLevelId, isAll, subType, isPropertyChange){
    var self = this;

    if(subType == "fibRetracement"){
        self.fibRetrancementAdditionalDrawing.lines[fibLevelId].css({
            fill: value
        });
    
        self.fibRetrancementAdditionalDrawing.lines[fibLevelId].attr({
            'stroke': value
        });

        if (!isAll) {
            var fibRetrancementLevels = self.annotation.options.fibRetrancementLevels;
            var fibRetrancementLevel = fibRetrancementLevels.find(function (level) {
                return level.id === fibLevelId;
            });
            fibRetrancementLevel.lineColor = value;
        }
    }
    if(subType == "fibExtention"){
        self.fibonacciDrawings.lines[fibLevelId].css({
            fill: value
        });
    
        self.fibonacciDrawings.lines[fibLevelId].attr({
            'stroke': value
        });

        if (!isAll) {
            var fibExtentionLevels = self.annotation.options.fibExtentionLevels;
            var fibExtentionLevel = fibExtentionLevels.find(function (level) {
                return level.id === fibLevelId;
            });
            fibExtentionLevel.lineColor = value;
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibFillColorChange = function(rgb, value, opacity, level, isAll, subType, isPropertyChange){
    var self = this;

    if(subType == "fibExtention"){
        var fibonacciDrawingsFill = self.fibonacciDrawings.fill[level.id];
        var fibLevels = self.annotation.options.fibExtentionLevels;
        var fibLevel = fibLevels.find(function (fibLevel) {
            return level.id === fibLevel.id;
        });
    }
    if(subType == "fibRetracement"){
        var fibonacciDrawingsFill = self.fibRetrancementAdditionalDrawing.fill[level.id];
        var fibLevels = self.annotation.options.fibRetrancementLevels;
        var fibLevel = fibLevels.find(function (fibLevel) {
            return level.id === fibLevel.id;
        });
    }

    if (fibonacciDrawingsFill) {
        fibonacciDrawingsFill.attr({
            'fill': value,
            'fill-opacity': opacity
        });
        if (!isAll) {
            fibLevel.fillColor = value;
            fibLevel.fillOpacity = opacity;
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLineWidthChange = function (strokeWidth, fibLevelId, isAll, subType, isPropertyChange){
    var self = this;
    if(subType == "fibExtention"){
        self.fibonacciDrawings.lines[fibLevelId].attr({
            'stroke-width': strokeWidth
        });
        var fibLevels = self.annotation.options.fibExtentionLevels;
        var fibLevel = fibLevels.find(function (fibLevel) {
            return fibLevelId === fibLevel.id;
        });
    }
    if(subType == "fibRetracement"){
        self.fibRetrancementAdditionalDrawing.lines[fibLevelId].attr({
            'stroke-width': strokeWidth
        });
        var fibLevels = self.annotation.options.fibRetrancementLevels;
        var fibLevel = fibLevels.find(function (fibLevel) {
            return fibLevelId === fibLevel.id;
        });
    }

    if (!isAll) {
        fibLevel.lineWidth = strokeWidth;
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontColorChange = function(rgb, value, fibLevel, isAll, subType, isPropertyChange){
    var self = this;
    if(subType == "fibExtention"){
        var fibonacciDrawingsLabel = self.fibonacciDrawings.labels[fibLevel.id];
        var levels = self.annotation.options.fibExtentionLevels;
        var fibLevel = levels.find(function (level) {
            return level.id === fibLevel.id;
        });
    }
    if(subType == "fibRetracement"){
        var fibonacciDrawingsLabel = self.fibRetrancementAdditionalDrawing.labels[fibLevel.id];
        var levels = self.annotation.options.fibRetrancementLevels;
        var fibLevel = levels.find(function (level) {
            return level.id === fibLevel.id;
        });
    }

    if (fibonacciDrawingsLabel) {
        fibonacciDrawingsLabel.attr({
            'font-color': value
        }).css({
            'color': value
        });
    }
    if (!isAll) {
        fibLevel.fontColor = value;
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontSizeChange = function (fontSize, fibLevelId, isAll, subType, isPropertyChange){
    var self= this;
    if(subType == "fibExtention"){
        var fibonacciDrawingsLabel = self.fibonacciDrawings.labels[fibLevelId];
        var levels = self.annotation.options.fibExtentionLevels;
        var fibLevel = levels.find(function (level) {
            return level.id === fibLevelId;
        });
    }
    if(subType == "fibRetracement"){
        var fibonacciDrawingsLabel = self.fibRetrancementAdditionalDrawing.labels[fibLevelId];
        var levels = self.annotation.options.fibRetrancementLevels;
        var fibLevel = levels.find(function (level) {
            return level.id === fibLevelId;
        });
    }
    fibonacciDrawingsLabel.attr({
        'font-size': fontSize
    }).css({
        'fontSize': fontSize + 'px'
    });

    if (!isAll) {
        fibLevel.fontSize = fontSize;
    }
    self.scale(true);
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelValueChange = function (currentLevel, value, subType, isPropertyChange){
    var self = this;
    var ann = self.annotation,
        options = ann.options;

        if(subType == "fibExtention"){
            fibLevels = options.fibExtentionLevels;
            fibLevels.forEach(function (fibLevel) {
                if (fibLevel.id === currentLevel) {
                    fibLevel.value = value;
                    return;
                }
            });
        }
        if(subType == "fibRetracement"){
            fibLevels = options.fibRetrancementLevels;
            fibLevels.forEach(function (fibLevel) {
                if (fibLevel.id === currentLevel) {
                    fibLevel.value = value;
                    return;
                }
            });
        }

    self.scale(true);
    self.updateSettings(self.getConfig());
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelFontWeightChange = function (value, fibLevelId, isAll, subType, isPropertyChange){
    var self = this;

    if(subType == "fibExtention"){
        var fibonacciDrawingsLabel = self.fibonacciDrawings.labels[fibLevelId];
        var fibLevels = self.annotation.options.fibExtentionLevels;
        var fibLevel = fibLevels.find(function (level) {
            return level.id === fibLevelId;
        });
    }
    if(subType == "fibRetracement"){
        var fibonacciDrawingsLabel = self.fibRetrancementAdditionalDrawing.labels[fibLevelId];
        var fibLevels = self.annotation.options.fibRetrancementLevels;
        var fibLevel = fibLevels.find(function (level) {
            return level.id === fibLevelId;
        });
    }

    if (fibonacciDrawingsLabel) {
        fibonacciDrawingsLabel.attr({
            'font-weight': value
        }).css({
            'font-weight': value
        });
    }
    if (!isAll) {
        fibLevel.fontWeight = value;
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibLevelChange = function(currentLevel, checked, subType, isPropertyChange){
    var self = this,
        options = self.annotation.options;
    if(subType == "fibRetracement"){
        var drawing = self.fibRetrancementAdditionalDrawing.lines[currentLevel];
        var label = self.fibRetrancementAdditionalDrawing.labels[currentLevel];
        var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[currentLevel];
        var fill = self.fibRetrancementAdditionalDrawing.fill[currentLevel];
        var fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibRetrancementLevels);
    } 
    if(subType == "fibExtention"){
        var drawing = self.fibonacciDrawings.lines[currentLevel];
        var label = self.fibonacciDrawings.labels[currentLevel];
        var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[currentLevel];
        var fill = self.fibonacciDrawings.fill[currentLevel];
        var fibLevels = infChart.drawingUtils.common.sortFibLevelsByValue(options.fibExtentionLevels);
    }

    var currentOrderIdx,
        prevLine, prevFill, nextFill,
        currentLinePoints,
        nextLinePoints,
        prvLinePoints,
        i,
        lineD,
        next;
    if(isPropertyChange){
        self.annotation.options.enabledMyDefaultButton = true;
    }
    fibLevels.some(function (fibLevel, i) {
        if (fibLevel.id == currentLevel) {
            currentOrderIdx = i;
            return true;
        }
    });
    fibLevels[currentOrderIdx].enable = checked;

    if (checked) {
        drawing.show();
        label.show();
        if(hideFibLevelButton && self.annotation.chart.selectedAnnotation == self.annotation){
            self.positionHideIcon(hideFibLevelButton, undefined, label, drawing.d.split(' '), subType);
            hideFibLevelButton.show();
        }

        if(subType == "fibRetracement"){
            for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                lineD = self.fibRetrancementAdditionalDrawing.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    prevLine = lineD;
                    prevFill = self.fibRetrancementAdditionalDrawing.fill[fibLevels[i].id];
                    break;
                }
            }
            for (i = currentOrderIdx - 1; i >= 0; i--) {
                lineD = self.fibRetrancementAdditionalDrawing.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    next = lineD;
                    nextFill = self.fibRetrancementAdditionalDrawing.fill[fibLevels[i].id];
                    break;
                }
            }
        }
        if(subType == "fibExtention"){
            for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                lineD = self.fibonacciDrawings.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    prevLine = lineD;
                    prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                    break;
                }
            }
            for (i = currentOrderIdx - 1; i >= 0; i--) {
                lineD = self.fibonacciDrawings.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    next = lineD;
                    nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                    break;
                }
            }
        }

        currentLinePoints = drawing.d.split(' ');

        if (next && nextFill) {
            nextFill.show();
            nextLinePoints = next.d.split(' ');
            nextFill.attr({
                d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', currentLinePoints[1], currentLinePoints[2], 'L', currentLinePoints[1], currentLinePoints[2]]
            });

        }

        if (fill && prevLine) {
            fill.show();
            prvLinePoints = prevLine.d.split(' ');
            fill.attr({
                d: ['M', prvLinePoints[1], prvLinePoints[2], 'L', prvLinePoints[4], prvLinePoints[5], 'L', currentLinePoints[4], currentLinePoints[5], 'L', currentLinePoints[1], currentLinePoints[2], 'L', prvLinePoints[1], prvLinePoints[2]]
            });
        }

    } else {
        drawing.hide();
        label.hide();
        fill.hide();
        if(hideFibLevelButton){
            hideFibLevelButton.hide();
        }

        if(subType == "fibRetracement"){
            for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                lineD = self.fibRetrancementAdditionalDrawing.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    prevLine = lineD;
                    prevFill = self.fibRetrancementAdditionalDrawing.fill[fibLevels[i].id];
                    break;
                }
            }

            for (i = currentOrderIdx - 1; i >= 0; i--) {
                lineD = self.fibRetrancementAdditionalDrawing.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    next = lineD;
                    nextFill = self.fibRetrancementAdditionalDrawing.fill[fibLevels[i].id];
                    break;
                }
            }
        }
        if(subType == "fibExtention"){
            for (i = currentOrderIdx + 1; i < fibLevels.length; i++) {
                lineD = self.fibonacciDrawings.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    prevLine = lineD;
                    prevFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                    break;
                }
            }

            for (i = currentOrderIdx - 1; i >= 0; i--) {
                lineD = self.fibonacciDrawings.lines[fibLevels[i].id];
                if (lineD && lineD.visibility != "hidden") {
                    next = lineD;
                    nextFill = self.fibonacciDrawings.fill[fibLevels[i].id];
                    break;
                }
            }
        }
        if (prevLine && next) {
            prvLinePoints = prevLine.d.split(' ');
            nextLinePoints = next.d.split(' ');
            nextFill.attr({
                d: ['M', nextLinePoints[1], nextLinePoints[2], 'L', nextLinePoints[4], nextLinePoints[5], 'L', prvLinePoints[4], prvLinePoints[5], prvLinePoints[1], prvLinePoints[2], 'L', nextLinePoints[1], nextLinePoints[2]]
            })
        } else if (!prevLine && nextFill) {
            nextFill.hide();
        }
    }

    if(self.resetDragSupporters){
        self.resetDragSupporters();
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleLineColorChange = function(rgb, value, isSingleColor, fibLevelColors, subType, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;
    if(subType == "fibExtention"){
        self.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionLineColor = value;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        self.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementLineColor = value;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLevelLineColorChange(rgb, value, fibLevels[i].id, true, subType, false);
        }
    } else {
        for (i = 0; i < fibLevels.length; i++) {
            var lineColor = fibLevelColors[fibLevels[i].id].lineColor;
            self.onFibLevelLineColorChange(rgb, lineColor, fibLevels[i].id, false, subType, false);
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFillColorChange = function(rgb, value, opacity, isSingleColor, fibLevelColors, subType, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;
    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionFillColor = value;
            options.extentionFillOpacity = opacity;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementFillColor = value;
            options.retrancementFillOpacity = opacity;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    var i;
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibFillColorChange(rgb, value, opacity, fibLevels[i], true, subType, false);
        }
    } else {
        for (i = 0; i < fibLevels.length; i++) {
            var fibOption = fibLevelColors[fibLevels[i].id];
            self.onFibFillColorChange(rgb, fibOption.fillColor, fibOption.fillOpacity, fibLevels[i], false, subType, false);
        }
    }
    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontColorChange = function(rgb, value, isSingleColor, fibLevelColors, subType, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionFontColor = value;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementFontColor = value;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    var i;
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLevelFontColorChange(rgb, value, fibLevels[i], true, subType, false);
        }
    } else {
        for (i = 0; i < fibLevels.length; i++) {
            var fibOption = fibLevelColors[fibLevels[i].id];
            self.onFibLevelFontColorChange(rgb, fibOption.fontColor, fibLevels[i], false, subType, false);
        }
    }
    isPropertyChange && self.onPropertyChange();
    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleLineWidthChange = function(strokeWidth, isSingleColor, fibLevelWidths, subType, isPropertyChange){
    var self = this;
    ann = self.annotation,
    options = ann.options;

    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionLineWidth = strokeWidth;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementLineWidth = strokeWidth;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLineWidthChange(strokeWidth, fibLevels[i].id, true, subType, false);
        }
    } else {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLineWidthChange(fibLevelWidths[fibLevels[i].id].lineWidth, fibLevels[i].id, false, subType, false);
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontSizeChange = function(fontSize, isSingleColor, fibLevelFontSizes, subType, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options;

    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionFontSize = fontSize;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementFontSize = fontSize;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLevelFontSizeChange(fontSize, fibLevels[i].id, true, subType, false);
        }
    } else {
        for (var i = 0; i < fibLevels.length; i++) {
            self.onFibLevelFontSizeChange(fibLevelFontSizes[fibLevels[i].id].fontSize, fibLevels[i].id, false, subType, false);
        }
    }
    self.scale(true);

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleFontWeightChange = function(value, isSingleColor, fibLevelOptions, subType, isPropertyChange){
    var self = this;
    var ann = self.annotation;
    var options = ann.options;
    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
        if(isSingleColor){
            options.extentionFontWeight = value;
        }
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
        if(isSingleColor){
            options.retrancementFontWeight = value;
        }
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }
    var i;
    if (isSingleColor) {
        for (i = 0; i < fibLevels.length; i++) {
            self.onFibLevelFontWeightChange(value, fibLevels[i].id, true, subType, false);
        }
    } else {
        for (i = 0; i < fibLevels.length; i++) {
            var fibOption = fibLevelOptions[fibLevels[i].id];
            self.onFibLevelFontWeightChange(fibOption.fontWeight, fibLevels[i].id, false, subType, false);
        }
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibSingleOptionChange = function(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, isSingleColor, prevOptions, subType, isPropertyChange){
    var self = this;
    var ann = self.annotation,
        options = ann.options;

    if(subType == "fibExtention"){
        options.isSingleColorExtention = isSingleColor;
    }
    if(subType == "fibRetracement"){
        options.isSingleColorRetracement = isSingleColor;
    }
    self.onFibSingleFillColorChange(undefined, fillColor, fillOpacity, isSingleColor, prevOptions, subType, false);
    self.onFibSingleLineColorChange(undefined, lineColor, isSingleColor, prevOptions, subType, false);
    self.onFibSingleLineWidthChange(lineWidth, isSingleColor, prevOptions, subType, false);
    self.onFibSingleFontColorChange(undefined, fontColor, isSingleColor, prevOptions, subType, false);
    self.onFibSingleFontSizeChange(fontSize, isSingleColor, prevOptions, subType, false);
    self.onFibSingleFontWeightChange(fontWeight, isSingleColor, prevOptions, subType, false)

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onFibApplyAllButtonClick = function(fillColor, fillOpacity, lineColor, lineWidth, fontColor, fontSize, fontWeight, prevOptions, subType, isPropertyChange){
    var self = this;

    if(subType == "fibExtention"){
        var fibLevels = self.annotation.options.fibExtentionLevels;
    }
    if(subType == "fibRetracement"){
        var fibLevels = self.annotation.options.fibRetrancementLevels;
    }

    fibLevels.forEach(function (fibLevel) {
        fibLevel.fillColor = fillColor;
        fibLevel.fillOpacity = fillOpacity;
        fibLevel.lineColor = lineColor;
        fibLevel.lineWidth = lineWidth;
        fibLevel.fontColor = fontColor;
        fibLevel.fontSize = fontSize;
        fibLevel.fontWeight = fontWeight;
    });

    self.updateSettings(self.getConfig());
    isPropertyChange && self.onPropertyChange();
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onAlignStyleChange = function(linePosition, subType, isPropertyChange){
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        fibExtentionLevels = options.fibExtentionLevels ? options.fibExtentionLevels : this.fibExtentionLevels,
        fibExtentionLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibExtentionLevels),
        fibRetrancementLevels = options.fibRetrancementLevels ? options.fibRetrancementLevels : this.fibRetrancementLevels,
        fibRetrancementLevels = infChart.drawingUtils.common.sortFibLevelsByValue(fibRetrancementLevels),
        fibonacciExtentionDrawingLabels = self.fibonacciDrawings.labels,
        fibonacciRetrancementDrawingLabels = self.fibRetrancementAdditionalDrawing.labels,
        fibExtentionlineDrawings = self.fibonacciDrawings.lines,
        fibRetrancementLineDrawings = self.fibRetrancementAdditionalDrawing.lines;

    if(subType == "fibExtention"){
        options.extentionLabelPosition = linePosition;
        if(linePosition == "bottomLeft"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: line[1],
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[1]) + fibExtentionDrawingLabel.width + hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topLeft"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: line[1],
                    y: parseFloat(line[2]) - fibExtentionDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[1]) + fibExtentionDrawingLabel.width + hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
                });
            });
        }
        if(linePosition == "bottomCenter"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2,
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2 - fibExtentionDrawingLabel.width/2,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topCenter"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2,
                    y: parseFloat(line[2]) - fibExtentionDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2 - fibExtentionDrawingLabel.width/2,
                    y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
                });
            });
        }
        if(linePosition == "bottomRight"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: line[4] -  fibExtentionDrawingLabel.width,
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[4]) - fibExtentionDrawingLabel.width - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topRight"){
            $.each(fibExtentionlineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibExtentionDrawingLabel = fibonacciExtentionDrawingLabels[key];
                var hideFibLevelButton = self.fibonacciDrawings.hideFibLevelButton[key];
    
                fibExtentionDrawingLabel.attr({
                    x: line[4] - fibExtentionDrawingLabel.width,
                    y: parseFloat(line[2]) - fibExtentionDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[4]) - fibExtentionDrawingLabel.width - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
                });
            });
        }
    }
    if(subType == "fibRetracement"){
        options.retracementLabelPosition = linePosition;
        if(linePosition == "bottomLeft"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: line[1],
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[1]) + fibRetrancementDrawingLabel.width,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topLeft"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: line[1],
                    y: parseFloat(line[2]) - fibRetrancementDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[1]) + fibRetrancementDrawingLabel.width,
                    y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
                });
            });
        }
        if(linePosition == "bottomCenter"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2,
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2 - fibRetrancementDrawingLabel.width/2 - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topCenter"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2,
                    y: parseFloat(line[2]) - fibRetrancementDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: (parseFloat(line[1]) + parseFloat(line[4]))/2 - fibRetrancementDrawingLabel.width/2 - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2]) - hideFibLevelButton.height
                });
            });
        }
        if(linePosition == "bottomRight"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: parseFloat(line[4]) - fibRetrancementDrawingLabel.width,
                    y: parseFloat(line[2])
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[4]) - fibRetrancementDrawingLabel.width - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2])
                });
            });
        }
        if(linePosition == "topRight"){
            $.each(fibRetrancementLineDrawings, function (key, value) {
                var line = value.d.split(' ');
                var fibRetrancementDrawingLabel = fibonacciRetrancementDrawingLabels[key];
                var hideFibLevelButton = self.fibRetrancementAdditionalDrawing.hideFibLevelButton[key];
    
                fibRetrancementDrawingLabel.attr({
                    x: parseFloat(line[4]) - fibRetrancementDrawingLabel.width,
                    y: parseFloat(line[2]) - fibRetrancementDrawingLabel.height
                });
    
                hideFibLevelButton.attr({
                    x: parseFloat(line[4]) - fibRetrancementDrawingLabel.width - hideFibLevelButton.getBBox().width,
                    y: parseFloat(line[2]) - hideFibLevelButton.getBBox().height
                });
            });
        }
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.isVisibleLastLevel = function () {
    var self = this;
    var count = 0;
    $.each(self.fibonacciDrawings.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            count = count + 1;
        }
    });

    $.each(self.fibRetrancementAdditionalDrawing.lines, function (key, value) {
        if (value.visibility !== 'hidden') {
            count = count + 1;
        }
    });

    return count === 1;
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.highlightEachLine = function(){
    let self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        selectedLevel,
        subType,
        dragSupporters = self.dragSupporters,
        container = chart.container,
        additionalDrawings = self.additionalDrawings,
        fibonacciDrawings = self.fibonacciDrawings,
        fibRetrancementAdditionalDrawing = self.fibRetrancementAdditionalDrawing,
        fibExtentionLabels = fibonacciDrawings.labels,
        fibRetrancementLabels = fibRetrancementAdditionalDrawing.labels;

        dragSupporters.forEach(function (dragSupporter) {
            $(dragSupporter.element).mouseenter( function (event) {
                selectedLevel = event.target.getAttribute('level');
                subType = event.target.getAttribute('subType');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }

                if(subType == "fibRetracement"){
                    var lines = fibRetrancementAdditionalDrawing.lines;
                    var fibLabels = fibRetrancementAdditionalDrawing.labels;
                }
                if(subType == "fibExtention"){
                    var lines = fibonacciDrawings.lines;
                    var fibLabels = fibonacciDrawings.labels;
                }
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:'highcharts-label'});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(dragSupporter.element).mouseleave( function (event) {
                selectedLevel = event.target.getAttribute('level');
                subType = event.target.getAttribute('subType');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                if(subType == "fibRetracement"){
                    var lines = fibRetrancementAdditionalDrawing.lines;
                    var fibLabels = fibRetrancementAdditionalDrawing.labels;
                }
                if(subType == "fibExtention"){
                    var lines = fibonacciDrawings.lines;
                    var fibLabels = fibonacciDrawings.labels;
                }
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    if(selectedLine){
                        selectedLine.removeClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.removeClass('label-hover');
                    }
                }
                event.stopPropagation();
            });
        })

        $.each(fibExtentionLabels, function (key, fibonacciExtentionLabel) {
            $(fibonacciExtentionLabel.element).mouseenter( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = fibonacciDrawings.lines;
                var fibLabels = fibonacciDrawings.labels;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:'highcharts-label'});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(fibonacciExtentionLabel.element).mouseleave( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = fibonacciDrawings.lines;
                var fibLabels = fibonacciDrawings.labels;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    if(selectedLine){
                        selectedLine.removeClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.removeClass('label-hover');
                    }
                }
                event.stopPropagation();
            });
        })

        $.each(fibRetrancementLabels, function (key, fibRetrancementLabel) {
            $(fibRetrancementLabel.element).mouseenter( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = fibRetrancementAdditionalDrawing.lines;
                var fibLabels = fibRetrancementAdditionalDrawing.labels;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    $(container).find("path[class*='line-hover']").attr({class:''});
                    $(container).find("g[class*='label-hover']").attr({class:'highcharts-label'});
                    if(selectedLine){
                        selectedLine.addClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.addClass('label-hover');
                    }
                }
                event.stopPropagation();
            });

            $(fibRetrancementLabel.element).mouseleave( function (event) {
                selectedLevel = event.target.getAttribute('level');
                if (!selectedLevel && event.target.parentElement) {
                    if (event.target.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.getAttribute('level');
                    } else if (event.target.parentElement.parentElement && event.target.parentElement.parentElement.getAttribute('level')) {
                        selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                    }
                }
                var lines = fibRetrancementAdditionalDrawing.lines;
                var fibLabels = fibRetrancementAdditionalDrawing.labels;
                if(selectedLevel){
                    var selectedLine = lines[selectedLevel];
                    var selectedLabel = fibLabels[selectedLevel];
                    if(selectedLine){
                        selectedLine.removeClass('line-hover');
                    }
                    if(selectedLabel){
                        selectedLabel.removeClass('label-hover');
                    }
                }
                event.stopPropagation();
            });
        })
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onTrendLineColorChange = function (rgb, color, opacity, isPropertyChange){
    var self = this;
    self.annotation.update({
        shape: {
            params: {
                stroke: color,
                opacity: opacity
            }
        }
    });

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            stroke: color,
            opacity: opacity
        });
    }

    self.annotation.options.trendLineColor = color;
    self.annotation.options.trendLineOpacity = opacity;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onTrendLineWidthChange =  function (strokeWidth, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, self.annotation.options.trendLineStyle, strokeWidth);

    self.annotation.update({
        shape: {
            params: {
                'stroke-width': strokeWidth,
                'stroke-dasharray': strokeDashArray
            }
        }
    });

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            'stroke-width': strokeWidth,
            'stroke-dasharray': strokeDashArray
        });
    }

    self.annotation.options.trendLineWidth = strokeWidth;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};


infChart.fib3PointPriceProjectionGenericDrawing.prototype.onTrendLineStyleChange = function (dashStyle, isPropertyChange) {
    var self = this;
    var strokeDashArray = infChart.drawingUtils.common.settings.getStrokeDashArray.call(self, dashStyle, self.annotation.options.trendLineWidth);

    self.annotation.update({
        shape: {
            params: {
                dashstyle: dashStyle,
                'stroke-dasharray': strokeDashArray
            }
        }
    });

    if (self.additionalDrawings.referenceLine){
        self.additionalDrawings.referenceLine.attr({
            dashstyle: dashStyle,
            'stroke-dasharray': strokeDashArray
        });
    }

    self.annotation.options.trendLineStyle = dashStyle;

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.fib3PointPriceProjectionGenericDrawing.prototype.onTrendLineToggleShow = function(checked, isPropertyChange){
    var self = this,
        ann = self.annotation,
        options = ann.options,
        additionalDrawings = self.additionalDrawings;

    options.isTrendLineAlways = checked;
    if(checked){
        if(ann){
            ann.shape.show();
            if(additionalDrawings && additionalDrawings.referenceLine){
                additionalDrawings.referenceLine.show();
            }
            self.resetDragSupporters();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
};