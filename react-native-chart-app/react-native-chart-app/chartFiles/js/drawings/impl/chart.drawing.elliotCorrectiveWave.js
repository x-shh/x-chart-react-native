window.infChart = window.infChart || {};

infChart.elliotCorrectiveWaveDrawing = function () {
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
            options:["O", "(((A)))", "(((B)))", "(((C)))"]
        },
        {
            id: "Millennium", 
            name: "millennium",
            label: "label.millennium",
            color: "#EF6351",
            enable: false,
            options:["O", "((A))", "((B))", "((C))"]
        },
        {
            id: "Sub Millennium", 
            name: "subMillennium",
            label: "label.subMillennium",
            color: "#3066BE",
            enable: false,
            options:["O", "(A)", "(B)", "(C)"]
        },
        {
            id: "Grand Super Cycle", 
            name: "grandSuperCycle",
            label: "label.grandSuperCycle",
            color: "#F93943", 
            enable: false,
            options:["O", "(((a)))", "(((b)))", "(((c)))"]
        },
        {
            id: "Super Cycle", 
            name: "superCycle",
            label: "label.superCycle",
            color: "#7E78D2", 
            enable: false,
            options:["O", "((a))", "((b))", "((c))"]
        },
        {
            id: "Cycle", 
            name: "cycle",
            label: "label.cycle",
            color: "#D65780", 
            enable: false,
            options:["O", "(a)", "(b)", "(c)"]
        },
        {
            id: "Primary",
            name: "primary",
            label: "label.primary",
            color: "#6C809A", 
            enable: false,
            options:["O", "{{{A}}}", "{{{B}}}", "{{{C}}}"]
        },
        {
            id: "Intermediate", 
            name: "intermediate",
            label: "label.intermediate",
            color: "#58A4B0", 
            enable: false,
            options:["O", "{{A}}", "{{B}}", "{{C}}"]
        },
        {
            id: "Minor", 
            name: "minor",
            label: "label.minor",
            color: "#5E8C61",
            enable: false, 
            options:["O", "{A}", "{B}", "{C}"]
        },
        {
            id: "Minute", 
            name: "minute",
            label: "label.minute",
            color: "#C89933", 
            enable: false,
            options:["O", "{{{a}}}", "{{{b}}}", "{{{c}}}"]
        },
        {
            id: "Minuette", 
            name: "minuette",
            label: "label.minuette",
            color: "#00A7E1", 
            enable: false,
            options:["O", "{{a}}", "{{b}}", "{{c}}"]
        },
        {
            id: "Sub Minuette", 
            name: "subMinuette",
            label: "label.subMinuette",
            color: "#912F56", 
            enable: false,
            options:["O", "{a}", "{b}", "{c}"]
        },
        {
            id: "Micro", 
            name: "micro",
            label: "label.micro",
            color: "#9D75CB", 
            enable: true,
            options:["O", "[[[A]]]", "[[[B]]]", "[[[C]]]"]
        },
        {
            id: "Sub Micro", 
            name: "subMicro",
            label: "label.subMicro",
            color: "#FE7B72",
            enable: false, 
            options:["O", "[[A]]", "[[B]]", "[[C]]"]
        },
        {
            id: "Nano", 
            name: "nano",
            label: "label.nano",
            color: "#8D818C", 
            enable: false,
            options:["O", "[A]", "[B]", "[C]"]
        },
        {
            id: "Sub Nano",
            name: "subNano",
            label: "label.subNano", 
            color: "#387D7A", 
            enable: false,
            options:["O", "A", "B", "C"]
        }
    ]
    this.labelValueNames = ["oLabel", "aLabel", "bLabel", "cLabel"];
    this.type = "Corrective";
    this.currentWaveDegree = "micro";
    infChart.elliotWaveDrawing.apply(this, arguments);
};

infChart.elliotCorrectiveWaveDrawing.prototype = Object.create(infChart.elliotWaveDrawing.prototype);

/**
* set additional drawings of the tool
*/
infChart.elliotCorrectiveWaveDrawing.prototype.additionalDrawingsFunction = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        options = ann.options,
        yAxis = chart.yAxis[options.yAxis],
        lineShapes = self.getPatternShapes(true),
        additionalDrawingsArr = self.additionalDrawings,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["elliotCorrectiveWave"],
        pointNamesArr = ["o", "a", "b", "c"];

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

infChart.elliotCorrectiveWaveDrawing.prototype.getClickValues = function (clickX, clickY) {
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
infChart.elliotCorrectiveWaveDrawing.prototype.getConfig = function () {
    var annotation = this.annotation;
    var intermediatePoints = [];

    infChart.util.forEach(annotation.options.intermediatePoints, function(index , value){
        intermediatePoints.push({
            xValue: value.xValue,
            yValue: value.yValue
        });
    });

    return {
        shape: 'elliotCorrectiveWave',
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
infChart.elliotCorrectiveWaveDrawing.prototype.getLabel = function (name, x, y) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        chart = ann.chart,
        theme = infChart.drawingUtils.common.getTheme(),
        shapeTheme = theme["elliotCorrectiveWave"];
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
        }
    });
    return labelData;
};

infChart.elliotCorrectiveWaveDrawing.prototype.getNextPointOptions = function () {
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
    }
    return pointOptions;
};

