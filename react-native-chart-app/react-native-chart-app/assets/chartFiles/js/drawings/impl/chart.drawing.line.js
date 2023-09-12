window.infChart = window.infChart || {};

const UPPER_LIMIT_ANGLE = 67.5;
const LOWER_LIMIT_ANGLE = 22.5;
const RIGHT_ANGLE = 90;
const ANGLE_180 = 180;

infChart.lineDrawing = function () {
    this.borderColor = '#959595';
    this.labelDataItems = [
        {id: "priceRange", displayName: "Price Range", enabled: false},
        {id: "barsRange", displayName: "Bars Range", enabled: false},
        {id: "angle", displayName: "Angle", enabled: false},
        {id: "duration", displayName: "Duration", enabled: false}
    ];
    this.lineText = "";
    this.lineTextChecked = true;
    this.fontSize = "12px";
    this.fillColor = "#fff";
    this.StartArrowEnabled = true, 
    this.endArrowEnabled = true,
    this.showPriceDifferentIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjUuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyMDAgMTIwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNzk5LjUsODU3LjJsLTU4LjgtNTguOEw2NDAsODkwLjVWMzA5LjNsMTAxLjYsOTIuOWw1OC44LTU4LjhMNjAyLjcsMTYyLjVoMjM5LjYKCUM4NTcuNSwyMTUuOSw5MDYuNywyNTUsOTY1LDI1NWM3MC40LDAsMTI3LjUtNTcuMSwxMjcuNS0xMjcuNVMxMDM1LjQsMCw5NjUsMGMtNTguMywwLTEwNy40LDM5LjEtMTIyLjYsOTIuNUgxMDcuNXY3MGg0ODkuOAoJTDM5OS42LDM0My40bDU4LjgsNTguOEw1NjAsMzA5LjN2NTgxLjJsLTEwMC44LTkyLjFsLTU4LjgsNTguOGwxOTcsMTgwLjNIMzU3LjdDMzQyLjUsOTg0LjEsMjkzLjMsOTQ1LDIzNSw5NDUKCWMtNzAuNCwwLTEyNy41LDU3LjEtMTI3LjUsMTI3LjVTMTY0LjYsMTIwMCwyMzUsMTIwMGM1OC4zLDAsMTA3LjQtMzkuMSwxMjIuNi05Mi41aDczNC44di03MEg2MDIuNUw3OTkuNSw4NTcuMnogTTk2NSw3Mi43CgljMzAuMywwLDU0LjgsMjQuNSw1NC44LDU0LjhjLTAuMSwzMC4zLTI0LjYsNTQuOC01NC44LDU0LjhjLTMwLjMsMC01NC44LTI0LjUtNTQuOC01NC44UzkzNC43LDcyLjcsOTY1LDcyLjd6IE0yMzUsMTEyNy4zCgljLTMwLjMsMC01NC44LTI0LjUtNTQuOC01NC44czI0LjUtNTQuOCw1NC44LTU0LjhzNTQuOCwyNC41LDU0LjgsNTQuOFMyNjUuMywxMTI3LjMsMjM1LDExMjcuM3oiLz4KPC9zdmc+Cg==" alt="Price Range" />';
    this.showTimeDifferenceIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjUuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyMDAgMTIwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTY2LjEsNTk3LjVWMTExLjdIOTYuN3Y3MjguN0M0My44LDg1NS41LDUsOTA0LjEsNSw5NjJjMCw2OS44LDU2LjYsMTI2LjQsMTI2LjQsMTI2LjRzMTI2LjQtNTYuNiwxMjYuNC0xMjYuNAoJYzAtNTcuOC0zOC44LTEwNi42LTkxLjctMTIxLjdWNjAyLjVsMTc4LjgsMTk1LjRsNTguMy01OC4zbC05MS4zLTk5LjloNTc2LjRsLTkyLjEsMTAwLjhsNTguMyw1OC4zbDE3OS40LTE5NnY0ODUuN2g2OS40VjM1OS42CgljNTMtMTUuMSw5MS43LTYzLjgsOTEuNy0xMjEuNmMwLTY5LjgtNTYuNi0xMjYuNC0xMjYuNC0xMjYuNFM5NDIuMSwxNjguMiw5NDIuMSwyMzhjMCw1Ny44LDM4LjgsMTA2LjYsOTEuNywxMjEuN3YyMzcuNmwtMTc5LjQtMTk2CglsLTU4LjMsNTguM2w5Mi4xLDEwMC44SDMxMS45bDkxLjMtOTkuOWwtNTguMy01OC4zTDE2Ni4xLDU5Ny41eiBNMTA2OC42LDI5Mi40Yy0zMCwwLTU0LjMtMjQuMy01NC4zLTU0LjMKCWMwLTI5LjksMjQuMy01NC4yLDU0LjMtNTQuM2MzMCwwLDU0LjMsMjQuMyw1NC4zLDU0LjNTMTA5OC42LDI5Mi40LDEwNjguNiwyOTIuNHogTTEzMS40LDkwNy42YzMwLDAsNTQuMywyNC4zLDU0LjMsNTQuMwoJcy0yNC4zLDU0LjMtNTQuMyw1NC4zUzc3LjEsOTkyLDc3LjEsOTYyUzEwMS40LDkwNy42LDEzMS40LDkwNy42eiIvPgo8L3N2Zz4K" alt="Bars Range" />';
    this.showDegreesIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjUuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMjAwIDEyMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyMDAgMTIwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTA2OS41LDkzMy42Yy01Ni4yLDAtMTAzLjgsMzctMTE5LjgsODhINjc3Yy00LjQtNzYuOS0yMS44LTE1MS42LTUxLjgtMjIyLjUKCWMtMzMuMi03OC40LTgwLjMtMTQ4LjktMTQwLjEtMjA5LjdsMjg3LjItMzMxLjhjMTQuNCw1LjcsMzAsOC45LDQ2LjQsOC45YzY5LjMsMCwxMjUuNS01Ni4yLDEyNS41LTEyNS41Uzg4OCwxNS41LDgxOC43LDE1LjUKCVM2OTMuMiw3MS43LDY5My4yLDE0MWMwLDI0LjEsNi44LDQ2LjYsMTguNiw2NS43TDQyNi41LDUzNi4ybC01MS44LDU5LjdMNi42LDEwMjEuNWwwLjEsMC4xSDV2NzloNTkyLjhINjc3aDI3NC4xCgljMTcuMSw0OC45LDYzLjcsODQsMTE4LjQsODRjNjkuMywwLDEyNS41LTU2LjIsMTI1LjUtMTI1LjVTMTEzOC44LDkzMy42LDEwNjkuNSw5MzMuNnogTTgxOC43LDg2LjljMjkuOSwwLDU0LjEsMjQuMiw1NC4xLDU0LjEKCXMtMjQuMyw1NC01NC4xLDU0cy01NC4xLTI0LjItNTQuMS01NC4xUzc4OC44LDg2LjksODE4LjcsODYuOXogTTExMS4xLDEwMjEuNmwzMjIuMS0zNzIuMkM0ODMuOSw3MDIsNTI0LDc2Mi42LDU1Mi40LDgyOS45CgljMjUuOSw2MS4xLDQxLDEyNS41LDQ1LjQsMTkxLjdMMTExLjEsMTAyMS42TDExMS4xLDEwMjEuNnogTTEwNjkuNSwxMTEzLjFjLTI5LjksMC01NC4xLTI0LjItNTQuMS01NC4xczI0LjItNTQuMSw1NC4xLTU0LjEKCXM1NC4xLDI0LjIsNTQuMSw1NC4xUzEwOTkuNCwxMTEzLjEsMTA2OS41LDExMTMuMXoiLz4KPC9zdmc+Cg==" alt="Angle" />';
    this.showDurationIcon = '<img style = "width : 15px; height : 15px;" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI3LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEwMjQgMTAyNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8ZyBpZD0iaWNvbW9vbi1pZ25vcmUiPgo8L2c+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02MDguMSwyNjUuOXYzMjIuOWMwLDYuNy0yLjEsMTIuMy02LjUsMTYuNmMtNC4zLDQuMy05LjksNi41LTE2LjYsNi41SDM1NC40Yy02LjcsMC0xMi4zLTIuMS0xNi42LTYuNQoJYy00LjMtNC4zLTYuNS05LjktNi41LTE2LjZ2LTQ2LjFjMC02LjcsMi4xLTEyLjMsNi41LTE2LjZjNC4zLTQuMyw5LjktNi41LDE2LjYtNi41aDE2MS40VjI2NmMwLTYuNywyLjEtMTIuMyw2LjUtMTYuNgoJYzQuMy00LjMsOS45LTYuNSwxNi42LTYuNUg1ODVjNi43LDAsMTIuMywyLjEsMTYuNiw2LjVDNjA1LjksMjUzLjcsNjA4LjEsMjU5LjMsNjA4LjEsMjY1LjlMNjA4LjEsMjY1Ljl6IE04NzIuOCw3MjEuMQoJYzM3LjMtNjMuOSw1Ni0xMzMuNiw1Ni0yMDkuMXMtMTguNy0xNDUuMi01Ni0yMDkuMUM4MzUuNSwyMzksNzg1LDE4OC41LDcyMS4xLDE1MS4ycy0xMzMuNi01Ni0yMDkuMS01NgoJYy03NS41LDAtMTQ1LjIsMTguNy0yMDkuMSw1NlMxODguNSwyMzksMTUxLjIsMzAyLjljLTM3LjMsNjMuOS01NiwxMzMuNi01NiwyMDkuMXMxOC43LDE0NS4yLDU2LDIwOS4xUzIzOSw4MzUuNSwzMDIuOSw4NzIuOAoJczEzMy42LDU2LDIwOS4xLDU2czE0NS4yLTE4LjcsMjA5LjEtNTZDNzg1LDgzNS41LDgzNS41LDc4NSw4NzIuOCw3MjEuMXogTTk1MS42LDI1Ny41YzQ1LjQsNzcuNiw2OC4xLDE2Mi40LDY4LjEsMjU0LjUKCVM5OTcsNjg5LjIsOTUxLjYsNzY3LjFjLTQ1LjQsNzcuNi0xMDcuMSwxMzkuMS0xODUuMSwxODQuNUM2ODksOTk3LDYwNC4yLDEwMTkuNyw1MTIsMTAxOS43UzMzNC44LDk5NywyNTYuOSw5NTEuNgoJYy03Ny43LTQ1LjQtMTM5LjEtMTA2LjgtMTg0LjUtMTg0LjVDMjcsNjg5LjIsNC4zLDYwNC4xLDQuMyw1MTJTMjcsMzM1LDcyLjQsMjU3LjVjNDUuNC03OCwxMDYuOC0xMzkuNywxODQuNS0xODUuMQoJQzMzNC44LDI3LDQxOS45LDQuMyw1MTIsNC4zUzY4OSwyNyw3NjYuNSw3Mi40Qzg0NC41LDExNy44LDkwNi4yLDE3OS41LDk1MS42LDI1Ny41eiIvPgo8L3N2Zz4K" alt="Duration" />';
    infChart.drawingObject.apply(this, arguments);
};

