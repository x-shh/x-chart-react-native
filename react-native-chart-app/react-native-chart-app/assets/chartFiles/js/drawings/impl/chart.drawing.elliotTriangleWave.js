window.infChart = window.infChart || {};

infChart.elliotTriangleWaveDrawing = function () {
    this.labelDataItems = [
        {id: "price", displayName: "Price", enabled: true},
        {id: "type", displayName: "Type", enabled: true},
        {id: "priceDifference", displayName: "Price Difference", enabled: true},
        {id: "waveDegree", displayName: "Wave Degree", enabled: true}
    ];
    this.waveDegrees = [
        {
            id: "Super Millennium",
            name: "superMillennium",
            label: "label.superMillennium", 
            color: "#78BC61",
            enable: false,
            options:["O", "(((A)))", "(((B)))", "(((C)))", "(((D)))", "(((E)))" ]
        },
        {
            id: "Millennium", 
            name: "millennium",
            label: "label.millennium",
            color: "#EF6351",
            enable: false,
            options:["O", "((A))", "((B))", "((C))", "((D))", "((E))" ]
        },
        {
            id: "Sub Millennium", 
            name: "subMillennium",
            label: "label.subMillennium",
            color: "#3066BE",
            enable: false,
            options:["O", "(A)", "(B)", "(C)", "(D)", "(E)" ]
        },
        {
            id: "Grand Super Cycle", 
            name: "grandSuperCycle",
            label: "label.grandSuperCycle",
            color: "#F93943", 
            enable: false,
            options:["O", "(((a)))", "(((b)))", "(((c)))", "(((d)))", "(((e)))" ]
        },
        {
            id: "Super Cycle", 
            name: "superCycle",
            label: "label.superCycle",
            color: "#7E78D2", 
            enable: false,
            options:["O", "((a))", "((b))", "((c))", "((d))", "((e))" ]
        },
        {
            id: "Cycle", 
            name: "cycle",
            label: "label.cycle",
            color: "#D65780", 
            enable: false,
            options:["O", "(a)", "(b)", "(c)", "(d)", "(e)" ]
        },
        {
            id: "Primary",
            name: "primary",
            label: "label.primary",
            color: "#6C809A", 
            enable: false,
            options:["O", "{{{A}}}", "{{{B}}}", "{{{C}}}", "{{{D}}}", "{{{E}}}" ]
        },
        {
            id: "Intermediate", 
            name: "intermediate",
            label: "label.intermediate",
            color: "#58A4B0", 
            enable: false,
            options:["O", "{{A}}", "{{B}}", "{{C}}", "{{D}}", "{{E}}" ]
        },
        {
            id: "Minor", 
            name: "minor",
            label: "label.minor",
            color: "#5E8C61",
            enable: false, 
            options:["O", "{A}", "{B}", "{C}", "{D}", "{E}" ]
        },
        {
            id: "Minute", 
            name: "minute",
            label: "label.minute",
            color: "#C89933", 
            enable: false,
            options:["O", "{{{a}}}", "{{{b}}}", "{{{c}}}", "{{{d}}}", "{{{e}}}" ]
        },
        {
            id: "Minuette", 
            name: "minuette",
            label: "label.minuette",
            color: "#00A7E1", 
            enable: false,
            options:["O", "{{a}}", "{{b}}", "{{c}}", "{{d}}", "{{e}}" ]
        },
        {
            id: "Sub Minuette", 
            name: "subMinuette",
            label: "label.subMinuette",
            color: "#912F56", 
            enable: false,
            options:["O", "{a}", "{b}", "{c}", "{d}", "{e}" ]
        },
        {
            id: "Micro", 
            name: "micro",
            label: "label.micro",
            color: "#9D75CB", 
            enable: true,
            options:["O", "[[[A]]]", "[[[B]]]", "[[[C]]]", "[[[D]]]", "[[[E]]]" ]
        },
        {
            id: "Sub Micro", 
            name: "subMicro",
            label: "label.subMicro",
            color: "#FE7B72",
            enable: false, 
            options:["O", "[[A]]", "[[B]]", "[[C]]", "[[D]]", "[[E]]" ]
        },
        {
            id: "Nano", 
            name: "nano",
            label: "label.nano",
            color: "#8D818C", 
            enable: false,
            options:["O", "[A]", "[B]", "[C]", "[D]", "[E]" ]
        },
        {
            id: "Sub Nano",
            name: "subNano",
            label: "label.subNano", 
            color: "#387D7A", 
            enable: false,
            options:["O", "A", "B", "C", "D", "E" ]
        }
    ]
    this.labelValueNames = ["oLabel", "aLabel", "bLabel", "cLabel", "dLabel", "eLabel"];
    this.type = "Triangle";
    this.currentWaveDegree = "micro";
    infChart.elliotWaveDrawing.apply(this, arguments);
};

