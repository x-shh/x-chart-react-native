window.infChart = window.infChart || {};

infChart.timestampMarkerDrawing = function () {
    this.labelText = '<img style = "width : 41px; height : 40px; text-align:center;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjUuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzAwQjdGRjt9Cjwvc3R5bGU+CjxnIGlkPSJpY29tb29uLWlnbm9yZSI+CjwvZz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTI1NiwwQzE2Ny42LDAsOTYsNzEuNiw5NiwxNjBjMCwxNjAsMTYwLDM1MiwxNjAsMzUyczE2MC0xOTIsMTYwLTM1MkM0MTYsNzEuNiwzNDQuNCwwLDI1NiwweiBNMjU2LDI1NgoJYy01MywwLTk2LTQzLTk2LTk2czQzLTk2LDk2LTk2czk2LDQzLDk2LDk2UzMwOSwyNTYsMjU2LDI1NnoiLz4KPC9zdmc+Cg==" alt="Time Stamp Marker" />';
    infChart.drawingObject.apply(this, arguments);
};

infChart.timestampMarkerDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.timestampMarkerDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options;

    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["timestampMarker"];
    var firstPointTimeStamp = chart.series[0].xData[0];

    self.additionalDrawings.pointerLabel = chart.renderer.createElement('foreignObject').add(ann.group).attr({
        "zIndex": 1,
        width: '44',
        height: '40'
    });

    var labelHtml = "<div>" + this.labelText + "</div>";
    self.additionalDrawings.pointerLabel.element.innerHTML = labelHtml;

    if (firstPointTimeStamp > options.timestamp) {
        self.additionalDrawings.pointerLabel.hide();
    } else {
        self.additionalDrawings.pointerLabel.show();
    }
};

infChart.timestampMarkerDrawing.prototype.beforeDestroy = function () {
    this.additionalDrawings['pointerLabel'].destroy();
};

infChart.timestampMarkerDrawing.prototype.calculateHeikinAshitypevalues = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        yAxis = chart.yAxis[options.yAxis],
        timestamp = options.timestamp;

    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, timestamp, undefined, true);
    var series = chart.series[0].yData;
    if (chart.series[0].prevPoint) {
        var high = chart.series[0].prevPoint[nearestDataPointForXValue.dataIndex].xPoint.high;
    } else {
        var open, close, high, low;
        for (var i = 0; i <= nearestDataPointForXValue.dataIndex; i++) {
            if (i == 0) {
                open = (series[i][0] + series[i][3]) / 2;
                close = (series[i][0] + series[i][3] + series[i][1] + series[i][2]) / 4;
            } else {
                open = (open + close) / 2;
                close = (series[i][0] + series[i][3] + series[i][1] + series[i][2]) / 4;
            }
            high = Math.max(open, close, series[i][1]);
            low = Math.min(open, close, series[i][2]);
        }
    }

    var yValue = high;
    return yValue;
}

infChart.timestampMarkerDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'timestampMarker',
        timestamp: annotation.options.timestamp,
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd    
    };
};

infChart.timestampMarkerDrawing.prototype.getOptions = function (properties, chart) {

    var nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, properties.timestamp, undefined, true);
    var xValue = nearestDataPointForXValue.xData;
    var yValue;

    var options = {
        xValue: xValue,
        yValue: yValue,
        nearestXDataPoint: nearestDataPointForXValue,
        drawingType: infChart.constants.drawingTypes.shape,
        timestamp: properties.timestamp,
        allowDragY: false,
        allowDragX: false,
        disableCopyPaste: true
    };

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;
    }

    return options;
};

infChart.timestampMarkerDrawing.prototype.loadSettingWindow = function (hide, options) { };

infChart.timestampMarkerDrawing.prototype.step = function () { };

infChart.timestampMarkerDrawing.prototype.stop = function () { };

infChart.timestampMarkerDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        timestamp = options.timestamp,
        pointerLabel = self.additionalDrawings['pointerLabel'];

    var chartType = chart.series[0].type,
        firstPointTimeStamp = chart.series[0].xData[0],
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, timestamp, undefined, true);

    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);

    var newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(options.xValue);
    var yValue;

    if (chartType == 'area' || chartType == 'line' || chartType == 'column' || chartType == 'step') {
        yValue = nearestDataPointForXValue.yData[3];
    } else if (chartType == 'heikinashi') {
        yValue = self.calculateHeikinAshitypevalues();
    } else {
        yValue = nearestDataPointForXValue.yData[1];
    }

    if (!chartInstance.isLog && chartInstance.isCompare) {
        yValue = infChart.drawingUtils.common.getYValue.call(self, yValue);
    }

    var newY = yAxis.toPixels(yValue) - yAxis.toPixels(options.yValue);
    ann.update(yValue);
    pointerLabel.attr({
        x: newX - (pointerLabel.getBBox().width / 2),
        y: newY - pointerLabel.getBBox().height
    });

    if (firstPointTimeStamp > timestamp) {
        pointerLabel.hide();
    } else {
        pointerLabel.show();
    }
};

infChart.timestampMarkerDrawing.prototype.getContextMenuOptions = function (chartId, drawingId, options , event) {};