infChart.lineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.lineDrawing.prototype.additionalDrawingsFunction = function () {
    var ann = this.annotation;
    var options = ann.options;
    var chart = ann.chart;
    var additionalDrawingsArr = this.additionalDrawings;
    var xAxis = chart.xAxis[options.xAxis];
    var nearestXValue = infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, true, true);
    var newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(options.xValue);
    var basicText = "";
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.lines = [];
    additionalDrawingsArr.lineArrow = [];

    $.each(this.labelDataItems, function (index, labelDataItem) {
        if (labelDataItem.enabled) {
            basicText += (basicText !== "" ? '<br>' : '') + "--";
        }
    });

    var dashArrayValues = infChart.drawingUtils.common.settings.getStrokeDashArray(options.shape.params.dashstyle, options.shape.params['stroke-width']);

    drawingLineAttr = {
        'stroke-width' : options.shape.params['stroke-width'],
        'dash-style': options.shape.params.dashstyle,
        'fill-color': options.shape.params.fill,
        'stroke' : options.shape.params.stroke,
        'fill-opacity': options.shape.params['stroke-opacity'],
        'stroke-dasharray': dashArrayValues,
        'stroke-opacity': options.shape.params['stroke-opacity'],
        'cursor': 'move'
    }

    var { 'dash-style': _, 'stroke-dasharray': __, ...newDrawingLineAttr } = drawingLineAttr;

    additionalDrawingsArr.labels["lineData"] = this.getLabel(basicText, 0, 0).hide();
    additionalDrawingsArr.labels["lineText"] = this.getTextLabel(this.lineText, 0, 0).hide();
    additionalDrawingsArr.lines["left"] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingLineAttr).add(ann.group);
    additionalDrawingsArr.lines["right"] = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr(drawingLineAttr).add(ann.group);
    additionalDrawingsArr.lineArrow["startPointHead"]= chart.renderer.path(['M', 0, 0, 'L', 0, 0,'L', 0, 0]).attr(newDrawingLineAttr).add(ann.group);
    additionalDrawingsArr.lineArrow["endPointHead"]= chart.renderer.path(['M', 0, 0, 'L', 0, 0,'L', 0, 0]).attr(newDrawingLineAttr).add(ann.group);

    ann.selectionMarker = [];
    infChart.drawingUtils.common.addSelectionMarker.call(this, ann, newX, 0);
    $.each(ann.selectionMarker, function (index, selectionMarker) {
        if (selectionMarker) {
            selectionMarker.show();
        }
    });

    if(!options.settings.isStartPoint){
        additionalDrawingsArr.lineArrow["startPointHead"].hide();
    }
    if(!options.settings.isEndPoint){
        additionalDrawingsArr.lineArrow["endPointHead"].hide();
    }

    if(!options.settings.isExtendLeft){
        additionalDrawingsArr.lines["left"].hide();
    }
    if(!options.settings.isExtendRight){
        additionalDrawingsArr.lines["right"].hide();
    }
};