/**
* Returns the paths, values and positions of the shapes under this drawing
* @returns {object} pattern shapes
*/
infChart.elliotCorrectiveWaveDrawing.prototype.getPatternShapes = function (updateNearestValues) {
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
    var cx = options.xValueEnd && newXEnd;
    var cy = options.yValueEnd && newYEnd;

    if (cx !== undefined) {
        if (y < 0) {
            patternPaths.namePosition = { x: (cx) / 2, y: (cy) / 2 + nameAdditionalY };
        } else {
            patternPaths.namePosition = { x: (x + bx) / 2, y: (y + by) / 2 + nameAdditionalY };
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
            c: { x: cx, y: cy }
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
        patternPaths.positions.pointLabels.c = { x: cx, y: options.endTopOfthePoint ? cy - 25 : cy + 5, label: waveDegreeSelected.options[3], xValue: options.nearestXValueEnd, yValue: options.nearestYValueEnd, topOfThePoint: options.endTopOfthePoint };
        patternPaths.values.c = {
            xValue: options.xValueEnd,
            yValue: this.yValueEnd !== undefined ? this.yValueEnd : infChart.drawingUtils.common.getBaseYValue.call(this, options.yValueEnd),
            optionXValue: options.xValueEnd,
            optionYValue: options.yValueEnd
        };

    }
    return patternPaths;
};

infChart.elliotCorrectiveWaveDrawing.prototype.getSettingsPopup = function () {
    var common = infChart.drawingUtils.common;
    return infChart.structureManager.drawingTools.getElliotWaveSettings(infChart.manager.getLabel('label.elliotCorrectiveWave'), common.baseBorderColor, this.annotation.options.currentWaveDegree, this.waveDegrees, this.fontSize);
};

infChart.elliotCorrectiveWaveDrawing.prototype.finalizeEachPoint = function () {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["o", "a", "b", "c"];
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
infChart.elliotCorrectiveWaveDrawing.prototype.scale = function (isCalculateNewValueForScale) {
    var self = this,
        ann = self.annotation,
        options = ann.options,
        line,
        additionalDrawingsArr = self.additionalDrawings,
        pointNamesArr = ["o", "a", "b", "c"];
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

infChart.elliotCorrectiveWaveDrawing.prototype.setSelectionMarkers = function () {
    var self = this;
    var ann = self.annotation;
    var lineShapes = self.getPatternShapes();
    var additionalDrawingsArr = self.additionalDrawings;

    if (!ann.selectionMarker.length) {
        infChart.util.forEach(["o", "a", "b", "c"], function (index, value) {
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
infChart.elliotCorrectiveWaveDrawing.prototype.step = function (e, isStartPoint, itemProperties) {
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
infChart.elliotCorrectiveWaveDrawing.prototype.stop = function (e, isStartPoint) {
    var self = this,
        ann = self.annotation,
        lineShapes = self.getPatternShapes(true),
        additionalDrawingsArr = self.additionalDrawings;

    // point Labels
    if (!additionalDrawingsArr.labels["cLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["c"];
        labelPosition && (additionalDrawingsArr.labels["cLabel"] = self.getLabel(labelPosition.label, labelPosition.x, labelPosition.y));
        label = additionalDrawingsArr.labels["cLabel"];
        if(label){
            label.attr({x: labelPosition.x - label.width/2});
        }
    }

    if (!additionalDrawingsArr.infoLabels["cLabel"]) {
        var labelPosition = lineShapes.positions["pointLabels"]["c"];
        labelPosition && (additionalDrawingsArr.infoLabels["cLabel"] = self.getInfoLabel(labelPosition.label, labelPosition.x, labelPosition.y));
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

infChart.elliotCorrectiveWaveDrawing.prototype.hasMoreIntermediateSteps = function () {
    return !(this.annotation.options.completedSteps === 3);
};

infChart.elliotCorrectiveWaveDrawing.prototype.calculateAndUpdateInfoLabel = function (isCalculateNewValues) {
    var self = this, 
        ann = self.annotation,
        options = ann.options,
        line = ann.shape.d.split(' '),
        chart = ann.chart,
        additionalDrawingsArr = self.additionalDrawings,
        xAxis = chart.xAxis[options.xAxis],
        yAxis = chart.yAxis[ann.options.yAxis];

    var snappedValues = self.getSnappedValues();
    var infoLabelTypes = ["oLabel", "aLabel", "bLabel", "cLabel"];

    var waveDegreeSelected;
    this.waveDegrees.forEach(function(value, index){
        if(value.name === options.currentWaveDegree){
            waveDegreeSelected = value;
        }
    });

    infChart.util.forEach(snappedValues, function (index, value) {       
        var calculatedLabelData = {
            price: snappedValues[index].yValue,
            type: self.type + ', ' + waveDegreeSelected.options[index],
            priceDifference: index !== 0 ?  Math.abs(snappedValues[index-1].yValue - snappedValues[index].yValue) : undefined,
            waveDegree: waveDegreeSelected.id
        };
        calculatedLabelData.pricePercentage = (calculatedLabelData.priceDifference >= 0) ? ((calculatedLabelData.priceDifference /calculatedLabelData.price) * 100): undefined;

        var labelData = self.getLabelData(ann, calculatedLabelData);
        var label = additionalDrawingsArr.infoLabels[infoLabelTypes[index]];
        if(labelData && label){
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