infChart.elliotTriangleWaveDrawing.prototype = Object.create(infChart.elliotWaveDrawing.prototype);

/**
* set additional drawings of the tool
*/
infChart.elliotTriangleWaveDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        lineShapes = self.getPatternShapes(true),
        additionalDrawingsArr = self.additionalDrawings,
        theme = infChart.drawingUtils.common.getTheme(),
        pointNamesArr = ["o", "a", "b", "c", "d", "e"];

    additionalDrawingsArr.lines = {};
    additionalDrawingsArr.labels = {};
    additionalDrawingsArr.circles = {};
    additionalDrawingsArr.axisLabels = {};
    additionalDrawingsArr.rect = {};
    additionalDrawingsArr.infoLabels = {};

    ann.selectionMarker = [];
    self.setSelectionMarkers();

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        labelPosition && (additionalDrawingsArr.infoLabels[value + "Label"] = self.getInfoLabel(labelPosition.label, labelPosition.x, labelPosition.y));
    });

    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        labelPosition && (additionalDrawingsArr.labels[value + "Label"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
        label = additionalDrawingsArr.labels[value + "Label"];
        if(label){
            label.attr({x: labelPosition.x - label.width/2});
        }
    });
};

infChart.elliotTriangleWaveDrawing.prototype.getClickValues = function (clickX, clickY) {
    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];
    var completedSteps = this.annotation.options.completedSteps;
    var coordinates = {
        xValue: options.xValue,
        yValue: options.yValue,
        intermediatePoints: options.intermediatePoints
    };
    switch (completedSteps) {
        case 1:
            coordinates.intermediatePoints[0].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[0].yValue = yAxis.toValue(clickY);
            break;
        case 2:
            coordinates.intermediatePoints[1].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[1].yValue = yAxis.toValue(clickY);
            break;
        case 3:
            coordinates.intermediatePoints[2].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[2].yValue = yAxis.toValue(clickY);
            break;
        case 4:
            coordinates.intermediatePoints[3].xValue = xAxis.toValue(clickX);
            coordinates.intermediatePoints[3].yValue = yAxis.toValue(clickY);
            break;
        case 5:
            coordinates.xValueEnd = xAxis.toValue(clickX);
            coordinates.yValueEnd = yAxis.toValue(clickY);
            break;
    }
    return coordinates;
};

/**
* Returns the config to save
* @returns {{shape: string, borderColor: *, strokeWidth: *, xValue: *, yValue: *, xValueEnd: *, yValueEnd: *, intermediatePoints: Array}} config object
*/
infChart.elliotTriangleWaveDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    var intermediatePoints = [];

    infChart.util.forEach(annotation.options.intermediatePoints, function(index , value){
        intermediatePoints.push({
            xValue: value.xValue,
            yValue: value.yValue
        });
    });

    return {
        shape: 'elliotTriangleWave',
        borderColor: annotation.options.shape.params.stroke,
        strokeWidth: annotation.options.shape.params['stroke-width'],
        xValue: annotation.options.xValue,
        yValue: annotation.options.yValue,
        xValueEnd: annotation.options.xValueEnd,
        yValueEnd: annotation.options.yValueEnd,
        intermediatePoints: intermediatePoints,
        fillColor: 'none',
        currentWaveDegree: annotation.options.currentWaveDegree,
        nearestXValue: annotation.options.nearestXValue,
        nearestXValueEnd: annotation.options.nearestXValueEnd,
        nearestYValue: annotation.options.nearestYValue,
        nearestYValueEnd: annotation.options.nearestYValueEnd,
        startTopOfthePoint: annotation.options.startTopOfthePoint,
        endTopOfthePoint: annotation.options.endTopOfthePoint,
        nearestIntermediatePoints: annotation.options.nearestIntermediatePoints,
        isSnapTopHighLow: annotation.options.isSnapTopHighLow,
        textFontSize: annotation.options.textFontSize,
    };
};