infChart.lineDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    return {
        shape: 'line',
        settings: {
            lineColor: annotation.options.shape.params.stroke ? infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'line') : annotation.options.settings.lineColor,
            lineOpacity: annotation.options.settings.lineOpacity,
            lineWidth: annotation.options.shape.params['stroke-width'] ? annotation.options.shape.params['stroke-width'] : annotation.options.settings.lineWidth,
            lineStyle: annotation.options.shape.params.dashstyle ? annotation.options.shape.params.dashstyle : annotation.options.settings.linestyle,
            isExtendLeft: annotation.options.settings.isExtendLeft,
            isExtendRight: annotation.options.settings.isExtendRight,
            isStartPoint: annotation.options.settings.isStartPoint,
            isEndPoint: annotation.options.settings.isEndPoint,
            textColor: annotation.options.settings.textColor,
            textOpacity: annotation.options.settings.textOpacity,
            lineTextChecked: annotation.options.settings.lineTextChecked,
            textFontSize: annotation.options.settings.textFontSize,
            textFontWeight: annotation.options.settings.textFontWeight,
            textFontStyle: annotation.options.settings.textFontStyle,
            textDecoration: annotation.options.settings.textDecoration
        },
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        calculatedLabelData: annotation.options.calculatedLabelData,
        isLocked : annotation.options.isLocked,
        lineText: annotation.options.lineText,
        labelDataItems: annotation.options.labelDataItems
        };
};

infChart.lineDrawing.prototype.getConfigToCopy = function () {
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(this.annotation.chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var xAxis = chartInstance.getMainXAxis();
    var yAxis = chartInstance.getMainYAxis();
    var shapeTheme = infChart.drawingUtils.common.theme["line"];
    var copyDistance = shapeTheme && shapeTheme.copyDistance;
    var defaultCopyDistance = infChart.drawingUtils.common.theme.defaultCopyDistance;
    var copyDistanceX = (copyDistance && (copyDistance.x || copyDistance.x == 0)) ? copyDistance.x : defaultCopyDistance;
    var copyDistanceY = (copyDistance && (copyDistance.y || copyDistance.y == 0)) ? copyDistance.y : defaultCopyDistance;
    var properties = this.getConfig();
    var angle = infChart.drawingUtils.common.getAngle({
        x: xAxis.toPixels(properties.xValue),
        y: yAxis.toPixels(properties.yValue)
    }, { x: xAxis.toPixels(properties.xValueEnd), y: yAxis.toPixels(properties.yValueEnd) });
    var near45 = Math.abs(angle - 45) < 5;

    properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
    properties.xValueEnd = xAxis.toValue(xAxis.toPixels(properties.xValueEnd) + copyDistanceX);

    if (!near45) {
        properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
        properties.yValueEnd = yAxis.toValue(yAxis.toPixels(properties.yValueEnd) + copyDistanceY);
    }
    return properties;
};

infChart.lineDrawing.prototype.getOptions = function (properties, chart) {
    var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, properties.xValue, undefined, true, true);
    var theme = infChart.drawingUtils.common.getTheme();
    var shapeTheme = theme["trendLine"];
    var options = {
        xValue: properties.xValue,
        yValue: properties.yValue,
        nearestXValue: nearestDataForXValue.xData,
        nearestXValueIndex: nearestDataForXValue.dataIndex,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                'stroke-width': infChart.drawingUtils.common.baseLineWidth
            }
        },
        settings: {},
        labelDataItems: properties.labelDataItems ? properties.labelDataItems : this.labelDataItems,
    };
    if(properties.settings) {
        options.settings = properties.settings;

        if (properties.settings.lineColor) {
            options.shape.params.stroke = properties.settings.lineColor;
        }
        if (properties.settings.lineOpacity) {
            options.shape.params['stroke-opacity'] = properties.settings.lineOpacity;
        }

        if (properties.settings.lineWidth) {
            options.shape.params['stroke-width'] = properties.settings.lineWidth;
        }

        if (properties.settings.lineStyle) {
            options.shape.params.dashstyle = properties.settings.lineStyle;
        }
    } else {
        options.settings.lineColor = infChart.drawingUtils.common.baseBorderColor;
        options.settings.lineOpacity = infChart.drawingUtils.common.baseFillOpacity;
        options.settings.lineStyle = 'solid';
        options.settings.lineWidth = infChart.drawingUtils.common.baseLineWidth;
        options.settings.isExtendRight = false;
        options.settings.isExtendLeft = false;
        options.settings.isStartPoint = false;
        options.settings.isEndPoint = false;
        options.settings.textColor = shapeTheme.label.fontColor;
        options.settings.textOpacity = shapeTheme.label.fontOpacity;
        options.settings.lineTextChecked = this.lineTextChecked;
        options.settings.textFontSize = shapeTheme.label.fontSize;
        options.settings.textFontWeight = shapeTheme.label.fontWeight;
        options.settings.textFontStyle = shapeTheme.label.fontStyle;
        options.settings.textDecoration = shapeTheme.label.textDecoration;

    }

    if(properties.lineText){
        options.lineText = properties.lineText;
    } else {
        options.lineText = this.lineText;
    }

    if (properties.xValueEnd && properties.yValueEnd) {
        options.xValueEnd = properties.xValueEnd;
        options.yValueEnd = properties.yValueEnd;

        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, properties.xValueEnd, undefined, true, true);
        options.nearestXValueEnd = nearestDataForXValueEnd.xData;
        options.nearestXValueEndIndex = nearestDataForXValueEnd.dataIndex;
    }
    if(properties.calculatedLabelData) {
        options.calculatedLabelData = properties.calculatedLabelData;
    }

    options.validateTranslationFn = this.validateTranslation;
    options.isRealTimeTranslation = true;

    options = infChart.Drawing.prototype.getOptions(properties,options);

    return options;
};