/**
 * Create a label and add to the group
 * @param {String} name label text
 * @param {number} x x position
 * @param {number} y y position
 * @returns {SVGElement} the generated label
 */
infChart.elliotTriangleWaveDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["elliotTriangleWave"];
        var currentColor;

        infChart.util.forEach(self.waveDegrees, function(index , value){
            if(self.waveDegrees[index].name === self.currentWaveDegree){
                currentColor = self.waveDegrees[index].color;
            }
        });

    var labelData = chart.renderer.label(name, x, y).attr({
        'zIndex': 20,
        'r': 3,
        'opacity': shapeTheme && shapeTheme.label && shapeTheme.label.opacity || 1,
        'stroke': options.shape.params.stroke ? options.shape.params.stroke : currentColor,//shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
        'stroke-width': 0,
        'hAlign': 'center',
        'class': 'harmonic-lbl',
        'rel': name,
    }).add(ann.group).css(
        {
            color: options.shape.params.stroke ? options.shape.params.stroke : currentColor,//shapeTheme && shapeTheme.label && shapeTheme.label.stroke || "#858587",
            fontSize: options.textFontSize || '16px',
            cursor: 'pointer',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'inherit'
        });

    $(labelData.element).mouseover(function (event) {
        event.stopPropagation();
        if(!infChart.drawingsManager.getIsActiveDrawingInprogress()){
            var rel = event.currentTarget.getAttribute('rel');
            if(rel === "O"){
                self.additionalDrawings.infoLabels.oLabel.show();
            }
            if(rel === "A"|| rel === "(A)"|| rel === "((A))"|| rel === "(((A)))"|| rel === "(a)"|| rel === "((a))"|| rel === "(((a)))" || rel === "[A]"|| rel === "[[A]]"|| rel === "[[[A]]]"|| rel === "{{{A}}}"|| rel === "{{A}}"|| rel === "{A}"|| rel === "{{{a}}}"|| rel === "{{a}}"|| rel === "{a}"){
                self.additionalDrawings.infoLabels.aLabel.show();
            }
            if(rel === "B"|| rel === "(B)"|| rel === "((B))"|| rel === "(((B)))"|| rel === "(b)"|| rel === "((b))"|| rel === "(((b)))" || rel === "[B]"|| rel === "[[B]]"|| rel === "[[[B]]]"|| rel === "{{{B}}}"|| rel === "{{B}}"|| rel === "{B}"|| rel === "{{{b}}}"|| rel === "{{b}}"|| rel === "{b}"){
                self.additionalDrawings.infoLabels.bLabel.show();
            }
            if(rel === "C"|| rel === "(C)"|| rel === "((C))"|| rel === "(((C)))"|| rel === "(c)"|| rel === "((c))"|| rel === "(((c)))" || rel === "[C]"|| rel === "[[C]]"|| rel === "[[[C]]]"|| rel === "{{{C}}}"|| rel === "{{C}}"|| rel === "{C}"|| rel === "{{{c}}}"|| rel === "{{c}}"|| rel === "{c}"){
                self.additionalDrawings.infoLabels.cLabel.show();
            }
            if(rel === "D"|| rel === "(D)"|| rel === "((D))"|| rel === "(((D)))"|| rel === "(d)"|| rel === "((d))"|| rel === "(((d)))" || rel === "[D]"|| rel === "[[D]]"|| rel === "[[[D]]]"|| rel === "{{{D}}}"|| rel === "{{D}}"|| rel === "{D}"|| rel === "{{{d}}}"|| rel === "{{d}}"|| rel === "{d}"){
                self.additionalDrawings.infoLabels.dLabel.show();
            }        
            if(rel === "E"|| rel === "(E)"|| rel === "((E))"|| rel === "(((E)))"|| rel === "(e)"|| rel === "((e))"|| rel === "(((e)))" || rel === "[E]"|| rel === "[[E]]"|| rel === "[[[E]]]"|| rel === "{{{E}}}"|| rel === "{{E}}"|| rel === "{E}"|| rel === "{{{e}}}"|| rel === "{{e}}"|| rel === "{e}"){
                self.additionalDrawings.infoLabels.eLabel.show();
            }
        }
    });

    $(labelData.element).mouseleave(function (event) {
        event.stopPropagation();
        if(!infChart.drawingsManager.getIsActiveDrawingInprogress()){
            var rel = event.currentTarget.getAttribute('rel');
            if(rel === "O"){
                self.additionalDrawings.infoLabels.oLabel.hide();
            }
            if(rel === "A"|| rel === "(A)"|| rel === "((A))"|| rel === "(((A)))"|| rel === "(a)"|| rel === "((a))"|| rel === "(((a)))" || rel === "[A]"|| rel === "[[A]]"|| rel === "[[[A]]]"|| rel === "{{{A}}}"|| rel === "{{A}}"|| rel === "{A}"|| rel === "{{{a}}}"|| rel === "{{a}}"|| rel === "{a}"){
                self.additionalDrawings.infoLabels.aLabel.hide();
            }
            if(rel === "B"|| rel === "(B)"|| rel === "((B))"|| rel === "(((B)))"|| rel === "(b)"|| rel === "((b))"|| rel === "(((b)))" || rel === "[B]"|| rel === "[[B]]"|| rel === "[[[B]]]"|| rel === "{{{B}}}"|| rel === "{{B}}"|| rel === "{B}"|| rel === "{{{b}}}"|| rel === "{{b}}"|| rel === "{b}"){
                self.additionalDrawings.infoLabels.bLabel.hide();
            }
            if(rel === "C"|| rel === "(C)"|| rel === "((C))"|| rel === "(((C)))"|| rel === "(c)"|| rel === "((c))"|| rel === "(((c)))" || rel === "[C]"|| rel === "[[C]]"|| rel === "[[[C]]]"|| rel === "{{{C}}}"|| rel === "{{C}}"|| rel === "{C}"|| rel === "{{{c}}}"|| rel === "{{c}}"|| rel === "{c}"){
                self.additionalDrawings.infoLabels.cLabel.hide();
            }
            if(rel === "D"|| rel === "(D)"|| rel === "((D))"|| rel === "(((D)))"|| rel === "(d)"|| rel === "((d))"|| rel === "(((d)))" || rel === "[D]"|| rel === "[[D]]"|| rel === "[[[D]]]"|| rel === "{{{D}}}"|| rel === "{{D}}"|| rel === "{D}"|| rel === "{{{d}}}"|| rel === "{{d}}"|| rel === "{d}"){
                self.additionalDrawings.infoLabels.dLabel.hide();
            }        
            if(rel === "E"|| rel === "(E)"|| rel === "((E))"|| rel === "(((E)))"|| rel === "(e)"|| rel === "((e))"|| rel === "(((e)))" || rel === "[E]"|| rel === "[[E]]"|| rel === "[[[E]]]"|| rel === "{{{E}}}"|| rel === "{{E}}"|| rel === "{E}"|| rel === "{{{e}}}"|| rel === "{{e}}"|| rel === "{e}"){
                self.additionalDrawings.infoLabels.eLabel.hide();
            }
        }
    });
    return labelData;
};