infChart.lineDrawing.prototype.getQuickSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineQuickSettings(infChart.drawingUtils.common.baseBorderColor, infChart.drawingUtils.common.baseFillOpacity);
};

infChart.lineDrawing.prototype.validateTranslation = function (newXValue) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        seriesData = chart.series[0].xData,
        dataMin = seriesData[0],
        xVal = options.xValue,
        xValEnd = options.xValueEnd,
        newXValueEnd = xValEnd - xVal + newXValue,
        totalPoints = infChart.drawingsManager.getTotalPoints(chart),
        dataMax = totalPoints[totalPoints.length - 1];

    return (newXValue >= dataMin && newXValue <= dataMax) && (newXValueEnd >= dataMin && newXValueEnd <= dataMax);
};

infChart.lineDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var ann = this.annotation,
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        options = ann.options,
        line = ['M', 0, 0, 'L'],
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        nearestDataPointForXValue, nearestDataPointForXValueEnd;
        var newX, newXEnd;
        var yEnd = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);

    if (isCalculateNewValueForScale) {
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(ann.options.xValue);
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(ann.options.xValue);
    } else {
        newX = xAxis.toPixels(options.nearestXValue) - xAxis.toPixels(ann.options.xValue);
        newXEnd = xAxis.toPixels(options.nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);
    }
    
    line[1] = newX;
    line[4] = newXEnd;
    line[5] = (!isNaN(yEnd) && yEnd) || 0;

    if (isCalculateNewValueForScale) {
        ann.update({
            nearestXValue: nearestDataPointForXValue.xData,
            nearestXValueIndex: nearestDataPointForXValue.dataIndex,
            nearestXValueEnd: nearestDataPointForXValueEnd.xData,
            nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
            shape: {
                params: {
                    d: line
                }
            }
        });
        this.calculateAndUpdateLabel({
            nearestXValue: nearestDataPointForXValue.xData,
            nearestXValueIndex: nearestDataPointForXValue.dataIndex,
            nearestXValueEnd: nearestDataPointForXValueEnd.xData,
            nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
            yValueEnd: options.yValueEnd
        });
    } else {
        ann.update({
            shape: {
                params: {
                    d: line
                }
            }
        });
        this.calculateAndUpdateLabel({
            nearestXValue: options.nearestXValue,
            nearestXValueIndex: options.nearestXValueIndex,
            nearestXValueEnd: options.nearestXValueEnd,
            nearestXValueEndIndex: options.nearestXValueEndIndex,
            yValueEnd: options.yValueEnd
        });
    }

    this.updateLineWithArrowHeadsAndPoints();
    this.calculateAndUpdateTextLabel();
    self.resetDragSUpporters();
};

infChart.lineDrawing.prototype.selectAndBindResize = function () {
    var ann = this.annotation,
        chart = ann.chart,
         options = ann.options,
        width,
        height,
        pathDefinition,
        xAxis = chart.xAxis[options.xAxis],
        nearestXValue = infChart.math.findNearestXDataPoint(chart, options.xValue, undefined, true, true),
        nearestXValueEnd = infChart.math.findNearestXDataPoint(chart, options.xValueEnd, undefined, true, true),
        newX = xAxis.toPixels(nearestXValue) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestXValueEnd) - xAxis.toPixels(ann.options.xValue);

    ann.events.deselect.call(ann);
    ann.selectionMarker = [];
    pathDefinition = ann.shape.d.split(' ');

    width = parseFloat(pathDefinition[4]);
    height = parseFloat(pathDefinition[5]);

    if (!isNaN(width) && !isNaN(height)) {
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, newX, 0, this.stepFunction, this.stop, true);
        infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, newXEnd, height, this.stepFunction, this.stop, false);
    }
    console.error("selectAndBindResize");
};

infChart.lineDrawing.prototype.step = function (e, isStartPoint) {
    var ann = this.annotation,
        points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
        options = ann.options,
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        xValueEnd = xAxis.toValue(xAxis.toPixels(options.xValue) + points.dx),
        yValueEnd = yAxis.toValue(yAxis.toPixels(options.yValue) + points.dy),
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true),
        newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(ann.options.xValue),
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(ann.options.xValue),
        newYEnd = parseInt(points.dy, 10),
        newY = 0;

    if (infChart.manager.shiftKeyPressed) {
        var cordinateData = this.snapLine(ann, newX, newY, newXEnd, newYEnd, xValueEnd, yValueEnd, nearestDataPointForXValue, nearestDataPointForXValueEnd, points, isStartPoint);
        newX = cordinateData.newX;
        newY = cordinateData.newY;
        newXEnd = cordinateData.newXEnd;
        newYEnd = cordinateData.newYEnd;
        nearestDataPointForXValue = cordinateData.nearestDataPointForXValue;
        nearestDataPointForXValueEnd = cordinateData.nearestDataPointForXValueEnd;
        yValueEnd = cordinateData.yValueEnd;
    } 

    var line = ["M", newX, newY, 'L', parseInt(newXEnd, 10), newYEnd ];
    ann.shape.attr({
        d: line
    });


    this.calculateAndUpdateLabel({
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        yValueEnd: yValueEnd
    });

    this.updateLineWithArrowHeadsAndPoints(line, ann, additionalDrawingsArr);
    this.calculateAndUpdateTextLabel();

    return {line: line, nearestDataPointForXValue: nearestDataPointForXValue, nearestDataPointForXValueEnd: nearestDataPointForXValueEnd};
};