infChart.elliotTriangleWaveDrawing.prototype.getNextPointOptions = function () {
    var ann = this.annotation;
    var completedSteps = ann.options.completedSteps;
    var pointOptions = { name: "o" };
    switch (completedSteps) {
        case 1:
            pointOptions.name = "a";
            break;
        case 2:
            pointOptions.name = "b";
            break;
        case 3:
            pointOptions.name = "c";
            break;
        case 4:
            pointOptions.name = "d";
            break;
        case 5:
            pointOptions.name = "e";
            break;

    }
    return pointOptions;
};

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.elliotTriangleWaveDrawing.prototype.getPatternShapes = function (updateNearestValues) {
    var nameAdditionalY = 25;
    var patternPaths = {};

    var ann = this.annotation;
    var chart = ann.chart;
    var options = ann.options;
    var intermediatePoints = options.intermediatePoints;
    var intermediatePointsRaw = this.intermediatePoints;
    var xAxis = chart.xAxis[options.xAxis];
    var yAxis = chart.yAxis[options.yAxis];

    var waveDegreeSelected;
    this.waveDegrees.forEach(function(value, index){
        if(value.name === options.currentWaveDegree){
            waveDegreeSelected = value;
        }
    });

    var x = xAxis.toPixels(options.xValue);
    var y = yAxis.toPixels(options.yValue);
    var intermediate = this.getIntermediatePointsSnappedValues(updateNearestValues);
    var ax = intermediate && intermediate[0] && intermediate[0].x;
    var ay = intermediate && intermediate[0] && intermediate[0].y;
    var bx = intermediate && intermediate[1] && intermediate[1].x;
    var by = intermediate && intermediate[1] && intermediate[1].y;
    var cx = intermediate && intermediate[2] && intermediate[2].x;
    var cy = intermediate && intermediate[2] && intermediate[2].y;
    var dx = intermediate && intermediate[3] && intermediate[3].x;
    var dy = intermediate && intermediate[3] && intermediate[3].y;

    var futureValue = chart.series[0].xData[chart.series[0].xData.length-1];
    if(updateNearestValues){
        var nearestDataForXValueEnd = infChart.math.findNearestDataPoint(chart, options.xValueEnd, undefined, true, true);
        if(futureValue >=  nearestDataForXValueEnd.xData){
            options.nearestXValueEnd = nearestDataForXValueEnd.xData;
            var nearestEndValue = this.getNearestYValue(options.yValueEnd, nearestDataForXValueEnd, undefined, options.isSnapTopHighLow);
            options.nearestYValueEnd = nearestEndValue.nearestYValue;
            options.endTopOfthePoint = nearestEndValue.topOfThePoint;
        } else {
            options.nearestXValueEnd = nearestDataForXValueEnd.xData;
            options.nearestYValueEnd = options.yValueEnd;
            options.endTopOfthePoint = true;
        }
    }
    var newXEnd = xAxis.toPixels(options.nearestXValueEnd) - x;
    var newYEnd = yAxis.toPixels(options.nearestYValueEnd) - y;
    var ex = options.xValueEnd && newXEnd;
    var ey = options.yValueEnd && newYEnd;

    if (ex !== undefined) {
        if (y < 0) {
            patternPaths.namePosition = { x: (ex) / 2, y: (ey) / 2 + nameAdditionalY };
        } else {
            patternPaths.namePosition = { x: (x + dx) / 2, y: (y + dy) / 2 + nameAdditionalY };
        }
    }

    if(updateNearestValues){
        var nearestDataForXValue = infChart.math.findNearestDataPoint(chart, options.xValue, undefined, true, true);
        if(futureValue >=  nearestDataForXValue.xData){
            options.nearestXValue = nearestDataForXValue.xData;
            var nearestStartValue = this.getNearestYValue(options.yValue, nearestDataForXValue, undefined, options.isSnapTopHighLow);
            options.nearestYValue = nearestStartValue.nearestYValue;
            options.startTopOfthePoint = nearestStartValue.topOfThePoint;
        } else {
            options.nearestXValue = nearestDataForXValue.xData;
            options.nearestYValue = options.yValue;
            options.startTopOfthePoint = true;
        }
    }
    var newX = xAxis.toPixels(options.nearestXValue) - x;
    var newY = yAxis.toPixels(options.nearestYValue) - y;
    patternPaths.oCirclePosition = { x: newX, y: newY };

    patternPaths.positions = {
        pointLabels: {
            o: { x: newX, y: options.startTopOfthePoint ? -25 + newY : 5 + newY, label: waveDegreeSelected.options[0],  xValue: options.nearestXValue, yValue: options.nearestYValue, topOfThePoint: options.startTopOfthePoint}
        },
        circles: {
            o: { x: newX, y: newY },
            a: { x: ax, y: ay },
            b: { x: bx, y: by },
            c: { x: cx, y: cy },
            d: { x: dx, y: dy },
            e: { x: ex, y: ey }
        }
    };

    patternPaths.positions.axisClips = {};

    patternPaths.values = {
        o: {
            xValue: options.xValue,
            yValue: this.yValue,
            optionXValue: options.xValue,
            optionYValue: options.yValue
        }
    };

    if (ax !== undefined) {
        patternPaths.aCirclePosition = { x: ax, y: ay };
        patternPaths.positions.pointLabels.a = { x: ax, y: intermediate[0].topOfThePoint ? ay - 25 : ay + 5, label: waveDegreeSelected.options[1], xValue: intermediate[0].xValue, yValue: intermediate[0].yValue, topOfThePoint: intermediate[0].topOfThePoint};
        patternPaths.values.a = {
            xValue: intermediatePoints[0].xValue,
            yValue: intermediatePointsRaw[0] ? intermediatePointsRaw[0].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[0].yValue),
            optionXValue: intermediatePoints[0].xValue,
            optionYValue: intermediatePoints[0].yValue
        };

    }

    if (bx !== undefined) {
        patternPaths.bCirclePosition = { x: bx, y: by };
        patternPaths.positions.pointLabels.b = { x: bx, y: intermediate[1].topOfThePoint ? by - 25 : by + 5, label: waveDegreeSelected.options[2], xValue: intermediate[1].xValue, yValue: intermediate[1].yValue, topOfThePoint: intermediate[1].topOfThePoint };
        patternPaths.values.b = {
            xValue: intermediatePoints[1].xValue,
            yValue: intermediatePointsRaw[1] ? intermediatePointsRaw[1].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[1].yValue),
            optionXValue: intermediatePoints[1].xValue,
            optionYValue: intermediatePoints[1].yValue
        };

    }
    if (cx !== undefined) {
        patternPaths.cCirclePosition = { x: cx, y: cy };
        patternPaths.positions.pointLabels.c = { x: cx, y: intermediate[2].topOfThePoint ? cy - 25 : cy + 5, label: waveDegreeSelected.options[3], xValue: intermediate[2].xValue, yValue: intermediate[2].yValue, topOfThePoint: intermediate[2].topOfThePoint };
        patternPaths.values.c = {
            xValue: intermediatePoints[2].xValue,
            yValue: intermediatePointsRaw[2] ? intermediatePointsRaw[2].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[2].yValue),
            optionXValue: intermediatePoints[2].xValue,
            optionYValue: intermediatePoints[2].yValue
        };
    }
    if (dx !== undefined) {
        patternPaths.dCirclePosition = { x: dx, y: dy };
        patternPaths.positions.pointLabels.d = { x: dx, y: intermediate[3].topOfThePoint ? dy - 25 : dy + 5, label: waveDegreeSelected.options[4], xValue: intermediate[3].xValue, yValue: intermediate[3].yValue, topOfThePoint: intermediate[3].topOfThePoint };
        patternPaths.values.d = {
            xValue: intermediatePoints[3].xValue,
            yValue: intermediatePointsRaw[3] ? intermediatePointsRaw[3].yValue : infChart.drawingUtils.common.getBaseYValue.call(this, intermediatePoints[3].yValue),
            optionXValue: intermediatePoints[3].xValue,
            optionYValue: intermediatePoints[3].yValue
        };

    }
    if (ex !== undefined) {
        patternPaths.eCirclePosition = { x: ex, y: ey };
        patternPaths.positions.pointLabels.e = { x: ex, y: options.endTopOfthePoint ? ey - 25 : ey + 5, label: waveDegreeSelected.options[5], xValue: options.nearestXValueEnd, yValue: options.nearestYValueEnd, topOfThePoint: options.endTopOfthePoint };
        patternPaths.values.e = {
            xValue: options.xValueEnd,
            yValue: this.yValueEnd !== undefined ? this.yValueEnd : infChart.drawingUtils.common.getBaseYValue.call(this, options.yValueEnd),
            optionXValue: options.xValueEnd,
            optionYValue: options.yValueEnd
        };

    }
    return patternPaths;
};