infChart.lineDrawing.prototype.snapLine = function (ann, newX, newY, newXEnd, newYEnd, xValueEnd, yValueEnd, nearestDataPointForXValue, nearestDataPointForXValueEnd,points, isStartPoint) {
    var xValue, yValue,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    var angle = (-1) * infChart.drawingUtils.common.getAngle(
        {
            x: parseInt(newX, 10),
            y: yAxis.toPixels(ann.options.yValue)
        },
        {
            x: parseInt(parseInt(newXEnd, 10), 10),
            y: yAxis.toPixels(yValueEnd)
        });

    var convertedAngle = Math.abs(angle) > RIGHT_ANGLE ? ANGLE_180 - Math.abs(angle) : Math.abs(angle);
    
    if (convertedAngle < LOWER_LIMIT_ANGLE && convertedAngle > 0) {
        if (isStartPoint) {
            yValue = (yAxis.toValue(newYEnd + yAxis.toPixels(options.yValue)));
            ann.update({
                yValue: yValue
            }); 
        }
        newYEnd = 0;
        yValueEnd = ann.options.yValue;
    }

    if (convertedAngle > UPPER_LIMIT_ANGLE && convertedAngle < RIGHT_ANGLE) {
        if (isStartPoint) {
            newX = newXEnd;
            nearestDataPointForXValue = nearestDataPointForXValueEnd;
        } else {
            newXEnd = 0
            nearestDataPointForXValueEnd = nearestDataPointForXValue;
        }
    }

    if (convertedAngle < UPPER_LIMIT_ANGLE && convertedAngle > LOWER_LIMIT_ANGLE) {
        var radians = convertedAngle * Math.PI / ANGLE_180;
        var convertedLineXlength = (points.dx * Math.cos(45 - radians)) / (Math.cos(radians) * Math.sqrt(2)); //length of 45 degree line in x axis
        var newYLength = angle < 0 && angle > -ANGLE_180 ? (-1) * Math.abs(convertedLineXlength) : Math.abs(convertedLineXlength);
        if (isStartPoint) {
            xValue = xAxis.toValue(points.dx - convertedLineXlength + xAxis.toPixels(options.xValue));
            yValue = (yAxis.toValue((newYLength + points.dy) + yAxis.toPixels(options.yValue)));

            ann.update({
                xValue: xValue,
                yValue: yValue
            });
            nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, xValue, undefined, true, true);
            newX = xAxis.toPixels(nearestDataPointForXValue.xData) - xAxis.toPixels(xValue);
            newY = angle < 0 && angle > (-1) * RIGHT_ANGLE || angle < ANGLE_180 && angle > RIGHT_ANGLE ? newX : (-1) * newX;

        }
        xValueEnd = xAxis.toValue(convertedLineXlength + xAxis.toPixels(ann.options.xValue) );
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, xValueEnd, undefined, true, true);            
        newXEnd = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(ann.options.xValue);
        newYEnd = angle < 0 && angle > (-1) * RIGHT_ANGLE || angle < ANGLE_180 && angle > RIGHT_ANGLE ? parseInt(newXEnd, 10) : (-1) * parseInt(newXEnd, 10);
        yValueEnd = yAxis.toValue(newYEnd + yAxis.toPixels(ann.options.yValue));
    }
    return {
        newX: newX, 
        newY: newY,
        newXEnd: newXEnd, newYEnd: newYEnd,
        nearestDataPointForXValue: nearestDataPointForXValue,
        nearestDataPointForXValueEnd: nearestDataPointForXValueEnd,
        yValueEnd: yValueEnd
    };
}


infChart.lineDrawing.prototype.stop = function (e, isStartPoint) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        lineData = this.stepFunction(e, isStartPoint),
        line = lineData.line,
        xAxis = chart.xAxis[ann.options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis],
        x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
        y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
        startY = yAxis.toValue(line[2] + yAxis.toPixels(ann.options.yValue));

    line[1] = 0;
    line[4] = xAxis.toPixels(lineData.nearestDataPointForXValueEnd.xData) - xAxis.toPixels(lineData.nearestDataPointForXValue.xData);
    line[5] = line[5] - line [2];
    line[2] = 0;

    ann.update({
        xValue: lineData.nearestDataPointForXValue.xData,
        xValueEnd: lineData.nearestDataPointForXValueEnd.xData,
        yValue: startY,
        yValueEnd: y,
        nearestXValue: lineData.nearestDataPointForXValue.xData,
        nearestXValueIndex: lineData.nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: lineData.nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: lineData.nearestDataPointForXValueEnd.dataIndex,
        shape: {
            params: {
                d: line
            }
        }
    });

    this.updateLineWithArrowHeadsAndPoints();
    infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y);
    self.resetDragSUpporters();

    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
    infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.lineDrawing.prototype.translate = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        additionalDrawingsArr = this.additionalDrawings,
        line = ann.shape.d.split(' '),
        xAxis = chart.xAxis[options.xAxis],
        nearestDataPointForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true),
        nearestDataPointForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);

    var xValueDiff = xAxis.toPixels(nearestDataPointForXValueEnd.xData) - xAxis.toPixels(nearestDataPointForXValue.xData);
    var newLine = ["M", 0, 0, 'L', xValueDiff, line[5]];

    ann.update({
        xValue: nearestDataPointForXValue.xData,
        xValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        shape: {
            params: {
                d: newLine
            }
        }
    });

    this.calculateAndUpdateLabel({
        nearestXValue: nearestDataPointForXValue.xData,
        nearestXValueIndex: nearestDataPointForXValue.dataIndex,
        nearestXValueEnd: nearestDataPointForXValueEnd.xData,
        nearestXValueEndIndex: nearestDataPointForXValueEnd.dataIndex,
        yValueEnd: options.yValueEnd
    });

    this.calculateAndUpdateTextLabel();
    var newXEnd = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
    // Update new position of the selection marker when scaling the chart while line is selected
    if (ann.selectionMarker && ann.selectionMarker.length > 1) {
        ann.selectionMarker[0].attr({
            x: 0
        });  
        ann.selectionMarker[1].attr({
            x: newXEnd
        });
    } 

    this.updateLineWithArrowHeadsAndPoints();
    self.selectAndBindResize();
    chart.selectedAnnotation = ann;  
    self.resetDragSUpporters();
}

infChart.lineDrawing.prototype.translateEnd = function () {
    var ann = this.annotation;
    this.selectAndBindResize();
    ann.chart.selectedAnnotation = ann; 
    infChart.drawingUtils.common.onPropertyChange.call(this);
};


infChart.lineDrawing.prototype.getSettingsPopup = function () {
    return infChart.drawingUtils.common.getLineSettings('Line', infChart.drawingUtils.common.baseBorderColor, this.labelDataItems, true, this.fontSize, this.fontColor, infChart.drawingUtils.common.baseFillOpacity, this.StartArrowEnabled, this.endArrowEnabled);
};


/**
 * Change the color of the annotation from the given params
 * IMPORTANT :: this method is used in commands.wrappers to set undo/redo actions
 * @param {object} labelItemId changed label item id
 * @param {string} value
 * @param {boolean|undefined} isPropertyChange property change
 */
 infChart.lineDrawing.prototype.onLabelItemsChange = function (labelItemId, value, isPropertyChange) {
    var self = this;
    var ann = self.annotation;
    var options = ann.options;

    for(var i = 0; i < options.labelDataItems.length; i++) {
        if(options.labelDataItems[i].id === labelItemId) {
            options.labelDataItems[i].enabled = value;
            break;
        }
    }

    self.scale.call(self);

    isPropertyChange && self.onPropertyChange();

    if (self.settingsPopup) {
        self.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.lineDrawing.prototype.bindSettingsEvents = function () {
    var self = this;

    var callBackFnLineSettingsEvents = {
        onLineColorChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineColor, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'line',
            otherLineElements: [
                self.additionalDrawings.lines["left"],
                self.additionalDrawings.lines["right"],
                self.additionalDrawings.lineArrow["startPointHead"],
                self.additionalDrawings.lineArrow["endPointHead"]
            ]
        }),
        onLineWidthChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineWidth, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'lineWidth',
            otherLineElements: [
                self.additionalDrawings.lines["left"],
                self.additionalDrawings.lines["right"],
                self.additionalDrawings.lineArrow["startPointHead"],
                self.additionalDrawings.lineArrow["endPointHead"]
            ],
            callBackFunction : function(settingsParams, isPropertyChange, strokeWidth){
                var dashArrayValues = infChart.drawingUtils.common.settings.getStrokeDashArray(self.annotation.options.shape.params.dashstyle, strokeWidth);
                if (settingsParams.otherLineElements) {
                    settingsParams.otherLineElements.forEach(function (element) {
                        if(element !== self.additionalDrawings.lineArrow["startPointHead"] && element !== self.additionalDrawings.lineArrow["endPointHead"]){
                        element.attr({
                            'stroke-dasharray': dashArrayValues
                        });
                    }
                    });
                }
            }
        }),
        onLineStyleChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.lineStyle, {
            isUpdateAnnotationStyles: true,
            settingsItem: 'lineStyle',
            otherLineElements: [
                self.additionalDrawings.lines["left"],
                self.additionalDrawings.lines["right"],
            ]
        }),
        onLineExtendToRight: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'isExtendRight',
            callBackFunction : function(settingsParams, isPropertyChange, value){
                self.onLineExtend.call(self, value, "right", isPropertyChange);
        },
            ctrlSelector: "[inf-ctrl=extendToRight]"
        }),

        onLineExtendToLeft: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'isExtendLeft',
            callBackFunction : function(settingsParams, isPropertyChange, value){
                self.onLineExtend.call(self, value, "left", isPropertyChange);
        },
            ctrlSelector: "[inf-ctrl=extendToLeft]"
        }),

        onStartArrowHeadTypeChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.value, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'isStartPoint',
            callBackFunction : function(settingsParams, isPropertyChange, value){
                self.onChangeArrowHead.call(self, value, "startPointHead", isPropertyChange);
            },
            ctrlSelector: "[inf-ctrl= startArrowHeadType]"
        }),

        onEndArrowHeadTypeChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.value, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'isEndPoint',
            callBackFunction : function(settingsParams, isPropertyChange, value){
                self.onChangeArrowHead.call(self, value, "endPointHead", isPropertyChange);
            },
            ctrlSelector: "[inf-ctrl= endArrowHeadType]"
        }),
        onTextColorChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontColor, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'text',
            otherTextElements: [
                self.additionalDrawings.labels["lineText"]
            ],
            ctrlSelector: "[inf-ctrl= textColorPicker]"
        }),

        onToggleLineText: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.checkBox, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'lineTextChecked',
            callBackFunction: function(settingsParams, isPropertyChange, value){
                self.onToggleLineText(value, isPropertyChange)
            },
            ctrlSelector: "[inf-ctrl=textToggle]"
        }),

        onLineTextChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.text, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'lineText',
            callBackFunction: function(){
                self.calculateAndUpdateTextLabel()
            },
            ctrlSelector: "[inf-ctrl=line-text]"
        }),
        onTextSizeChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontSize, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'textFontSize',
            otherTextElements: [
                self.additionalDrawings.labels["lineText"]
            ],
            callBackFunction: function(){
                self.calculateAndUpdateTextLabel()
            }
        }),
        onTextFontStyleChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'textFontStyle',
            otherTextElements: [
                self.additionalDrawings.labels["lineText"]
            ],
            callBackFunction: function(){
                self.calculateAndUpdateTextLabel()
            }
        }),

        onTextFontWeightChange: infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle,{
            isUpdateAnnotationStyles: false,
            otherTextElements: [
                self.additionalDrawings.labels["lineText"]
            ],
            settingsItem: 'textFontWeight',
            callBackFunction: function(){
                self.calculateAndUpdateTextLabel()
            }
        }),

        onTextFontDecorationChange :infChart.drawingSettings.getEventHandler(this, infChart.drawingSettings.eventTypes.fontStyle, {
            isUpdateAnnotationStyles: false,
            settingsItem: 'textDecoration',
            otherTextElements: [
                self.additionalDrawings.labels["lineText"]
            ],
            callBackFunction: function(){
                self.calculateAndUpdateTextLabel()
            }
        }),

        onLabelItemsChange : function(labelItemId, value){
            var isPropertyChange = true;
            if (self.settingsPopup) {
                isPropertyChange = self.isSettingsPropertyChange();
            }
            self.onLabelItemsChange(labelItemId, value, isPropertyChange);
        },

        onResetToDefault : function(){
            self.updateSavedDrawingProperties(true)
        }
    }

    return infChart.structureManager.drawingTools.bindLineSettings(self.settingsPopup, callBackFnLineSettingsEvents);
};

infChart.lineDrawing.prototype.updateSettings = function (properties) {
    var styles = [];
    if (properties.settings.textFontWeight !== 'normal') {
        styles.push(properties.settings.textFontWeight);
    }
    if (properties.settings.textFontStyle !== 'normal') {
        styles.push(properties.settings.textFontStyle);
    }
    if (properties.settings.textDecoration !== 'inherit') {
        styles.push(properties.settings.textDecoration);
    }
    infChart.structureManager.drawingTools.updateLineSettings(this.settingsPopup, properties.settings, properties.labelDataItems, styles, properties.lineText);
};

/**
 * Create a label and add to the group
 * @param {String} name label text
 * @param {number} x x position
 * @param {number} y y position
 * @returns {SVGElement} the generated label
 */
 infChart.lineDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["trendLine"];

    return chart.renderer.createElement('foreignObject').add(ann.group).attr({
        width: '150',
        height: '120'
    }).css(
            {
                color: shapeTheme && shapeTheme.label && shapeTheme.label.fontColor || "#ffffff !important",
                fontSize: '12px',
                cursor: 'move',
                fontWeight: '500',
                fontStyle: 'normal',
                textDecoration: 'inherit',
                backgroundColor: '#868688 !important',
                padding: '8px',
                borderRadius: '5px'
            });
};