infChart.elliotTriangleWaveDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getElliotWaveSettings(infChart.manager.getLabel('label.elliotTriangleWave'), common.baseBorderColor, this.annotation.options.currentWaveDegree, this.waveDegrees, this.fontSize);
};

infChart.elliotTriangleWaveDrawing.prototype.finalizeEachPoint = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointNamesArr = ["o", "a", "b", "c", "d", "e"];
        var currentColor;

    line = self.getBasePatternLine(true);
    infChart.util.forEach(self.waveDegrees, function(index , value){
        if(self.waveDegrees[index].id === options.currentWaveDegree){
            currentColor = self.waveDegrees[index].color;
        }
    });

    ann.update({
        shape: {
            params: {
                d: line,
                'stroke': options.shape.params.stroke ? options.shape.params.stroke : currentColor,
            }
        }
    });

    var lineShapes = self.getPatternShapes(true);

    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });
    
    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        var label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x - label.width/2, y: labelPosition.y });

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId, true);
    if(!infChart.drawingsManager.getIsActiveDrawingInprogress()){
        self.getSnappedValues();
        self.calculateAndUpdateInfoLabel(true);
    }
    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
    infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, ann.options.nearestTrendYValue, ann.options.nearestIntermediatePoints);
};

/**
* Scale function of the tool
*/
infChart.elliotTriangleWaveDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["o", "a", "b", "c", "d", "e"];
        var currentColor;

    line = self.getBasePatternLine(isCalculateNewValueForScale);
    infChart.util.forEach(self.waveDegrees, function(index , value){
        if(self.waveDegrees[index].id === options.currentWaveDegree){
            currentColor = self.waveDegrees[index].color;
        }
    });

    ann.update({
        shape: {
            params: {
                d: line,
                'stroke': options.shape.params.stroke ? options.shape.params.stroke : currentColor,
            }
        }
    });

    var lineShapes = self.getPatternShapes(isCalculateNewValueForScale);

    lineShapes.namePosition && additionalDrawingsArr.labels["nameLabel"] && additionalDrawingsArr.labels["nameLabel"].attr({
        x: lineShapes.namePosition.x,
        y: lineShapes.namePosition.y
    });
    
    infChart.util.forEach(pointNamesArr, function (index, value) {
        var labelPosition = lineShapes.positions["pointLabels"][value];
        var label = additionalDrawingsArr.labels[value + "Label"];
        label && label.attr({ x: labelPosition.x - label.width/2, y: labelPosition.y });

        // circles
        if (additionalDrawingsArr.circles[value]) {
            var circlePositions = lineShapes.positions["circles"][value];
            additionalDrawingsArr.circles[value].attr({ x: circlePositions.x, y: circlePositions.y });
        }
    });
    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId, isCalculateNewValueForScale);
    if(!infChart.drawingsManager.getIsActiveDrawingInprogress()){
        self.calculateAndUpdateInfoLabel(isCalculateNewValueForScale);
    }
};