infChart.lineDrawing.prototype.getTextLabel = function (lineText, x, y) {

    var self = this,
    ann = self.annotation,
    options = ann.options,
    chart = ann.chart,
    theme = infChart.drawingUtils.common.getTheme(),
    shapeTheme = theme["trendLine"];

    return chart.renderer.label(lineText, x, y,null, null, null, false).add(ann.group).attr({
        'zIndex': 20,
        'r': 3,
        'opacity': shapeTheme && shapeTheme.label && shapeTheme.label.opacity || 1,
        'stroke': shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
        'stroke-width': 0,
        'hAlign': 'center',
        'class': 'line-lbl',
        'padding': 5
    }).add(ann.group).css(
        {
            color: options.settings.textColor || shapeTheme && shapeTheme.label && shapeTheme.label.fontColor || '#fff',
            fontSize: options.settings.textFontSize || shapeTheme.fontSize || '12px',
            cursor: 'move',
            fontWeight: options.settings.textFontWeight ||'500',
            fontStyle: options.settings.textFontStyle ||'normal',
            textDecoration: options.settings.textDecoration || 'inherit'
        });
};

infChart.lineDrawing.prototype.beforeDestroy = function () {
    this.additionalDrawings.labels["lineData"].destroy();
    this.additionalDrawings.labels["lineText"].destroy();
};

infChart.lineDrawing.prototype.calculateAndUpdateLabel = function (newPositionData) {
    var ann = this.annotation,
        options = ann.options,
        line = ann.shape.d.split(' '),
        chart = ann.chart,
        additionalDrawingsArr = this.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    var angle = infChart.drawingUtils.common.getAngle(
        {
            x: parseInt(line[1], 10),
            y: yAxis.toPixels(options.yValue) + parseInt(line[2], 10)
        },
        {
            x: parseInt(line[4], 10),
            y: yAxis.toPixels(newPositionData.yValueEnd)
        });

    var duration = this.calculateDuration(newPositionData);

    var calculatedLabelData = {
        yValue: options.yValue,
        priceRange: newPositionData.yValueEnd - options.yValue,
        barsRange:  newPositionData.nearestXValueEndIndex - newPositionData.nearestXValueIndex,
        angle:angle * -1,
        duration: duration,
        formattedPriceRange: (newPositionData.yValueEnd - options.yValue).toFixed(2),
        formatedPercentage: (((newPositionData.yValueEnd - options.yValue) / options.yValue) * 100).toFixed(2)
    };

    var labelData = this.getLabelData(ann, calculatedLabelData);
    var label = additionalDrawingsArr.labels["lineData"];
    var yLabelPosition = parseInt(line[5], 10);

    if(labelData){
        var labelHtml = "<div>" + labelData + "</div>";
        label.element.innerHTML = labelHtml;

        if (newPositionData.nearestXValueEnd > newPositionData.nearestXValue && newPositionData.yValueEnd > options.yValue) {
            yLabelPosition = yLabelPosition + 10;
        } else if (newPositionData.nearestXValueEnd > newPositionData.nearestXValue && newPositionData.yValueEnd < options.yValue) {
            yLabelPosition  = yLabelPosition - this.getLabelHeight() - 10;
        } else if (newPositionData.nearestXValueEnd < newPositionData.nearestXValue && newPositionData.yValueEnd > options.yValue) {
            yLabelPosition = yLabelPosition - this.getLabelHeight() - 10;
        } else {
            yLabelPosition = yLabelPosition + 10;
        }
        var labeWidth = this.getLabelWidth(calculatedLabelData);
        var labelHeight = this.getLabelHeight();
        
        label.attr({
            x: parseInt(line[4],10) + 10,
            y: yLabelPosition,
            width: labeWidth,
            height: labelHeight
        }).show();
    } else {
        label.attr({}).hide();
    }

    options.calculatedLabelData = calculatedLabelData;
};

infChart.lineDrawing.prototype.calculateAndUpdateTextLabel = function () {
    var ann = this.annotation,
        options = ann.options,
        line = ann.shape.d.split(' '),
        additionalDrawingsArr = this.additionalDrawings;

        var textLabelData = options.lineText.replace(/\n/g, "<br>");;
        var textLabel = additionalDrawingsArr.labels["lineText"];

    if(textLabelData && options.settings.lineTextChecked) {
        
        textLabel.attr({
            text: textLabelData
        }).hide();

        var angle = -options.calculatedLabelData.angle,
        radians = -angle * Math.PI/ANGLE_180,
        xCenterCorrection = Math.cos(radians) * textLabel.width/2,
        yCenterCorrection  = Math.sin(radians) * textLabel.width/2;

        if(!(angle > (-1) * RIGHT_ANGLE && angle < RIGHT_ANGLE)) {
            xCenterCorrection = xCenterCorrection - textLabel.width * Math.cos(radians);
            yCenterCorrection = yCenterCorrection - textLabel.width * Math.sin(radians);
        }
        var yLineCenter = (parseInt(line[5],10) +  parseInt(line[2]))/2;
        var xLineCenter = (parseInt(line[4],10) + parseInt(line[1],10))/2;

        textLabel.attr({
            x: xLineCenter - xCenterCorrection,
            y: yLineCenter + yCenterCorrection,
            rotation: angle > (-1) * RIGHT_ANGLE && angle < RIGHT_ANGLE ? angle :angle - ANGLE_180
        }).show();
    } else {
        textLabel.attr({}).hide();
    }
};

infChart.lineDrawing.prototype.getLabelWidth =  function (calculatedLabelData) {
    
    var tempHtmlNode = document.createElement("span");
    document.body.appendChild(tempHtmlNode);
    
    tempHtmlNode.innerHTML = calculatedLabelData.formattedPriceRange + ' ' + calculatedLabelData.formatedPercentage  + '%';
    var priceRangeElementWidth = tempHtmlNode.offsetWidth;
    
    tempHtmlNode.innerHTML = calculatedLabelData.duration;
    var durationElementWidth = tempHtmlNode.offsetWidth;
    
    document.body.removeChild(tempHtmlNode);
    
    return Math.max(priceRangeElementWidth, durationElementWidth) + 51;
};

infChart.lineDrawing.prototype.getLabelHeight =  function  () {
    return this.additionalDrawings.labels.lineData.element.querySelectorAll('[rel=lineToolInfoBox]')[0].clientHeight + 20;
};
infChart.lineDrawing.prototype.isRequiredProperty = function (propertyId, reset) {
    var isPositionProperty = false;

    switch (propertyId) {
        case "yValue":
        case "yValueEnd":
        case "xValue":
        case "xValueEnd":
            isPositionProperty = true;
            break
        case "lineText":
        case "isLocked":
            isPositionProperty = !reset
            break;
        default :
            break;
    }

    return isPositionProperty;
};

infChart.lineDrawing.prototype.calculateDuration = function (newPositionData) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart;

    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);
    var timeDuration = newPositionData.nearestXValueEnd - newPositionData.nearestXValue;

    var timeInMilliseconds, timeUnit;
    switch (chartInstance.interval) {
        case 'I_1':
        case 'I_3':
        case 'I_5':
        case 'I_15':
        case 'I_30':
            timeInMilliseconds = 60000;
            timeUnit = " minute";
            break;
        case 'I_60':
        case 'I_120':
        case 'I_240':
        case 'I_360':
        case 'I_480': 
        case 'I_720':
            timeInMilliseconds = 3600000;
            timeUnit = " hour";
            break;
        case 'W':
        case 'M':
        case 'Y':
            timeInMilliseconds = 604800000;
            timeUnit = " week";
            break;
        default: //default represents time intervals in days
            timeInMilliseconds = 86400000;
            timeUnit = " day";
            break;
    }

    timeDuration = Math.round(timeDuration / timeInMilliseconds);
    timeDuration = (timeDuration == 1 || timeDuration == -1) ? timeDuration + timeUnit : timeDuration + timeUnit + "s";

    return timeDuration;
};

infChart.lineDrawing.prototype.getLabelData = function (annotation, calculatedLabelData) {
    self = this;
    var labelHtml = '<div rel = "lineToolInfoBox" style = "display: grid; grid-row-gap: 10px; padding: 5px; background: #868688 !important; border-radius: 5px;">';
    var options = annotation.options;
    var islabelItemAvailable = false;
    
    $.each(options.labelDataItems, function (index, labelDataItem) {
        if (labelDataItem.enabled) {
            switch (labelDataItem.id) {
                case 'priceRange': {
                    labelHtml = labelHtml + '<span style = "display: grid; grid-column-gap: 10px; grid-template-columns: 15px 1fr;">' + self.showPriceDifferentIcon +
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.formattedPriceRange + ' ' + calculatedLabelData.formatedPercentage  + '%' + '</span></span>';
                    islabelItemAvailable = true;
                }
                    break;
                case 'barsRange':{
                       labelHtml = labelHtml + '<span style = "display: grid; grid-column-gap: 10px; grid-template-columns: 15px 1fr;">' + self.showTimeDifferenceIcon +
                            '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.barsRange + ' bars' + '</span></span>';
                        islabelItemAvailable = true;
                    }
                    break;
                case 'angle': {
                    labelHtml = labelHtml + '<span style = "display: grid; grid-column-gap: 10px; grid-template-columns: 15px 1fr;">' + self.showDegreesIcon + 
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.angle.toFixed(0) + '\u00B0' + '</span></span>';
                    islabelItemAvailable = true;
                }
                    break;
                case 'duration': {
                    labelHtml = labelHtml + '<span style = "display: grid; grid-column-gap: 10px; grid-template-columns: 15px 1fr;">' + self.showDurationIcon + 
                        '<span class="drawing-lbl-box__label" style="color: #ffffff !important; font-weight: 500 !important">' + calculatedLabelData.duration + '</span></span>';
                    islabelItemAvailable = true;
                }
                    break;
            }
        }
    });

    labelHtml = labelHtml + "</div>";

    if (!islabelItemAvailable) {
        labelHtml = null;
    }

    return labelHtml;
}

infChart.lineDrawing.prototype.onLineExtend = function (extended, direction, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawingsArr = this.additionalDrawings;

    if (additionalDrawingsArr) {
        if (extended) {
            additionalDrawingsArr.lines[direction].show();
        } else {
            additionalDrawingsArr.lines[direction].hide();
        }
    }

    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.lineDrawing.prototype.onChangeArrowHead = function (extended, position, isPropertyChange) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        additionalDrawingsArr = this.additionalDrawings


    if (additionalDrawingsArr) {
        if (extended) {
            additionalDrawingsArr.lineArrow[position].show();
        } else {
            additionalDrawingsArr.lineArrow[position].hide();
        }
    }
    isPropertyChange && self.onPropertyChange();
    if (this.settingsPopup) {
        this.settingsPopup.data("infUndoRedo", false);
    }
    infChart.drawingUtils.common.saveDrawingProperties.call(self);
};

infChart.lineDrawing.prototype.onToggleLineText = function (checked, isPropertyChange) {
    var self = this;
    if (self.settingsPopup) {
        if (checked) {
            self.settingsPopup.find("input[inf-ctrl=line-text]").removeAttr("disabled");
            self.settingsPopup.find("input[inf-ctrl=textColorPicker]").removeAttr("disabled");
            $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().removeAttr("disabled");
            self.calculateAndUpdateTextLabel.call(self);
        } else {
            self.settingsPopup.find("input[inf-ctrl=line-text]").attr("disabled", "disabled");
            self.settingsPopup.find("input[inf-ctrl=textColorPicker]").attr("disabled", "disabled");
            $(self.settingsPopup.find("span[inf-ctrl=singleSelectedFontSize]")[0]).parent().attr("disabled", "disabled");
            self.additionalDrawings.labels.lineText.hide();
        }
    }
};

infChart.lineDrawing.prototype.updateLineWithArrowHeadsAndPoints = function () {
    var self = this,
        ann = self.annotation,
        line = ann.shape.d.split(' '),
        additionalDrawingsArr = self.additionalDrawings;

    var ArrowHeadValues = infChart.drawingUtils.common.drawArrowHead.call(this, ann.shape.d, true, true);
    additionalDrawingsArr.lineArrow["endPointHead"].attr({ d: ArrowHeadValues.endArrowHead });
    additionalDrawingsArr.lineArrow["startPointHead"].attr({ d: ArrowHeadValues.startArrowHead });

    var pointsValues = infChart.drawingUtils.common.getExtendedLineCordinates.call(this, line, true, true);
    additionalDrawingsArr.lines["left"].attr({ d: ["M", line[1], line[2], "L", pointsValues.lineLeftX, pointsValues.lineLeftY] });
    additionalDrawingsArr.lines["right"].attr({ d: ["M", line[4], line[5], "L", pointsValues.lineRightX, pointsValues.lineRightY] });
};

infChart.lineDrawing.prototype.resetDragSUpporters = function (){
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        additionalDrawingsArr = self.additionalDrawings,
        line = ann.shape.d.split(' ');
    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
    if(additionalDrawingsArr.lines["left"]){
        infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, additionalDrawingsArr.lines["left"].d.split(' '), this.dragSupporters);
    }
    if(additionalDrawingsArr.lines["right"]){
        infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, additionalDrawingsArr.lines["right"].d.split(' '), this.dragSupporters);
    }
};