infChart.elliotTriangleWaveDrawing.prototype.setSelectionMarkers = function () {
    var self = this;
    var ann = self.annotation;
    var lineShapes = self.getPatternShapes();
    var additionalDrawingsArr = self.additionalDrawings;

    if (!ann.selectionMarker.length) {
        infChart.util.forEach(["o", "a", "b", "c", "d", "e"], function (index, value) {
            var circlePosition = lineShapes.positions["circles"][value];
            if (circlePosition && circlePosition.x != undefined && circlePosition.y != undefined) {
                additionalDrawingsArr.circles[value] = infChart.drawingUtils.common.addAndBindSelectionMarker.call(self, ann, circlePosition.x, circlePosition.y, self.stepFunction, self.stop, true, undefined, { name: value });
            }
         });

        var clipPosX = lineShapes.positions.axisClips.x;
        var clipPosY = lineShapes.positions.axisClips.y;
        if (clipPosY && !additionalDrawingsArr.rect.y && clipPosX && !additionalDrawingsArr.rect.x) {
            ann.selectionMarker.push(additionalDrawingsArr.rect.x);
            ann.selectionMarker.push(additionalDrawingsArr.rect.y);
        }

    }
};

/**
* Step function
* @param {Event} e event
* @param {boolean} isStartPoint indicate whether the start or not
*/
infChart.elliotTriangleWaveDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
    var ann = this.annotation,
        options = ann.options,
        chart = ann.chart,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[options.yAxis],
        pointx = xAxis.toValue(e.chartX),
        pointy = yAxis.toValue(e.chartY),
        intermediatePoints = options.intermediatePoints,
        newOtions = {};
    switch (itemProperties.name) {
        case 'a':
            if (!intermediatePoints[0]) {
                intermediatePoints[0] = {};
            }
            intermediatePoints[0].xValue = pointx;
            intermediatePoints[0].yValue = pointy;
            break;
        case 'b':
            if (!intermediatePoints[1]) {
                intermediatePoints[1] = {};
            }
            intermediatePoints[1].xValue = pointx;
            intermediatePoints[1].yValue = pointy;
            break;
        case 'c':
            if (!intermediatePoints[2]) {
                intermediatePoints[2] = {};
            }
            intermediatePoints[2].xValue = pointx;
            intermediatePoints[2].yValue = pointy;
            break;
        case 'd':
            if (!intermediatePoints[3]) {
                intermediatePoints[3] = {};
            }
            intermediatePoints[3].xValue = pointx;
            intermediatePoints[3].yValue = pointy;
            break;
        case 'e':
            newOtions.xValueEnd = pointx;
            newOtions.yValueEnd = pointy;
            break;
        case 'o':
            newOtions.xValue = pointx;
            newOtions.yValue = pointy;
            break;
        default:
            break;
    }
    newOtions.intermediatePoints = intermediatePoints;
    ann.update(newOtions);
    this.finalizeEachPoint();
};

/**
 * Stop function
 * @param {Event} e event
 * @param {boolean} isStartPoint indicate whether the start or not
 */
infChart.elliotTriangleWaveDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        lineShapes = self.getPatternShapes(true),
        additionalDrawingsArr = self.additionalDrawings;

    // point Labels
    if (!additionalDrawingsArr.labels["eLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["e"];
        labelPosition && (additionalDrawingsArr.labels["eLabel"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
        label = additionalDrawingsArr.labels["eLabel"];
        if(label){
            label.attr({x: labelPosition.x - label.width/2});
        }
    }

    if (!additionalDrawingsArr.infoLabels["eLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["e"];
        labelPosition && (additionalDrawingsArr.infoLabels["eLabel"] = self.getInfoLabel(labelPosition.label, labelPosition.x, labelPosition.y));
    }
    var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(ann.chart);
    infChart.drawingsManager.positionElliotWaveDrawingLabels(chartId, true);
    self.getSnappedValues();
    self.calculateAndUpdateInfoLabel(true);
    self.select();

    infChart.drawingUtils.common.saveBaseYValues.call(self, ann.options.yValue, ann.options.yValueEnd, undefined, ann.options.intermediatePoints);
    infChart.drawingUtils.common.saveNearestBaseYValues.call(this, ann.options.nearestYValue, ann.options.nearestYValueEnd, undefined, ann.options.nearestIntermediatePoints);
    infChart.drawingUtils.common.fixSelectionMarker.call(self, ann);
};

infChart.elliotTriangleWaveDrawing.prototype.hasMoreIntermediateSteps = function () {
    return !(this.annotation.options.completedSteps === 5);
};

infChart.elliotTriangleWaveDrawing.prototype.calculateAndUpdateInfoLabel = function (isCalculateNewValues) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        line = ann.shape.d.split(' '),
        chart = ann.chart,
        additionalDrawingsArr = self.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    var snappedValues = self.getSnappedValues();
    var infoLabelTypes = ["oLabel", "aLabel", "bLabel", "cLabel", "dLabel", "eLabel"];

    var waveDegreeSelected;
    this.waveDegrees.forEach(function (value, index) {
        if (value.name === options.currentWaveDegree) {
            waveDegreeSelected = value;
        }
    });

    infChart.util.forEach(snappedValues, function (index, value) {
        var calculatedLabelData = {
            price: snappedValues[index].yValue,
            type: self.type + ', ' + waveDegreeSelected.options[index],
            priceDifference: index !== 0 ? Math.abs(snappedValues[index - 1].yValue - snappedValues[index].yValue) : undefined,
            waveDegree: waveDegreeSelected.id
        };
        calculatedLabelData.pricePercentage = (calculatedLabelData.priceDifference >= 0) ? ((calculatedLabelData.priceDifference / calculatedLabelData.price) * 100) : undefined;

        var labelData = self.getLabelData(ann, calculatedLabelData);
        var label = additionalDrawingsArr.infoLabels[infoLabelTypes[index]];
        if (labelData && label) {
            if(isCalculateNewValues) {
                label.attr({
                    text: labelData
                });
            }

            var labelParameters = self.additionalDrawings.labels[infoLabelTypes[index]];
            var yLabelPosition = labelParameters.y;
            var xLabelPosition = labelParameters.x;

            var labelYValue = yAxis.toValue(yLabelPosition + yAxis.toPixels(options.yValue));
            if (snappedValues[index].yValue > labelYValue) {
                yLabelPosition = yLabelPosition + self.additionalDrawings.labels[infoLabelTypes[index]].height + 5;
            }
            if (snappedValues[index].yValue < labelYValue) {
                yLabelPosition = yLabelPosition - label.height - 5;
            }

            label.attr({
                x: xLabelPosition,
                y: yLabelPosition
            });
        }
    });
}