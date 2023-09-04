var infChart = window.infChart || {};
/**
 * Created by nimila on 9/15/15.
 * Chart drawing features
 */
infChart.drawingsManager = (function ($, infChart) {
    var chartDrawingObjects = {},
        listeners = {},
        drawingToolBarProperties = {},
        scaleDrawingPausedCharts = [],
        scaleDrawingCalledWhenPaused = [],
        activeDrawing = null,
        activeDrawingSettings = null,
        isActiveDeleteTool = {},
        isActiveEraseMode = {},
        isActiveDrawing = false,
        isActiveDrawingInprogress = false,
        activeAnnotationInprogress = null,
        drawingConfigs = {},
        copiedDrawingObjProperties = {},
        _onKeyDownFunctions = {},
        _chartAreaKeyDownFunctions = {},
        _multipleDrawingsEnabledProperties = {},
        _savedDrawingOptionsMap = {},
        _providerInstances = {},
        _chartDrawingProviderTypes = {},
        _drawingTemplates = {},
        _drawingToolbarConfigs = [],
        _isDisableDrawingSettingsPanel = false;

    const ESC_KEY = 27;

    /**
     * Bind events for chart drawing
     * Drag, Step and Drop
     */
    var events = (function () {
        var chart, container, annotations, annotation, shapeId, drawingSettingsContainer, drawingObj, subTypeId,
            quickDrawingSettingsContainer, isPropertyChange;

        /**
         * step function called on mouse move
         * @param e
         */
        function step(e) {
            if (chart) {
                e = chart.pointer.normalize(e);
            }

            if (drawingObj.stepFunction) {
                drawingObj.stepFunction(e, false, drawingObj.getNextPointOptions && drawingObj.getNextPointOptions());
            }
            if(_isIntermediatePointDrawing(shapeId)){
                drawingObj.newPointAdded = true;
            }
        }

        /**
         * add annotation, bind events for step & stop function
         * @param e
         */
        function start(e) {

            if (e.which !== 1 || e.button !== 0) {
                e.preventDefault();
                return;
            }

            if (chart) {
                e = chart.pointer.normalize(e);
            }
            _changeGlobalLockStatus(chart);
            chart.annotationChangeInProgress = true;
            isActiveDrawingInprogress = true;
            var bbox = chart.container.getBoundingClientRect(),
                clickX = e.chartX,
                clickY = e.chartY;
            /* if( chart.infScaleX ) {
             clickX = clickX/chart.infScaleX;
             }

             if( chart.infScaleY ) {
             clickY = clickY/chart.infScaleY;
             }*/

            if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop)) {
                return;
            }

            var clickValues = _getClickValues(shapeId, chart, clickX, clickY);
            clickValues.subType = subTypeId;
            clickValues.completedSteps = 1;
            clickValues.shape = shapeId;
            var drawingObject = _createDrawing(chart, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
            drawingObj = _addAnnotation(drawingObject, chart, shapeId, clickValues, false);
            // _loadSettings(drawingObj);
            // _loadQuickSettings(drawingObj);

            var hasIntermediateStep = drawingObj.hasMoreIntermediateSteps && drawingObj.hasMoreIntermediateSteps();

            chart.activeAnnotation = drawingObj.annotation;

            chart.activeAnnotation.startXDiff = e.chartX - drawingObj.annotation.group.translateX;
            chart.activeAnnotation.startYDiff = e.chartY - drawingObj.annotation.group.translateY;
            chart.activeAnnotation.transX = 0;
            chart.activeAnnotation.transY = 0;

            infChart.util.unbindEvent(container, 'mousedown', start);
            document.addEventListener('keydown', keyDownEnd);
            container.addEventListener('mouseleave', ignoreUnfinishedDrawing);
            /*Highcharts.removeEvent(container, 'touchstart', start);*/

            switch (shapeId) {
                case 'label':
                case 'horizontalLine':
                case 'shortLine':
                case 'longLine':
                case 'horizontalRay':
                case 'verticalLine':
                case 'tradingLine':
                case 'limitOrder':
                case 'highLowLabels':
                case 'longPositions':
                case 'shortPositions':
                case 'upArrow':
                case 'downArrow':
                    end(e);
                    break;
                case 'andrewsPitchfork':
                case 'fib3PointPriceProjectionHLH':
                case 'fib3PointPriceProjectionLHL':
                case 'fib3PointPriceProjectionGeneric':
                case 'fib3PointTimeProjection':
                    infChart.util.bindEvent(container, 'mousemove', step);
                    infChart.util.bindEvent(container, 'mousedown', intermediate);
                    break;
                case 'brush':
                    infChart.util.bindEvent(container, 'mousemove', step);
                    infChart.util.bindEvent(container, 'mouseup', end);
                    break;
                case 'polyline':
                    infChart.util.bindEvent(container, 'mousemove', step);
                    infChart.util.bindEvent(container, 'mousedown', specificIntermediate);
                    break;
                default:
                    if (hasIntermediateStep) {
                        infChart.util.bindEvent(container, 'mousemove', step);
                        infChart.util.bindEvent(container, 'mousedown', intermediate);
                    } else {
                        infChart.util.bindEvent(container, 'mousemove', step);
                        infChart.util.bindEvent(container, 'mousedown', end);
                    }

                    /*infChart.util.bindEvent(container, 'touchmove', step);
                     Highcharts.addEvent(container, 'touchstart', end);*/
                    break;
            }

            //$(container).css({'cursor': 'url("../img/block_cursor.png"), default'});
            infChart.util.setCursor(container, 'block');
        }

        function ignoreUnfinishedDrawing(e){
            (drawingObj.isContinuousDrawing) ? end(e, true) : end(e, true, true);
        }

        /**
         * used only in andrews' pitchfork
         * to be written generally
         * @param e
         */
        function intermediate(e) {
            if (e.which == 3) {
                end(undefined, true);
            } else {
                if (e.detail === 2 || !drawingObj.newPointAdded) {
                    e.preventDefault();
                    return;
                }
                if (chart) {
                    e = chart.pointer.normalize(e);
                }

                var bbox = chart.container.getBoundingClientRect(),
                    clickX = e.chartX,
                    clickY = e.chartY;

                /* if( chart.infScaleX ) {
                clickX = clickX/chart.infScaleX;
                }

                if( chart.infScaleY ) {
                clickY = clickY/chart.infScaleY;
                }*/

                if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop)) {
                    return;
                }

                //destroy pitchfork
                var basePointX = drawingObj.annotation.options.trendXValue !== Number.MIN_SAFE_INTEGER ? drawingObj.annotation.options.trendXValue : drawingObj.annotation.options.xValue;
                var basePointY = drawingObj.annotation.options.trendYValue !== Number.MIN_SAFE_INTEGER ? drawingObj.annotation.options.trendYValue : drawingObj.annotation.options.yValue;
                var id = drawingObj.drawingId;
                var intermediatePoints = drawingObj.annotation.options.intermediatePoints;
                var completedSteps = drawingObj.annotation.options.completedSteps;

                var clickValues = drawingObj.getClickValues ? drawingObj.getClickValues(clickX, clickY) : _getClickValues(shapeId, chart, clickX, clickY);

                _removeDrawingInner(_getChartIdFromHighchartInstance(chart), id);

                clickValues.trendXValue = basePointX;
                clickValues.trendYValue = basePointY;
                clickValues.completedSteps = completedSteps + 1;
                clickValues.subType = subTypeId;

                var drawingObject = _createDrawing(chart, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                drawingObj = _addAnnotation(drawingObject, chart, shapeId, clickValues, false);
                if (typeof drawingObj.scale === "function" && drawingObj.annotation && drawingObj.annotation.options && !drawingObj.annotation.options.disableIntermediateScale) {
                    drawingObj.scaleDrawing();
                }
                chart.annotationChangeInProgress = true;

                var hasIntermediateStep = drawingObj.hasMoreIntermediateSteps && drawingObj.hasMoreIntermediateSteps();
                if (!hasIntermediateStep) {
                    Highcharts.removeEvent(container, 'mousedown', intermediate);
                    Highcharts.addEvent(container, 'mousemove', step);
                    Highcharts.addEvent(container, 'mousedown', end);
                } else {
                    chart.annotations.allowZoom = false;
                }
                if(_isIntermediatePointDrawing(shapeId)){
                    drawingObj.newPointAdded = false;
                }
                infChart.util.setCursor(container, 'block');
                //$(container).css({'cursor': 'url("../img/block_cursor.png"), default'});
            }
        }


        /**
         * used only in andrews' pitchfork
         * to be written generally
         * @param e
         */
        function specificIntermediate(e) {
            if (e.which == 3) {
                end(undefined, true);
            } else {
                if (e.detail == 2) {
                    if (drawingObj.annotation.options.intermediatePoints.length > 0) {
                        drawingObj.annotation.options.completedSteps = drawingObj.annotation.options.completedSteps - 1;
                        end(e);
                    }
                } else {
                    var name = e.target.getAttribute('name');
                    var drawingId = e.target.getAttribute('drawingId');
                    if (name == '0' && drawingId == drawingObj.drawingId) {
                        drawingObj.drawingIsFullFilled = true;
                        drawingObj.annotation.options.drawingIsFullFilled = true;
                        end(e);
                    } else {
                        if (chart) {
                            e = chart.pointer.normalize(e);
                        }

                        var clickX = e.chartX,
                            clickY = e.chartY;

                        if (!chart.isInsidePlot(clickX - chart.plotLeft, clickY - chart.plotTop)) {
                            return;
                        }

                        var id = drawingObj.drawingId;
                        var intermediatePoints = drawingObj.annotation.options.intermediatePoints;
                        var completedSteps = drawingObj.annotation.options.completedSteps;

                        var clickValues = drawingObj.getClickValues ? drawingObj.getClickValues(clickX, clickY) : _getClickValues(shapeId, chart, clickX, clickY);

                        _removeDrawingInner(_getChartIdFromHighchartInstance(chart), id);

                        clickValues.completedSteps = completedSteps + 1;
                        clickValues.subType = subTypeId;

                        var drawingObject = _createDrawing(chart, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                        drawingObj = _addAnnotation(drawingObject, chart, shapeId, clickValues, false);
                        if (typeof drawingObj.scale === "function" && drawingObj.annotation && drawingObj.annotation.options && !drawingObj.annotation.options.disableIntermediateScale) {
                            drawingObj.scaleDrawing();
                        }

                        chart.annotationChangeInProgress = true;
                        chart.annotations.allowZoom = false;

                        infChart.util.setCursor(container, 'block');
                    }
                    if(shapeId == 'polyline'){
                        drawingObj.newPointAdded = false;
                    }
                }
            }
        }

        function keyDownEnd(e) {
            if (e) {
                if (e.keyCode == 27) {
                    end(e, true);
                }
            }
        }

        /**
         * call stop function
         * @param e
         */
        function end(e, abortDrawing, unfinishedDrawing) {
            var isRightClick = (e && e.which === 3);
            var isDoubleClick = (e && e.detail === 2);
            var isPolyline = (shapeId === "polyline" || drawingObj.shape === "polyline");
            var isHighLowLabel = (shapeId === "highLowLabels" || drawingObj.shape === "highLowLabels");
            var isBrush = (shapeId === "brush" || drawingObj.shape === "brush");
            var stopFunctionOutput;
            var chartId = _getChartIdFromHighchartInstance(chart);
            container.removeEventListener('mouseleave', ignoreUnfinishedDrawing);

            if(isRightClick){
                abortDrawing = true;
            }

            if (isDoubleClick && !isPolyline && !isHighLowLabel || (!drawingObj.newPointAdded && _isIntermediatePointDrawing(shapeId, true))) {
                e.preventDefault();
                if (!_isSingleClickDrawing(shapeId)) {
                    return;
                }
            }
            if(isPolyline && abortDrawing && !drawingObj.newPointAdded){ //prevent remove last point when step function haven't run
                abortDrawing = false;
            }

            if (chart && e) {
                e = chart.pointer.normalize(e);
            }
            chart.annotationChangeInProgress = false;
            chart.activeAnnotation = null;

            if (isPolyline) {
                drawingObj.finishedInitialDrawing = true;
                drawingObj.annotation.options.finalCompletedSteps = (drawingObj.annotation.options.completedSteps - (abortDrawing ? 1 : 0));
            }

            if ((drawingObj && !drawingObj.settingsPopup && !abortDrawing) || isPolyline) {
                _loadQuickSettings(drawingObj);
            }

            if (drawingObj && !(abortDrawing && !drawingObj.isContinuousDrawing) && drawingObj.annotation && drawingObj.stop) {
                //drawingObj.stopFunction.call(drawingObj, e, undefined, true);
                stopFunctionOutput = drawingObj.wrapFunctionHelper.call(drawingObj, "stopFunction", drawingObj.stop, [e, undefined, true, abortDrawing]);
            }

            if ((abortDrawing && !drawingObj.isContinuousDrawing) || (stopFunctionOutput && stopFunctionOutput.stopPropagation)) { // if a drawing is not required to propagate it will be destroyed here
                _removeDrawingInner(chartId, drawingObj.drawingId);
                drawingObj = null;
                Highcharts.removeEvent(container, 'mousedown', intermediate);
                //TODO - Currently undo stop is not working. when we fix it we have to remove undo function from undo stack
            }

            infChart.util.unbindEvent(container, 'mousemove', step);
            document.removeEventListener('keydown', keyDownEnd, false);

            if (isBrush) {
                infChart.util.unbindEvent(container, 'mouseup', end);

                if (!abortDrawing && !_isMultipleDrawingsEnabled(chartId)) {
                    _toggleMultipleDrawings(chartId);
                    _addActiveClassToMultipleDrawingBtn(chartId);
                }
            } else if (isPolyline) {
                infChart.util.unbindEvent(container, 'mousedown', specificIntermediate);
            } else {
                infChart.util.unbindEvent(container, 'mousedown', end);
            }

            if (_isMultipleDrawingsEnabled(chartId) && subTypeId === infChart.constants.drawingTypes.shape || unfinishedDrawing) {
                Highcharts.addEvent(container, 'mousedown', start);
                infChart.util.setCursor(container, 'block');
            } else {
                _disableDrawing(chartId);
            }

            if (!abortDrawing && !isPolyline) {
                infChart.util.bindEvent(container, 'mouseup', select);
            }

            if (drawingObj && isPropertyChange) {
                drawingObj.onPropertyChange("drawings");
            }
            isActiveDrawingInprogress = false;
            // chart.activeAnnotation.onInit = false;
            // should redraw if plot area is depend on the drawing
            if (drawingObj && drawingObj.chartRedrawRequired) {
                infChart.manager.getChart(drawingObj.stockChartId).redrawChart();
            }

            if (isBrush || isHighLowLabel) {
                select();
            }
        }

        function select() {

            if (drawingObj && drawingObj.annotation) {
                // chart.selectedAnnotation = drawingObj.annotation; // if we do not set this, two drawings get selected at the same time
                if (drawingObj.stop) {
                    if (drawingObj.selectAndBindResize) {
                        drawingObj.selectAndBindResize();
                        if (!drawingObj.settingsPopup) {
                            drawingObj.showQuickDrawingSettings.call(drawingObj);
                        }
                    }
                    if (drawingObj && drawingObj.annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                        _bindKeyDown(drawingObj.annotation);
                    }
                }

                chart.selectedAnnotation = drawingObj.annotation; // if we do not set this, two drawings get selected at the same time
            }

            annotation = null;
            drawingObj = null;

            infChart.util.unbindEvent(container, 'mouseup', select);
            /*Highcharts.removeEvent(container, 'touchend', select);*/
        }

        return {
            bindEvents: function (chartObj, shape, drawSetCon, quickDrawSetCon, subType, isPropChange) {
                events.unbindEvents(chartObj);
                chart = chartObj;

                if(chart.annotationChangeInProgress) {
                    end(undefined, true);
                    isActiveDrawingInprogress = true;
                }

                container = chartObj.container;//'.tt_panelDiv';
                annotations = chartObj.annotations.allItems;
                shapeId = shape;
                subTypeId = subType;
                drawingSettingsContainer = drawSetCon;
                quickDrawingSettingsContainer = quickDrawSetCon;
                chart.annotations.allowZoom = false;
                chart.annotations.tradingMode = (shape === 'tradingLine' || subType === 'shape');
                isPropertyChange = isPropChange;

                infChart.util.bindEvent(container, 'mousedown', start);
                //Highcharts.addEvent(container, 'touchstart', start);
                infChart.util.setCursor(container, 'block');
                //$(container).css({'cursor': 'url("../img/block_cursor.png"), default'});
                //$(container).css({'cursor': 'url("../img/block_cursor.png"), default', 'z-index' : 10});
            },
            unbindEvents: function (chartObj) {
                container = chartObj.container;
                Highcharts.removeEvent(container, 'mousedown', start);
                infChart.util.setCursor(container, 'default');
                //$(container).css({'cursor': 'default'});
                //$(container).css({'cursor': 'default', 'z-index' : -10});

                if (chartObj.annotations) {
                    chartObj.annotations.allowZoom = true;
                    chartObj.annotations.tradingMode = false;
                }
            },
            annotationEnd: function(chartObj){
                var chart = chartObj;
                if(chart.annotationChangeInProgress) {
                    end(undefined, true);
                }
            }
        }
    })();

    var _isSingleClickDrawing = function (shapeId){
        var isSingleClickDrawing = false;
        switch(shapeId){
            case 'label':
            case 'horizontalLine':
            case 'shortLine':
            case 'longLine':
            case 'horizontalRay':
            case 'verticalLine':
            case 'highLowLabels':
            case 'longPositions':
            case 'shortPositions':
                isSingleClickDrawing = true;
                break;
            default:
                isSingleClickDrawing = false;
                break;
        }
        return isSingleClickDrawing;
    }

    var _isIntermediatePointDrawing = function (shapeId, isEnd){
        var isIntermediatePointDrawing = false;
        switch(shapeId){
            case 'harmonicPattern':
            case 'abcdPattern':
            case 'elliotTriangleWave':
            case 'elliotImpulseWave':
            case 'elliotCorrectiveWave':
            case 'elliotCorrectiveDoubleWave':
            case 'correctiveTripleWave':
            case 'fib3PointPriceProjectionHLH':
            case 'fib3PointPriceProjectionLHL':
            case 'fib3PointTimeProjection':
            case 'fib3PointPriceProjectionGeneric':
            case 'andrewsPitchfork':
                isIntermediatePointDrawing = true;
                break;
            case 'polyline':
                isIntermediatePointDrawing = !isEnd;
                break;
            default:
                break;
        }
        return isIntermediatePointDrawing;
    }

    var _getClickValues = function (shapeId, chart, clickX, clickY) {
        var coordinates = {xValue: 0, yValue: 0},
            xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0];

        switch (shapeId) {
            case "horizontalLine":
            case "tradingLine":
            case "holdingLine":
                coordinates.xValue = xAxis.toValue(chart.plotLeft);
                coordinates.yValue = yAxis.toValue(chart.plotTop + clickY);
                break;
            case 'verticalLine':
                coordinates.xValue = xAxis.toValue(chart.plotLeft + clickX);
                coordinates.yValue = yAxis.toValue(chart.plotTop);
                break;
            default:
                coordinates.xValue = xAxis.toValue(clickX);
                coordinates.yValue = yAxis.toValue(clickY);
                break;
        }

        return coordinates;
    };

    /**
     * @param {string} drawingId
     * @param {object} chartObj
     * @param {string} shapeId
     * @param {object} drawingSettingsContainer - chart container
     * @returns drawing object
     */
    var _createDrawing = function (chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer, drawingId) {
        var drawing;

        if (!drawingId) {
            drawingId = infChart.util.generateUUID();
        }

        switch (shapeId) {
            case 'line':
                drawing = new infChart.lineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'lineArrow':
                drawing = new infChart.lineArrowDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'ray':
                drawing = new infChart.rayDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'extendedLine':
                drawing = new infChart.extendedLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'horizontalLine':
                drawing = new infChart.horizontalLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'shortLine':
                drawing = new infChart.shortLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'longLine':
                drawing = new infChart.longLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'verticalLine':
                drawing = new infChart.verticalLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'trendChannel':
                drawing = new infChart.trendChannelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'horizontalRay':
                drawing = new infChart.horizontalRayDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'rectangle':
                drawing = new infChart.rectangleDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'ellipse':
                drawing = new infChart.ellipseDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'brush':
                drawing = new infChart.brushDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'upArrow':
                drawing = new infChart.arrowDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'downArrow':
                drawing = new infChart.arrowDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'regressionLine':
                drawing = new infChart.regressionLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'regressionChannel':
                drawing = new infChart.regressionChannelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'andrewsPitchfork':
                drawing = new infChart.andrewsPitchforkDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'label':
                drawing = new infChart.labelDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fibFans':
                drawing = new infChart.fibFansDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fibRetracements':
                drawing = new infChart.fibRetracementsDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fibVerRetracements':
                drawing = new infChart.fibVerRetracementsDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fibArcs':
                drawing = new infChart.fibArcsDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fib3PointPriceProjectionHLH':
            case 'fib3PointPriceProjectionLHL':
                drawing = new infChart.fib3PointPriceProjectionDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fib3PointPriceProjectionGeneric':
                drawing = new infChart.fib3PointPriceProjectionGenericDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fib3PointTimeProjection':
                drawing = new infChart.fib3PointTimeProjection(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'fib2PointTimeProjection':
                drawing = new infChart.fib2PointTimeProjection(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'harmonicPattern':
                drawing = new infChart.harmonicPatternDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'abcdPattern':
                drawing = new infChart.abcdPatternDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'elliotTriangleWave':
                drawing = new infChart.elliotTriangleWaveDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'elliotImpulseWave':
                drawing = new infChart.elliotImpluseWaveDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'elliotCorrectiveWave':
                drawing = new infChart.elliotCorrectiveWaveDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'elliotCorrectiveDoubleWave':
                drawing = new infChart.elliotCorrectiveDoubleWaveDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'correctiveTripleWave':
                drawing = new infChart.elliotCorrectiveTripleWaveDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'highLowLabels':
                drawing = new infChart.highLowLabels(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'longPositions':
            case 'shortPositions':
                drawing = new infChart.positionsDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
            case 'timestampMarker':
                drawing = new infChart.timestampMarkerDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
            case 'polyline':
                drawing = new infChart.polylineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer, true);
                break;
            case 'volumeProfile':
                drawing = new infChart.volumeProfileDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer);
                break;
        }
        return drawing;
    };

    /**
     *
     * @param {object} drawingObj of drawing
     * @param {object} chart
     * @param {sting} shape of the drawing object
     * @param {object} properties
     * @param {object} drawFromProperties
     * @returns drawingObj
     */
    var _addAnnotation = function (drawingObj, chart, shapeId, properties, drawFromProperties) {
        _setDrawingObject(drawingObj);

        var options = _getDrawingOptions(drawingObj.drawingId, shapeId, properties, chart, drawFromProperties);

        drawingObj.yValue = options.yValue;
        drawingObj.yValueEnd = options.yValueEnd;
        drawingObj.trendYValue = options.trendYValue;
        drawingObj.intermediatePoints = options.intermediatePoints;

        if (drawingObj.setNearestYValues) {
            drawingObj.setNearestYValues(options, chart);
        }
        drawingObj.nearestIntermediatePoints = options.nearestIntermediatePoints;
        drawingObj.subType = options.subType;

        chart.addAnnotation(options, true);

        var annotations = chart.annotations.allItems;
        var idx = 0;
        drawingObj.annotation = annotations[annotations.length - 1];

        if (annotations.length > 1) {
            var lastAnn = annotations[annotations.length - 2],
                stockChartId = _getChartIdFromHighchartInstance(lastAnn.chart);
            var lastDrwing = _getDrawingObject(stockChartId, lastAnn.options.id);
            idx = lastDrwing.idx + 1;
        }
        drawingObj.idx = idx;
        if (drawingObj.additionalDrawingsFunction) {
            drawingObj.additionalDrawingsFunction();
        }

        if (_validateExtremes(options)) {
            var yAxis = chart.yAxis[options.yAxis], extremes = options.getExtremesFn.call(drawingObj);
            if (extremes && ((yAxis.userMin || yAxis.dataMin) > extremes.min || (yAxis.userMax || yAxis.dataMax) < extremes.max)) {
                _setExtremes(drawingObj.stockChartId, true);
            }
        }

        return drawingObj;
    };

    var _getChartIdFromHighchartInstance = function (highchartInstance) {
        return infChart.manager.getContainerIdFromChart(highchartInstance.renderTo.id);
    };

    /**
     * get drawing options
     * @param {string} drawingId - drawing id
     * @param {string} shapeId - shape id
     * @param {object} properties - properties
     * @param  {object} chart - chart object
     * @param  {boolean} drawFromProperties - true, if drawing is existing one
     * @returns {object} - options
     * @private
     */
    var _getDrawingOptions = function (drawingId, shapeId, properties, chart, drawFromProperties) {
        var chartId = _getChartIdFromHighchartInstance(chart);
        var drawingObj = _getDrawingObject(chartId, drawingId);
        var defaultOptions = infChart.drawingUtils.common.getDefaultOptions();
        var specificOptions = drawingObj.getOptions(
            drawFromProperties ? properties : $.extend(true, {}, _getDefaultDrawingProperties(chartId, shapeId), properties),
            chart
        );
        var stockChart = infChart.manager.getChart(chartId);
        if (stockChart.settings.config.disableDrawingMove) {
            specificOptions.allowDragX = false;
            specificOptions.allowDragY = false;
            specificOptions.allowDragByHandle = false;
        }
        var options = $.extend(true, {}, defaultOptions, specificOptions);
        return $.extend(true, {
            id: drawingId,
            events: _getDrawingEvents(drawingId, chartId, options.drawingType)
        }, options);
    };

    var _addEventListeners = function (chartId) {
        listeners[chartId] = [];

        var chartInstance = infChart.manager.getChart(chartId);

        listeners[chartId].push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function (newSymbol, previousSymbol, config) {
                if (config.setProperties) {
                    _removeAllDrawings(chartId);
                }
            })
        });

        listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function (data, config) {
                _onNewProperties(chartId, config.drawings, true, data);
            })
        });

        listeners[chartId].push({
            method: 'afterSetExtremes',
            id: chartInstance.registerForEvents('afterSetExtremes', function () {
                if (!chartInstance.chart.isChartDragging) {
                    _scaleDrawings(chartId);
                }
            })
        });

        listeners[chartId].push({
            method: 'onSeriesTypeChange',
            id: chartInstance.registerForEvents('onSeriesTypeChange', function () {
                _scaleDrawingOnChartTypeChange(chartId);
            })
        });

        listeners[chartId].push({
            method: 'afterYSetExtremes',
            id: chartInstance.registerForEvents('afterYSetExtremes', function () {
                if (!chartInstance.chart.isChartDragging && !infChart.util.isEmpty(chartDrawingObjects[chartId])) {
                    _scaleDrawings(chartId);
                    if (_setExtremesRequired(chartId)) {
                        _setExtremes(chartId, false);
                    }
                }
            })
        });

        listeners[chartId].push({
            method: 'setExtremesByDragging',
            id: chartInstance.registerForEvents('setExtremesByDragging', function (isXZoom) {
                if (isXZoom) {
                    _scaleDrawings(chartId);
                } else if (!infChart.util.isEmpty(chartDrawingObjects[chartId])) {
                    _scaleDrawings(chartId);
                    if (_setExtremesRequired(chartId)) {
                        _setExtremes(chartId, false);
                    }
                }
            })
        });

        listeners[chartId].push({
            method: 'resize',
            id: chartInstance.registerForEvents('resize', function () {
                _scaleDrawings(chartId);
                infChart.structureManager.toolbar.positionFavoriteMenu(chartId);
            })
        });

        listeners[chartId].push({
            method: 'destroy',
            id: chartInstance.registerForEvents('destroy', function () {
                _removeAllDrawings(chartId);
            })
        });

        listeners[chartId].push({
            method: 'onBaseAxisResize',
            id: chartInstance.registerForEvents('onBaseAxisResize', function () {
                _scaleDrawings(chartId);
            })
        });

        // listeners[chartId].push({
        //     method: 'beforeScalingAxis',
        //     id: chartInstance.registerForEvents('beforeScalingAxis', function () {
        //         _pauseScaleDrawings(chartId);
        //     })
        // });
        //
        // listeners[chartId].push({
        //     method: 'afterScalingAxis',
        //     id: chartInstance.registerForEvents('afterScalingAxis', function () {
        //         _unPauseScaleDrawings(chartId);
        //     })
        // });

        // used in horzontal line since plot area changes according to the label
        listeners[chartId].push({
            method: 'modeChange',
            id: chartInstance.registerForEvents('modeChange', function () {
                _scaleDrawings(chartId, true);
            })
        });

        listeners[chartId].push({
            method: 'afterRedrawXAxisWithoutSetExtremes',
            id: chartInstance.registerForEvents('afterRedrawXAxisWithoutSetExtremes', function () {
                _afterRedrawXAxisWithoutSetExtremes(chartId);
            })
        });

        listeners[chartId].push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function () {
                _scaleDrawings(chartId, true);
            })
        });

        listeners[chartId].push({
            method: 'onCompareSymbolLoad',
            id: chartInstance.registerForEvents('onCompareSymbolLoad', function () {
                _scaleDrawings(chartId, true);
            })
        });

        listeners[chartId].push({
            method: 'onRemoveCompareSymbol',
            id: chartInstance.registerForEvents('onRemoveCompareSymbol', function () {
                _scaleDrawings(chartId, true);
            })
        });
    };

    var _removeEventListeners = function (chartId) {
        var chartInstance = infChart.manager.getChart(chartId);

        listeners[chartId].forEach(function (val) {
            chartInstance.removeRegisteredEvent(val.method, val.id);
        });

        delete listeners[chartId];
    };

    /**
     * get settings container
     * @param {string} chartId - chart ic
     * @returns {object} - settings container
     */
    var _getSettingsContainer = function (chartId) {
        return $(_getDrawingSettingsContainer($(infChart.manager.getChart(chartId).getContainer())));
    };

    var _getQuickSettingsContainer = function (chartId) {
        return $(_getQuickDrawingSettingContainer($(infChart.manager.getChart(chartId).getContainer())));
    };

    var _onNewProperties = function (chartId, drawingProperties, keepPrevious, data) {
        if (!keepPrevious) {
            _removeAllDrawings(chartId);
        }
        if (drawingProperties && drawingProperties.length > 0 && data.length !== 0) {
            var chartInstance = infChart.manager.getChart(chartId),
                settingsContainer = _getSettingsContainer(chartId),
                quickSettingsContainer = _getQuickSettingsContainer(chartId);

            var chartRedrawRequired = false;
            infChart.util.forEach(drawingProperties, function (i, drawing) {
                var drawingObj = _createDrawing(chartInstance.chart, drawing.shape, settingsContainer, quickSettingsContainer, drawing.drawingId);
                drawingObj = _drawDrawingFromProperties(drawingObj, chartInstance.chart, settingsContainer, drawing);
                // _loadSettings(drawingObj);
                // _loadQuickSettings(drawingObj);
                if (drawingObj.chartRedrawRequired) {
                    chartRedrawRequired = true
                }
            });

            if (chartRedrawRequired) {
                chartInstance.chart.redraw();
            }
        }
    };

    /**
     * initialise drawing manager
     * @param {string} chartId - chart id
     * @param {object} dataProviderObj - chart data provider obj
     * @param {boolean} isDisableDrawingSettingsPanel - is disable drawing setting panel
     */
    var _onInitialize = function (chartId, dataProviderObj, isDisableDrawingSettingsPanel) {
        infChart.drawingUtils.common.setTheme();
        _isDisableDrawingSettingsPanel = isDisableDrawingSettingsPanel;
        if (chartId) {
            isActiveDeleteTool[chartId] = false;
        }
        if (chartId) {
            isActiveEraseMode[chartId] = false;
        }

        if (!chartDrawingObjects[chartId]) {
            chartDrawingObjects[chartId] = {};
            _setDataProvider(chartId, dataProviderObj);
            _addEventListeners(chartId);
        } else {
            infChart.util.console.error('drawings manager already initialized for chart => ' + chartId);
        }
    };

    var _onDestroy = function (chartId) {
        _getSettingsContainer(chartId).html('');
        _removeAllDrawings(chartId);
        _removeEventListeners(chartId);
        _removeChartAreaKeyDownListener(chartId, ESC_KEY);
        _multipleDrawingsEnabledProperties[chartId] = false;
        delete chartDrawingObjects[chartId];
    };

    var _scaleDrawingsInner = function (chartId, isCalculateNewValueForScale) {
        var drawings = chartDrawingObjects[chartId],
            selectedDrawing;
        if (drawings) {
            $.each(drawings, function (key, drawing) {
                if (drawing.annotation.chart) {
                    drawing.scaleDrawing(isCalculateNewValueForScale);
                    if (drawing.annotation.chart.selectedAnnotation && drawing.annotation.chart.selectedAnnotation === drawing.annotation) {
                        selectedDrawing = drawing;
                    }
                }
            });

            // to bring the axis label of the selected label to front
            if (selectedDrawing) {
                selectedDrawing.select();
            }
        }
    };


    var _deselectDrawingTools = function (chartId, currentDrawingId) {
        var drawings = chartDrawingObjects[chartId];
        if (drawings) {
            $.each(drawings, function (drawingId, drawing) {
                if (drawing.deselectAllDrawingsInAdditionalDrawingSelect) {
                    if (currentDrawingId != drawingId) {
                        drawing.deselect.call(drawing);
                    }
                }
            });
        }
    };

    var _removeDrawingInner = function (chartId, drawingId, isPropertyChange) {
        var drawingObj = _getDrawingObject(chartId, drawingId);
        var ann = drawingObj.annotation, chart = ann.chart, annOptions = ann.options;
        var chartRedrawRequired = false;
        if (drawingObj) {
            var drawingType = annOptions.drawingType;
            if (drawingType === infChart.constants.drawingTypes.shape) {
                if (chart.activeAnnotation === ann) {
                    chart.activeAnnotation = null;
                    chart.annotationChangeInProgress = false;
                    chart.annotations.allowZoom = true;
                    _setActiveAnnotationInprogress(null);
                }
                if (chart.selectedAnnotation === ann) {
                    drawingObj.annotation.events.deselect.call(drawingObj.annotation);
                }
                var drawingProperties = _getDrawingProperties(ann);
                _deleteDrawingObject(chartId, drawingId);
                if (isPropertyChange) {
                    drawingObj.onPropertyChange("drawings");
                }
                chartRedrawRequired = drawingObj.destroy(isPropertyChange, drawingProperties);
            }
        }
        return chartRedrawRequired;
    };

    /**
     * switch right settings panel to symbol when no drawing tools
     * @param {string} chartId
     */
    var _switchSettingsTab = function (chartId) {
        var stockChart = infChart.manager.getChart(chartId);
        if (stockChart.isRightPanelOpen()) {//todo : need to check if drawings tab is open
            var drawings = chartDrawingObjects[chartId];
            var hasShapeDrawings = false;

            $.each(drawings, function (drawingId, drawingObj) {
                if (!hasShapeDrawings && drawingObj.annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                    hasShapeDrawings = true;
                }
            });

            if (!hasShapeDrawings) {
                stockChart.showRightPanelWithTab((chartId + "_" + "symbolSettingsPanelView"));
            }
        }
    };

    /**
     * check whether extremes have to be validated
     * @param chartId
     * @returns {boolean}
     * @private
     */
    var _setExtremesRequired = function (chartId) {
        var required = false,
            stockChart = infChart.manager.getChart(chartId),
            chart = stockChart.chart,
            annotations = chart.annotations;

        if (annotations && annotations.allItems.length > 0) {
            for (var i = 0; i < annotations.allItems.length; i++) {
                var annotation = annotations.allItems[i];
                if (_validateExtremes(annotation.options) && annotation.visible !== false) {
                    required = true;
                    break;
                }
            }
        }
        return required;
    };

    var _validateExtremes = function (options) {
        return typeof options.getExtremesFn === 'function' && options.adjustYAxisToViewAnnotation;
    };

    var _setExtremes = function (chartId, resetExtremes) {
        var stockChart = infChart.manager.getChart(chartId),
            chart = stockChart.chart,
            yAxis = chart.yAxis[0];
        if (yAxis.dataMin && yAxis.dataMax) {
            var min = undefined, max = undefined, setExtremes = false;
            var extremes = _getExtremesForDrawings(chartId, stockChart.isUserDefinedYAxisExtremes());
            if (!stockChart.isUserDefinedYAxisExtremes()) {
                if (extremes && extremes.min !== null && extremes.max !== null && (yAxis.dataMin > extremes.min || yAxis.dataMax < extremes.max)) {
                    if (yAxis.dataMin > extremes.min) {
                        if (yAxis.dataMax < extremes.max) {
                            if (yAxis.userMin || yAxis.userMax) {
                                if (yAxis.userMin) {
                                    if (yAxis.userMin > extremes.min) {
                                        setExtremes = true;
                                        if (yAxis.userMax) {
                                            if (yAxis.userMax < extremes.max) {
                                                min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((extremes.max - extremes.min) * yAxis.options.minPadding);
                                                max = extremes.max + ((extremes.max - extremes.min) * yAxis.options.maxPadding);
                                            } else {
                                                min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((yAxis.userMax - extremes.min) * yAxis.options.minPadding);
                                                max = yAxis.userMax;
                                            }
                                        } else {
                                            min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((extremes.max - extremes.min) * yAxis.options.minPadding);
                                            max = extremes.max + ((extremes.max - extremes.min) * yAxis.options.maxPadding);
                                        }
                                    } else {
                                        if (yAxis.userMax) {
                                            if (yAxis.userMax < extremes.max) {
                                                setExtremes = true;
                                                max = extremes.max + ((extremes.max - yAxis.userMin) * yAxis.options.maxPadding);
                                                min = yAxis.userMin;
                                            }
                                        } else {
                                            setExtremes = true;
                                            max = extremes.max + ((extremes.max - yAxis.userMin) * yAxis.options.maxPadding);
                                            min = yAxis.userMin;
                                        }
                                    }
                                } else {
                                    setExtremes = true;
                                    if (yAxis.userMax < extremes.max) {
                                        min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((extremes.max - extremes.min) * yAxis.options.minPadding);
                                        max = extremes.max + ((extremes.max - extremes.min) * yAxis.options.maxPadding);
                                    } else {
                                        min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((yAxis.userMax - extremes.min) * yAxis.options.minPadding);
                                        max = yAxis.userMax;
                                    }
                                }
                            } else {
                                setExtremes = true;
                                min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((extremes.max - extremes.min) * yAxis.options.minPadding);
                                max = extremes.max + ((extremes.max - extremes.min) * yAxis.options.maxPadding);
                            }
                        } else {
                            if (yAxis.userMin) {
                                if (yAxis.userMin > extremes.min) {
                                    setExtremes = true;
                                    min = extremes.minPaddingUtilized ? extremes.min : extremes.min - (((yAxis.userMax || yAxis.dataMax) - extremes.min) * yAxis.options.minPadding);
                                    max = yAxis.userMax || yAxis.dataMax;
                                }
                            } else {
                                setExtremes = true;
                                min = extremes.minPaddingUtilized ? extremes.min : extremes.min - (((yAxis.userMax || yAxis.dataMax) - extremes.min) * yAxis.options.minPadding);
                                max = yAxis.userMax || yAxis.dataMax;
                            }
                        }
                    } else {
                        if (yAxis.userMax) {
                            if (yAxis.userMax < extremes.max || (chart.activeAnnotation && !chart.activeAnnotation.options.mouseDownOnAnn)) {
                                setExtremes = true;
                                max = extremes.max + ((extremes.max - (yAxis.userMin || yAxis.dataMin)) * yAxis.options.maxPadding);
                                min = yAxis.userMin || yAxis.dataMin;
                            }
                        } else {
                            setExtremes = true;
                            max = extremes.max + ((extremes.max - (yAxis.userMin || yAxis.dataMin)) * yAxis.options.maxPadding);
                            min = yAxis.userMin || yAxis.dataMin;
                        }
                    }

                    if (setExtremes) {
                        // console.error('chart :: setting y axis extremes => min=' + min + ', max=' + max);
                        yAxis.setExtremes(min, max, true, false);
                    }
                } else {
                    if (resetExtremes && (yAxis.userMin || yAxis.userMax)) {
                        // console.error('chart :: resetting setting y axis extremes => min=' + yAxis.userMin + ', max=' + yAxis.userMax);
                        yAxis.setExtremes(null, null, true, false);
                    }
                }
            } else {
                if (extremes && extremes.min !== null && extremes.max !== null && (yAxis.userMin > extremes.min || yAxis.userMax < extremes.max)) {
                    if (yAxis.userMin > extremes.min) {
                        if (yAxis.userMax < extremes.max) {
                            min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((extremes.max - extremes.min) * yAxis.options.minPadding);
                            max = extremes.max + ((extremes.max - extremes.min) * yAxis.options.maxPadding);
                        } else {
                            max = yAxis.userMax;
                            min = extremes.minPaddingUtilized ? extremes.min : extremes.min - ((yAxis.userMax - extremes.min) * yAxis.options.maxPadding);
                        }
                    } else {
                        min = yAxis.userMin;
                        max = extremes.max + ((extremes.max - yAxis.userMin) * yAxis.options.maxPadding);
                    }
                    yAxis.setExtremes(min, max, true, false);
                }
            }
        }
    };

    /**
     * called when remove drawing from the chart
     * set extremes null when chart is not zoom
     * @param {string} chartId
     * @param {string} annotationId
     * @private
     */
    var _setExtremesOnRemove = function (chartId, annotationId) {
        var stockChart = infChart.manager.getChart(chartId),
            chart = stockChart.chart,
            yAxis = chart.yAxis[0];

        if (stockChart.isUserDefinedYAxisExtremes()) {
            _setExtremes(chartId, (annotationId === chart.infMinAnnotation || annotationId === chart.infMaxAnnotation));
        } else {
            yAxis.setExtremes(null, null, true, false);
        }
    };

    var _setDrawingObject = function (drawingObj) {
        var stockChartId = drawingObj.stockChartId,
            drawingId = drawingObj.drawingId;

        chartDrawingObjects[stockChartId][drawingId] = drawingObj;
    };

    var _deleteDrawingObject = function (chartId, drawingId) {
        if (chartDrawingObjects[chartId] && chartDrawingObjects[chartId][drawingId]) {
            delete chartDrawingObjects[chartId][drawingId];
        }
    };

    /**
     * Paste copied item
     * IMPORTANT Note :: made this method public to wrap up drom commands.wrappers
     * @param annotation
     */
    var pasteNewItem = function (annotation) {
        var chartId = _getChartIdFromHighchartInstance(annotation.chart);
        var chartInstance = infChart.manager.getChart(chartId);
        var settingsContainer = _getSettingsContainer(chartId);
        var quickSettingsContainer = _getQuickSettingsContainer(chartId);

        var drawingObj = _createDrawing(chartInstance.chart, copiedDrawingObjProperties[chartId].shape, settingsContainer, quickSettingsContainer, copiedDrawingObjProperties[chartId].drawingId);
        drawingObj = _drawDrawingFromProperties(drawingObj, chartInstance.chart, settingsContainer, copiedDrawingObjProperties[chartId]);
        var newAnn = drawingObj.annotation;

        // select the annotation if not selected
        if (!newAnn.selectionMarker) {
            var drawings = chartDrawingObjects[chartId],
                prevDrawing = drawings && drawings[annotation.options.id];
            if (!annotation.selectionMarker) {
                //prevDrawing.deselectFunction.call(prevDrawing);
                if (prevDrawing.deselect) {
                    prevDrawing.deselect(true);
                } else {
                    infChart.drawingUtils.common.onDeselect.call(this);
                }
            } else {
                annotation.events.deselect.call(annotation, undefined, true);
            }
            drawingObj.selectAndBindResize();
            annotation.chart.selectedAnnotation = newAnn;
        }
        if (drawingObj && newAnn.options.drawingType === infChart.constants.drawingTypes.shape) {
            _bindKeyDown(newAnn);
            copiedDrawingObjProperties[chartId] = _getDrawingPropertiesToCopy(newAnn);
        }
        return drawingObj;
    };

    /**
     * Handles the copy/paste of given annotation
     * @param {Event} event keypress event
     * @param {object} annotation highchart annotation
     * @private
     */
    var _handleCopyPaste = function (event, annotation) {
        var key = event.which || event.keyCode,
            ctrl = event.ctrlKey || event.metaKey || ((key === 17) ? true : false),
            chartId = _getChartIdFromHighchartInstance(annotation.chart),
            targetEl = event.target;

        if (($(targetEl).is('body') || (targetEl.hasAttribute("x-enable-drawing-copy") && (!targetEl.xIsTextField() || targetEl.xGetSelectedText() === undefined)))
            && annotation && annotation.options) {
            if (ctrl) {
                switch (key) {
                    case 86:
                        console.debug("Chart Drawing:: Ctrl + V Pressed !");
                        if (copiedDrawingObjProperties[chartId]) {
                            infChart.drawingsManager.pasteNewItem(annotation);
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    case 67:
                        console.debug("Chart Drawing:: Ctrl + C Pressed !");
                        copiedDrawingObjProperties = {}; // to invalidate other copied items in the other charts
                        copiedDrawingObjProperties[chartId] = _getDrawingPropertiesToCopy(annotation);
                        break;
                    default:
                        break;
                }
            }
        } else if (key == 67 && ctrl) {
            // to avoid multiple copies of the previous item
            copiedDrawingObjProperties = {};
        }
    };

    /**
     * Bind key down after selecting the given annotation
     * @param {object} annotation highcharts annotation
     * @private
     */
    var _bindKeyDown = function (annotation) {
        var chartId = _getChartIdFromHighchartInstance(annotation.chart);

        function onKeyDown(event) {
            if (annotation && (!annotation.chart || !annotation.chart.infMouseIn && !$("#" + chartId).xIsInside(event.target, ".inf-chart"))) {
                return;
            }

            var key = event.which || event.keyCode;

            if (!$(event.target).is('input') && !$(event.target).is('textarea') && annotation && annotation.options && annotation.chart && annotation.chart.selectedAnnotation) {
                switch (key) {
                    case 8://event.key === "Backspace"
                    case 46://event.key === "Delete"
                        if (!infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                            _removeDrawing(chartId, annotation.options.id, undefined, true);
                            _unbindKeyDown(chartId);
                        }
                        break;
                    default:
                        break;
                }
            }
            if (annotation.options && !annotation.options.disableCopyPaste && annotation.chart) {
                _handleCopyPaste(event, annotation);
            }
        }

        _unbindKeyDown(chartId);
        $(document).on('keydown', onKeyDown);
        _onKeyDownFunctions[chartId] = onKeyDown;
    };

    /**
     * unbind specific key down for drawing tools
     * @param {string} chartId chart id of the event
     * @private
     */
    var _unbindKeyDown = function (chartId) {
        var stockChart = infChart.manager.getChart(chartId);
        if (_onKeyDownFunctions[chartId]) {
            $(document).off('keydown', _onKeyDownFunctions[chartId]);
            delete _onKeyDownFunctions[chartId];
        }
    };

    var _disableDrawing = function (chartId) {
        $(infChart.manager.getChart(chartId).getContainer()).find("a[inf-ctrl-role=disDrawing]").trigger('click');
    };

    var _addActiveClassToMultipleDrawingBtn = function (chartId) {
        $(infChart.manager.getChart(chartId).getContainer()).find("a[inf-ctrl-role=multipleDrawing]").addClass('active');
    };

    /**
     * get min max for all annotations
     * sets min/max annotations to yAxis also
     * @param {string} chartId
     * @param {boolean} isYAxisAdjusted
     */
    var _getExtremesForDrawings = function (chartId, isYAxisAdjusted) {
        var stockChart = infChart.manager.getChart(chartId),
            chart = stockChart.chart,
            annotations = chart.annotations,
            yAxis,
            min = null,
            max = null,
            minAnnotationId = null,
            maxAnnotationId = null,
            minPaddingUtilized,
            maxPaddingUtilized,
            dataMax,
            dataMin;

        if (annotations && annotations.allItems.length > 0) {
            chart.infGetDrawingExtremesInProgress = true;
            for (var i = 0; i < annotations.allItems.length; i++) {
                var annotation = annotations.allItems[i];
                if (!yAxis) {
                    yAxis = chart.yAxis[annotation.options.yAxis];
                }
                if (_validateExtremes(annotation.options) && annotation.visible !== false) {
                    var useDrawing = isYAxisAdjusted ? annotation.options.viewAnnotionWhenAdjustedYAxis : annotation.options.adjustYAxisToViewAnnotation;
                    if (useDrawing) {
                        var drawing = _getDrawingObject(chartId, annotation.options.id),
                            userExtremes = annotation.options.getExtremesFn.call(drawing);
                        var annotationId = annotation.options.id;
                        if (userExtremes) {
                            if (min === null || userExtremes.min < min) {
                                min = userExtremes.min;
                                if (yAxis.dataMin > min) {
                                    minAnnotationId = annotationId;
                                    minPaddingUtilized = userExtremes.minPaddingUtilized;
                                    ///yAxis.tempMinAnnotationId =
                                }
                                dataMin = userExtremes.dataMin;
                            }

                            if (max === null || userExtremes.max > max) {
                                max = userExtremes.max;
                                if (yAxis.dataMax < max) {
                                    maxAnnotationId = annotationId;
                                    maxPaddingUtilized = userExtremes.maxPaddingUtilized;
                                }
                                dataMax = userExtremes.dataMax;
                            }
                        }
                    }
                }
            }
        }

        if (yAxis) {

            if (yAxis.infMinAnnotation != minAnnotationId) {
                yAxis.prevMinAnnotation = yAxis.infMinAnnotation;
            }

            if (yAxis.infMaxAnnotation != maxAnnotationId) {
                yAxis.prevMaxAnnotation = yAxis.infMaxAnnotation;
            }

            yAxis.infMinAnnotation = minAnnotationId;
            yAxis.infMaxAnnotation = maxAnnotationId;

        }
        chart.infGetDrawingExtremesInProgress = false;

        return {
            min: min,
            max: max,
            dataMax: dataMax,
            dataMin: dataMin,
            minPaddingUtilized: minPaddingUtilized,
            maxPaddingUtilized: maxPaddingUtilized

        };

    };

    /**
     * called when user releases the drawing and when show order on chart
     * set y axis extremes in above scenarios
     * we have to set the y axis extremes in following scenarios
     * 1. drawing is inside the data/user range and it is moved outside the data/user range
     * 2. drawing is min/max annotation(outside the data range) and it is moved even further
     * 3. drawing is min/max annotation(outside the data range) and it is moved closer(but still outside the data range)
     * @param {string} chartId
     * @param {object} annotation
     * @private
     */
    var _setYExtremesOnAnnotationUpdate = function (chartId, annotation) {
        if (_validateExtremes(annotation.options)) {
            var stockChart = infChart.manager.getChart(chartId);
            var chart = stockChart.chart, yAxis = chart.yAxis[annotation.options.yAxis], min = null, max = null;
            var drawing = _getDrawingObject(chartId, annotation.options.id);
            var userExtremes = annotation.options.getExtremesFn.call(drawing);
            var yValue = annotation.options.yValue;
            var annotationId = annotation.options.id,
                maxCalData,
                minCalData;

            if (userExtremes && !stockChart.isUserDefinedYAxisExtremes()) {
                var drawingExtremes = yAxis.infMinAnnotation || yAxis.infMaxAnnotation ? _getExtremesForDrawings(chartId, false) : undefined;

                if (annotationId === yAxis.infMinAnnotation) {
                    if (userExtremes.min < yAxis.userMin || userExtremes.min < yAxis.dataMin) {//set new min using annotations extremes
                        maxCalData = yAxis.infMaxAnnotation ? (drawingExtremes && (drawingExtremes.dataMax || drawingExtremes.max)) || yAxis.userMax : yAxis.dataMax; // need to calculated data max from yAxis.userMax if it is uesd
                        minCalData = userExtremes.minPaddingUtilized ? userExtremes.dataMin || (userExtremes.min + maxCalData * yAxis.options.minPadding) / (1 - yAxis.options.minPadding) : userExtremes.min;
                        min = userExtremes.minPaddingUtilized ? userExtremes.min : userExtremes.min - ((maxCalData - userExtremes.min) * yAxis.options.minPadding);
                        if (yAxis.infMaxAnnotation) {
                            if (yAxis.infMaxAnnotation == annotationId) {
                                max = userExtremes.maxPaddingUtilized ? userExtremes.max : userExtremes.max + ((userExtremes.max - minCalData) * yAxis.options.maxPadding);
                            } else if (drawingExtremes || yAxis.userMax) {
                                max = (drawingExtremes && drawingExtremes.max) || yAxis.userMax;
                            } else {
                                max = null;
                            }
                            yAxis.setExtremes(min, max, true, false);
                        } else {
                            yAxis.setExtremes(min, null, true, false);
                        }
                    } else {
                        //reset min
                        if (yAxis.infMaxAnnotation && yAxis.userMax) {
                            max = (drawingExtremes && drawingExtremes.max) || yAxis.userMax;
                            yAxis.setExtremes(null, max, true, false);
                        } else {
                            yAxis.setExtremes(null, null, true, false);
                        }
                    }
                } else if (annotationId === yAxis.infMaxAnnotation) {
                    maxCalData = /*userExtremes.maxPaddingUtilized ? null :*/ userExtremes.dataMax || userExtremes.max; // IMPORTANT : do not use this to calculate datamax when userExtremes.maxPaddingUtilized = true
                    minCalData = yAxis.infMinAnnotation ? (drawingExtremes && drawingExtremes.min && drawingExtremes.minPaddingUtilized) || (!drawingExtremes && yAxis.userMin) ?
                        (drawingExtremes && drawingExtremes.dataMin) || (maxCalData + ((drawingExtremes && drawingExtremes.min) || yAxis.userMin) * yAxis.options.minPadding) / (1 + yAxis.options.minPadding) :
                        drawingExtremes && (drawingExtremes.dataMin || drawingExtremes.min) || yAxis.dataMin : yAxis.dataMin;
                    min = yAxis.infMinAnnotation ? (drawingExtremes && drawingExtremes.min) || (yAxis.userMin || yAxis.dataMin) : yAxis.dataMin;

                    if (userExtremes.max > yAxis.userMax || userExtremes.max > yAxis.dataMax) {//set new max

                        max = userExtremes.maxPaddingUtilized ? userExtremes.max : userExtremes.max + ((userExtremes.max - minCalData) * yAxis.options.maxPadding);
                        if (yAxis.infMinAnnotation) {
                            yAxis.setExtremes(min, max, true, false);
                        } else {
                            yAxis.setExtremes(null, max, true, false);
                        }
                    } else {
                        //reset max
                        if (yAxis.infMinAnnotation) {
                            yAxis.setExtremes(min, null, true, false);
                        } else {
                            yAxis.setExtremes(null, null, true, false);
                        }
                    }
                } else {
                    // annotation doesn't expand the extremes
                    var reset = false;
                    if (userExtremes.max > yAxis.dataMax || userExtremes.min < yAxis.dataMin) {
                        //annotation is beyond the data extremes of the chart
                        if (userExtremes.max > yAxis.dataMax) {
                            if (!yAxis.userMax || userExtremes.max > yAxis.userMax) { // current userMax is not set or current y axis max is lower than the annotation max
                                if (yAxis.infMinAnnotation && (drawingExtremes.min || yAxis.userMin)) {
                                    // there is a min annotation and use that for the max calculation and actual min
                                    max = userExtremes.max + ((userExtremes.max - ((drawingExtremes && drawingExtremes.min) || yAxis.userMin || yAxis.dataMin)) * yAxis.options.maxPadding);
                                    yAxis.setExtremes((drawingExtremes.min || yAxis.userMin), max, true, false);
                                } else {
                                    // no min annotation and data min is used for the calculation and min is rest
                                    max = userExtremes.max + ((userExtremes.max - (yAxis.userMin || yAxis.dataMin)) * yAxis.options.maxPadding);
                                    yAxis.setExtremes(null, max, true, false);
                                }
                            } else if (!yAxis.infMaxAnnotation) {
                                // if there is no max annotation this annotation should be the max since its extremes are greater than the data max of the chart
                                var minForCal = yAxis.infMinAnnotation && (drawingExtremes.min || yAxis.userMin) ? drawingExtremes.min || yAxis.userMin : userExtremes.min < yAxis.dataMin ? userExtremes.min : null;
                                min = minForCal ? minForCal == userExtremes.min && userExtremes.minPaddingUtilized ? userExtremes.min
                                    : minForCal - ((userExtremes.max - minForCal) * yAxis.options.minPadding) : null;
                                max = userExtremes.max + ((userExtremes.max - (min || yAxis.dataMin)) * yAxis.options.maxPadding);
                                yAxis.setExtremes(min, max, true, false);

                            } else if (annotation.infExpanded) {
                                // when annotation is released after expanded moving towards the data range, it needs to be reset
                                reset = true;
                            } else if (yAxis.prevMaxAnnotation === annotationId || yAxis.prevMinAnnotation === annotationId) {
                                // when annotation is released which earlier was the max annotation
                                reset = true;
                            }
                        } else {
                            if (!yAxis.userMin || userExtremes.min < yAxis.userMin) {
                                //annotation is beyond the data extremes of the chart or userMax is not set
                                if (annotation.infExpanded) {
                                    // when annotation is released after expanded moving towards the data range, it needs to be reset
                                    reset = true;
                                } else if (yAxis.infMaxAnnotation && yAxis.userMax) {
                                    // since there is a max annotation using that for calculation of the min
                                    min = userExtremes.min - ((((drawingExtremes && drawingExtremes.max) || yAxis.userMax || yAxis.dataMax) - userExtremes.min) * yAxis.options.minPadding);
                                    yAxis.setExtremes(min, yAxis.userMax, true, false);
                                } else {
                                    // calculate min using dataMax or usermax since there is no max annotation
                                    min = userExtremes.min - (((yAxis.userMax || yAxis.dataMax) - userExtremes.min) * yAxis.options.minPadding);
                                    yAxis.setExtremes(min, null, true, false);
                                }
                            } else if ((annotation.infExpanded && drawingExtremes && (yAxis.userMin < drawingExtremes.min || yAxis.userMax > drawingExtremes.max)) ||
                                (yAxis.prevMaxAnnotation === annotationId || yAxis.prevMinAnnotation === annotationId)) {
                                // when annotation is released after expanded moving towards the data range, it needs to be reset or
                                // when annotation is released which earlier was the max annotation
                                reset = true;
                            }
                        }
                    } else if ((annotation.infExpanded && drawingExtremes && (yAxis.userMin < drawingExtremes.min || yAxis.userMax > drawingExtremes.max)) ||
                        (yAxis.prevMaxAnnotation === annotationId || yAxis.prevMinAnnotation === annotationId)) {
                        reset = true;
                    }

                    if (drawingExtremes && reset) {
                        // when there are other annotations which occupy the min and max extremes but current extremes are changed when moving the released annotation earlier
                        _resetYExtremes(chartId, drawingExtremes);
                        // annotation.infExpanded = false;  // Note :: this is done in the annotation js. If it needs to be done just after resetting extremes it should go here.

                    } else if (reset) {
                        yAxis.setExtremes(null, null, true, false);
                        //annotation.infExpanded = false; // Note :: this is done in the annotation js. If it needs to be done just after resetting extremes it should go here.

                    }
                }

                if (!yAxis.infMinAnnotation) {
                    yAxis.prevMinAnnotation = null;
                }

                if (!yAxis.infMaxAnnotation) {
                    yAxis.prevMaxAnnotation = null;
                }
            }
        }
    };

    /**
     * Reset y Extremes to min/max drawings or data range
     * @param drawingExtremes
     * @param chartId
     * @private
     */
    var _resetYExtremes = function (chartId, drawingExtremes) {

        var stockChart = infChart.manager.getChart(chartId),
            yAxis = stockChart && stockChart.getMainYAxis();

        if (stockChart && !stockChart.isUserDefinedYAxisExtremes()) {

            drawingExtremes = drawingExtremes || _getExtremesForDrawings(chartId, false);
            // when there are other annotations which occupy the min and max extremes but current extremes are changed when moving the released annotation earlier
            var maxCalData = yAxis.infMaxAnnotation ? (drawingExtremes && (drawingExtremes.dataMax || drawingExtremes.max)) || yAxis.userMax : yAxis.dataMax, // need to calculated data max from yAxis.userMax if it is uesd
                minCalData;

            if (yAxis.infMinAnnotation) {

                if (drawingExtremes && drawingExtremes.dataMin) {
                    // dataMin is calculated from the minimum drawing tool
                    minCalData = drawingExtremes && drawingExtremes.dataMin;

                } else if ((drawingExtremes && drawingExtremes.min && drawingExtremes.minPaddingUtilized) ||
                    (!drawingExtremes && yAxis.userMin)) {
                    // dataMin is not calculated from the minimum drawing tool, but padding space is utilized or drawingExtremes are not specified.
                    // So calculate it using dataMax and padding.
                    minCalData = (maxCalData + ((drawingExtremes && drawingExtremes.min) || yAxis.userMin) * yAxis.options.minPadding) / (1 + yAxis.options.minPadding);
                } else {
                    // dataMin is not calculated from the minimum drawing tool, but padding space is not utilized (So min is calculated including the padding)
                    // or drawingExtremes are not specified
                    minCalData = drawingExtremes && drawingExtremes.min || yAxis.dataMin;
                }
            } else {
                // It doesn't have min drawing
                minCalData = yAxis.dataMin;
            }

            var max = !infChart.util.isDefined(maxCalData) || maxCalData == yAxis.dataMax ? null : maxCalData + (maxCalData - minCalData) * yAxis.options.maxPadding,
                min = !infChart.util.isDefined(maxCalData) || minCalData == yAxis.dataMin ? null : minCalData - (maxCalData - minCalData) * yAxis.options.minPadding;

            if (min != yAxis.userMin || max != yAxis.userMax) {
                yAxis.setExtremes(min, max, true, false);
            }
        }
    };

    /**
     * initialize chart drawing
     * @param {*} container
     * @param {*} uniqueId
     * @param {*} parent
     * @private
     */
    var _setDrawing = function (container, uniqueId, parent) {
        var drawingTools = parent.find("a[inf-ctrl=drawing]");
        // var chart = infChart.manager.getChart(uniqueId).chart;
        var shape, drawingCategory, drawingCategoryCtrl, subType, iChart, hChart,
            drawingSettingsContainer = _getDrawingSettingsContainer(container),
            quickDrawingSettingsContainer = _getQuickDrawingSettingContainer(container);

        drawingTools.each(function () {
            $(this).unbind().click(function (event) {
                iChart = infChart.manager.getChart(uniqueId);
                hChart = iChart && iChart.chart;
                if (hChart && iChart._hasData()) {
                    shape = $(this).attr("inf-ctrl-shape");
                    subType = $(this).attr("inf-ctrl-subType");
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
                    _initializeDrawing(hChart, shape, drawingSettingsContainer, quickDrawingSettingsContainer, subType, true);

                    _setActiveDrawingToolOptions(uniqueId, parent);
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }
                    parent.find("a[drawing-cat=" + $(this).attr("drawing-cat") + "]").removeClass('active');
                    drawingCategory = $(this).attr('drawing-cat');
                    drawingCategoryCtrl = parent.find("a[draw-cat=" + drawingCategory + "]");
                    drawingCategoryCtrl.html($(this).find('span[rel="icon-span"]')[0].outerHTML);
                    drawingCategoryCtrl.attr("inf-ctrl-shape", shape);
                    drawingCategoryCtrl.addClass('active');
                    $(this).addClass('active');
                    iChart._fireEventListeners("onDrawingOptionSelect");
                }
                event.preventDefault();
            });
        });
    };

    var _setDrawingFavoriteIcons = function (containerElem, containerId, config) {
        var parentFaveriteToolbar = $(infChart.structureManager.getContainer(containerElem[0], "favoriteMenuPanel"));
        var parentToolbar = $(infChart.structureManager.getContainer(containerElem[0], "drawingToolbar"));
        var drawingToolFavIcons = parentToolbar.find("span[inf-ctrl=drawing-fav]");
        drawingToolFavIcons.each(function () {
            $(this).unbind().click(function (event) {
                var favoriteToolbarList = parentFaveriteToolbar.find("ul[class=flt-tlbar__tools]");
                var drawingCat = this.getAttribute("drawing-cat");
                let shape = this.getAttribute("inf-ctrl-shape");
                var drawingToolConfig = config[drawingCat];
                if (drawingToolConfig.options) {
                    let favoriteItem = drawingToolConfig.options.filter(option => option.shape === shape)[0];
                    let filledStar = 'icom-star';
                    let borderStar = 'icom-star-o';
                    let starIcon = $(this).find("i[rel=icon-i]");
                    if (favoriteItem.isFavorite) {
                        if (favoriteToolbarList[0].children.length > 1) {
                            favoriteItem.isFavorite = false;
                            favoriteToolbarList.find('li[inf-fav-list=' + shape + ']').remove();
                            starIcon.removeClass(filledStar);
                            starIcon.addClass(borderStar);
                            $(this).attr('adv-chart-tooltip', infChart.manager.getLabel('label.addToFavorite'));
                        } else {
                            infChart.util.showMessage(this.id, infChart.manager.getLabel("msg.favoriteToolbarItemFallShort"));
                        }
                    } else {
                        if (favoriteToolbarList[0].children.length < 10) {
                            favoriteItem.isFavorite = true;                     
                            favoriteToolbarList.append(infChart.structureManager.drawingTools.getDrawing(favoriteItem, true));
                            starIcon.removeClass(borderStar);
                            starIcon.addClass(filledStar);
                            $(this).attr('adv-chart-tooltip', infChart.manager.getLabel('label.removeFromFavorite'));
                            let favoriteDrawingCat = favoriteToolbarList.find('a[inf-ctrl-shape=' + shape + ']');
                            favoriteDrawingCat.attr('adv-chart-tooltip', infChart.manager.getLabel(favoriteItem.label));
                            favoriteDrawingCat.attr('class', 'adv-chart-tooltip right');
                            $(favoriteDrawingCat).unbind().click(function (event) {
                                _drawingCategoryClick(containerElem, containerId, parentFaveriteToolbar, favoriteDrawingCat, event);
                            });
                        } else {
                            infChart.util.showMessage(this.id, infChart.manager.getLabel("msg.favoriteToolbarItemExceeded"));
                        }

                        _setFavoritePanelDrawing(containerElem, containerId);
                    }
                    _storeFavoriteDrawingConfigs(infChart.manager.getFavoriteToolBarConfigs(), {shape: shape, cat: drawingCat, isFavorite: favoriteItem.isFavorite});
                    _addChangedFavDrawingToolbarConfig(containerId, infChart.manager.getFavoriteToolBarConfigs());
                }
                _showFavoriteToolBarIfHide(containerElem, containerId);
                event.stopPropagation();
            });
        })
    };

    var _removeFavoriteDrawingFromContextMenu = function (uniqueId, drawingCat, drawingShape, chartId) {
      var containerElem = $("#" + uniqueId);
      var drawingCat = drawingCat;
      var shape = drawingShape;
      var config = _getDrawingConfigs(chartId);
      var toggleElm = infChart.structureManager.drawingTools.getFavoriteToggleElement(containerElem, drawingCat, shape, config);
      if(toggleElm) {
        toggleElm.click();
      }
    };

    var _storeFavoriteDrawingConfigs = function (configs, favoriteObject) {
        if (_isConfigExist(configs, favoriteObject.shape)) {
            let index = configs.findIndex(config => config.shape == favoriteObject.shape);
            configs.splice(index, 1);
            configs.push(favoriteObject);
        } else {
            configs.push(favoriteObject);
        }
    };

    var _isConfigExist = function(configs, shape) {
        let config = configs.filter(function(config) { 
            return config.shape === shape;
        });
        return config[0] && config[0] != null;
    };

    var _addChangedFavDrawingToolbarConfig = function(uniqueId, drawingToolbarConfigs) {
        let chart = infChart.manager.getChart(uniqueId);
        chart._onPropertyChange('favoriteDrawingToolbarConfigs', drawingToolbarConfigs);
    };

    var _showFavoriteToolBarIfHide = function(container, containerId) {
        var chart = infChart.manager.getChart(containerId);
        if (!chart.isFavoriteEnabled) {
            $(infChart.structureManager.getContainer($(container)[0], "favoriteMenuPanel")).show();
            chart.isFavoriteEnabled = true;
            _activeFavElement(container);
        }
    };

    var _activeFavElement = function(container) {
        $(infChart.structureManager.getContainer(container[0], "drawingToolbar")).find('a[inf-ctrl-role=favorite]').addClass('active');
    };

    var _setActiveSelectOption = function (container, crosshair) {
        var leftToolbar = infChart.structureManager.getContainer(container, 'drawingToolbar');
        var mainSelectItem = $(leftToolbar).find("a[inf-ctrl-role=disDrawing]");
        var options = mainSelectItem.parent().find("a[inf-ctrl=disDrawing]");
        var selectOption = $(options).filter('[inf-ctrl-subType="select"]');
        var crossHairOption = $(options).filter('[inf-ctrl-subType="all"]');
        var crossHairWithlastOption = $(options).filter('[inf-ctrl-subType="last"]');

        $(options).removeClass('active');
        if (crosshair.enabled) {
            if(crosshair.type == "all") {
                if($(crossHairOption).find('span[rel="icon-span"]')[0]){
                    $(mainSelectItem).html($(crossHairOption).find('span[rel="icon-span"]')[0].outerHTML);
                }
                $(crossHairOption).addClass('active');
            } else if(crosshair.type == "last"){
                if($(crossHairWithlastOption).find('span[rel="icon-span"]')[0]){
                    $(mainSelectItem).html($(crossHairWithlastOption).find('span[rel="icon-span"]')[0].outerHTML);
                }
                $(crossHairWithlastOption).addClass('active');
            }
        } else {
            if($(selectOption).find('span[rel="icon-span"]')[0]){
                $(mainSelectItem).html($(selectOption).find('span[rel="icon-span"]')[0].outerHTML);
            }
            $(selectOption).addClass('active');
        }
    };

    var _bindSelectOptions = function (container, uniqueId, parent) {
        var toolbarItems = parent.find("a[inf-ctrl=drawCat]");
        var mainSelectItem = $(toolbarItems).filter('[draw-cat="select"]');
        var options = parent.find("a[inf-ctrl=disDrawing]");
        var selectOption = $(options).filter('[inf-ctrl-subType="select"]');
        var crossHairOption = $(options).filter('[inf-ctrl-subType="all"]');
        var crossHairWithlastOption = $(options).filter('[inf-ctrl-subType="last"]');

        $(selectOption).unbind().click(function (event) {
            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            var crosshair = iChart.crosshair;

            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);

            if (crosshair.enabled) {
                iChart.toggleCrosshair('none', true);
            }
            if (_isMultipleDrawingsEnabled(uniqueId)) {
                _toggleMultipleDrawings(uniqueId);
            }
            _setActiveDrawingToolOptions(uniqueId, parent);

            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }
            $(selectOption).addClass('active');
            $(mainSelectItem).addClass('active');

            _setIsActiveDrawing(false);
            _removeDrawingEvents(hChart);
            _deselectDeleteTool(hChart);
        });

        $(crossHairOption).unbind().click(function (event) {

            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            var crosshair = iChart.crosshair;

            if (_isMultipleDrawingsEnabled(uniqueId)) {
                _toggleMultipleDrawings(uniqueId);
            }
            _setActiveDrawingToolOptions(uniqueId, parent);

            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }

            if (!crosshair.enabled || crosshair.type !== "all") {
                iChart.toggleCrosshair("all", true);
            }
            $(crossHairOption).addClass('active');
            $(mainSelectItem).addClass('active');
            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);

            _setIsActiveDrawing(false);
            _removeDrawingEvents(hChart);
            _deselectDeleteTool(hChart);
        });

        $(crossHairWithlastOption).unbind().click(function (event) {

            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            var crosshair = iChart.crosshair;

            if (_isMultipleDrawingsEnabled(uniqueId)) {
                _toggleMultipleDrawings(uniqueId);
            }
            _setActiveDrawingToolOptions(uniqueId, parent);

            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }
            if (!crosshair.enabled ||crosshair.type !== "last") {
                iChart.toggleCrosshair("last", true);
            }
            $(crossHairWithlastOption).addClass('active');
            $(mainSelectItem).addClass('active');
            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);

            _setIsActiveDrawing(false);
            _removeDrawingEvents(hChart);
            _deselectDeleteTool(hChart);
        });
    };

    var _setSelectOptions = function (container, uniqueId, parent) {
        var iChartInstance = infChart.manager.getChart(uniqueId);
        var crosshair = iChartInstance.crosshair;
        _setActiveSelectOption(container, crosshair);
        _bindSelectOptions(container, uniqueId, parent);
    };

    var _setDeleteOptions = function(container, uniqueId, parent){
        var toolbarItems = parent.find("a[inf-ctrl=drawCat]");
        var mainSelectItem = $(toolbarItems).filter('[draw-cat="delete"]');
        var options = parent.find("a[inf-ctrl=delDrawing]");
        var deleteDrawingOption = $(options).filter('[inf-ctrl-subType="deleteDrawing"]');
        var deleteLevelsOption = $(options).filter('[inf-ctrl-subType="deleteLevels"]');
        var deleteAllOption = $(options).filter('[inf-ctrl-subType="deleteAllDrawing"]');

        $(deleteDrawingOption).unbind().click(function (event) {
            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            if(hChart.annotationChangeInProgress) {
                events.annotationEnd(hChart);
            }
            infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
            if (_isMultipleDrawingsEnabled(uniqueId)) {
                _toggleMultipleDrawings(uniqueId);
            }
            _setActiveDrawingToolOptions(uniqueId, parent, undefined, true);
            if (hChart.selectedAnnotation) {
                hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
            }
            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }
            $(deleteDrawingOption).addClass('active');
            $(mainSelectItem).addClass('active');
            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);
            $(mainSelectItem).attr('inf-ctrl-role','delDrawing');
            _setIsActiveDrawing(false);
            _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), false);
            _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), true);
            _removeDrawingEvents(hChart);
            if (hChart.annotations) {
                annotations = hChart.annotations.allItems;
                for (var i = 0, length = annotations.length; i < length; i++) {
                    annotation = annotations[i];
                    drawingObj = _getDrawingObject(uniqueId, annotation.options.id);

                    if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                        var catConfig = drawingConfigs[uniqueId][$(this).attr('drawing-cat')];
                        var url = catConfig.options[0].cursorUrl ? catConfig.options[0].cursorUrl : '../img/del_cursor.png';
                        if (annotation.shape) {
                            annotation.shape.element.style.removeProperty("cursor");
                            annotation.shape.css({'cursor': 'url("' + url + '"), default'});
                        } else if (annotation.title) {
                            annotation.title.element.style.removeProperty("cursor");
                            annotation.title.attr({'cursor': 'url("' + url + '"), default'});
                        }

                        $.each(drawingObj.dragSupporters, function (id, value) {
                            value.element.style.setProperty('cursor', 'url("' + url + '"), default');
                        });
                        if(drawingObj.specificCursorChange){
                            drawingObj.specificCursorChange(url);
                        }
                    }
                }
            }
            if (hChart.selectedAnnotation) {
                var selectedAnnotation = hChart.selectedAnnotation;
                selectedAnnotation.events.deselect.call(selectedAnnotation, undefined, true);
            }
            iChart._fireEventListeners("onDrawingOptionSelect");
        });

        $(deleteLevelsOption).unbind().click(function (event) {
            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            if(hChart.annotationChangeInProgress) {
                events.annotationEnd(hChart);
            }
            infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
            if (_isMultipleDrawingsEnabled(uniqueId)) {
                _toggleMultipleDrawings(uniqueId);
            }
            _setActiveDrawingToolOptions(uniqueId, parent, undefined, true );
            if (hChart.selectedAnnotation) {
                hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
            }
            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }
            $(deleteLevelsOption).addClass('active');
            $(mainSelectItem).addClass('active');
            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);
            $(mainSelectItem).attr('inf-ctrl-role','delLevel');
            _setIsActiveDrawing(false);
            _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), false);
            _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), true);
            _removeDrawingEvents(hChart);
            if (hChart.annotations) {
                annotations = hChart.annotations.allItems;
                for (var i = 0, length = annotations.length; i < length; i++) {
                    annotation = annotations[i];
                    drawingObj = _getDrawingObject(uniqueId, annotation.options.id);

                    if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                        var catConfig = drawingConfigs[uniqueId][$(this).attr('drawing-cat')];
                        var url = catConfig.options[1].cursorUrl ? catConfig.options[1].cursorUrl : '../img/del-levels.png';
                        if (annotation.shape) {
                            annotation.shape.element.style.removeProperty("cursor");
                            annotation.shape.css({'cursor': 'url("' + url + '"), default'});
                        } else if (annotation.title) {
                            annotation.title.element.style.removeProperty("cursor");
                            annotation.title.attr({'cursor': 'url("' + url + '"), default'});
                        }

                        $.each(drawingObj.dragSupporters, function (id, value) {
                            value.element.style.setProperty('cursor', 'url("' + url + '"), default');
                        });
                        if(drawingObj.specificCursorChange){
                            drawingObj.specificCursorChange(url);
                        }
                    }
                }
            }
            if (hChart.selectedAnnotation) {
                var selectedAnnotation = hChart.selectedAnnotation;
                selectedAnnotation.events.deselect.call(selectedAnnotation, undefined, true);
            }
        });

         $(deleteAllOption).unbind().click(function (event) {
            var iChart = infChart.manager.getChart(uniqueId);
            var hChart = iChart && iChart.chart;
            if(hChart.annotationChangeInProgress) {
                events.annotationEnd(hChart);
             }

            for (let [key, option] of Object.entries(options)) {
                $(option).removeClass('active');
            }

            $(deleteAllOption).addClass('active');
            //$(mainSelectItem).addClass('active');
            $(mainSelectItem).html($(this).find('span[rel="icon-span"]')[0].outerHTML);
            $(mainSelectItem).attr('inf-ctrl-role','deleteAllDrawing');
            _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), false);
            _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), false);

             _removeAllDrawings(_getChartIdFromHighchartInstance(hChart.annotations.chart), true);
             iChart.isGloballyLocked = false;
             iChart._fireEventListeners("onDrawingOptionSelect");
             if (!_isMultipleDrawingsEnabled(uniqueId)){
                 _disableDrawing(uniqueId);
             }
             iChart._fireEventListeners("onDrawingOptionSelect");
         });
    };

    var _setSelectToolbarIconOnReset = function(uniqueId, container) {
        var containerElm = container ? container : $('#' + uniqueId);
        var toolbarParent = $(infChart.structureManager.getContainer(containerElm[0], "drawingToolbar"));
        var toolbarItems = toolbarParent.find("a[inf-ctrl=drawCat]");
        var mainSelectItem = $(toolbarItems).filter('[draw-cat="select"]');
        var options = toolbarParent.find("a[inf-ctrl=disDrawing]");
        var selectOption = $(options).filter('[inf-ctrl-subType="select"]');
        var crossHairOption = $(options).filter('[inf-ctrl-subType="all"]');
        var crossHairWithlastOption = $(options).filter('[inf-ctrl-subType="last"]');

        // setTimeout(function() {
            var iChartInstance = infChart.manager.getChart(uniqueId);
            var crosshair = iChartInstance.crosshair;
            if(crosshair.enabled){
                if (crosshair.type == "all") {
                    $(crossHairOption).click();
                }
                else if(crosshair.type == "last") {
                    $(crossHairWithlastOption).click();
                }
            }
            else {
                $(selectOption).click();
            }
        // }, 0);
    };

    /**
     * get drawing settings container
     * @param {object} container - chart container
     * @returns {object}
     */
    var _getDrawingSettingsContainer = function (container) {
        if (!_isDisableDrawingSettingsPanel) {
            return $(infChart.structureManager.getContainer(container[0], 'drawingToolPanelView'));
        } else {
            return $(infChart.structureManager.getContainer(container[0], 'drawing'));
        }
    };

    var _getQuickDrawingSettingContainer = function (container) {
        return $(infChart.structureManager.getContainer(container[0], 'quickDrawingSettingsPanel'));
    };

    /**
     * Delete tool for chart drawings
     * @param container
     * @param uniqueId
     * @param parent
     * @param config
     * @private
     */
    var _setDrawingCategory = function (container, uniqueId, parent, config, isGloballyLocked) {
        var drawingCategories = parent.find("a[inf-ctrl=drawCat]");
        var stockChart = infChart.manager.getChart(uniqueId);

        $.each(drawingCategories, function (index, cat) {
            if ($(this).attr("inf-ctrl-role") === 'favorite') {
                $(this).addClass('active has-text-highlight');
            }

            if($(this).attr("inf-ctrl-role") === 'globalLock'){
                if (isGloballyLocked){
                    _setActiveDrawingToolOptions(uniqueId, parent);
                     $(this).addClass('active');
                     $(this).attr({'adv-chart-tooltip' : infChart.manager.getLabel('label.globalUnlock')});
                     $($(this).children()[0]).attr({class: 'icom icom-lock'})
                }else {
                     $(this).removeClass('active');
                     $(this).attr({'adv-chart-tooltip' : infChart.manager.getLabel('label.globalLock')});
                     $($(this).children()[0]).attr({class: 'icom icom-unlock'})
                }
            }

            $(cat).unbind().click(function (event) {
                _drawingCategoryClick(container, uniqueId, parent, this, event);
                stockChart._fireEventListeners("onDrawingOptionSelect");
                event.preventDefault();
            });       

        });
    };

    var _setFavoritePanelDrawing = function (container, uniqueId) {
        var parentFaveriteToolbar = $(infChart.structureManager.getContainer(container[0], "favoriteMenuPanel"));
        var favoriteToolbarList = parentFaveriteToolbar.find("ul[rel=fav-panel-drawing-list]");
        var favIconList = favoriteToolbarList.find("li[rel=fav-toolbar-item]");
        favIconList.each(function () {
            $(this).off().on("contextmenu", function (event) {
                _favoriteDrawingRightClick(event, uniqueId, this);
            });
        })
    }

    var _favoriteDrawingRightClick = function(event, uniqueId, cat) {
        if (event.which === 3) {
            var chartId = infChart.manager.getChart(uniqueId).id;
            let chart = infChart.manager.getChart(chartId);
            let options = chart.settings.contextMenu.favoriteDrawing.options;
            var drawingCat = $(cat).children().attr("draw-cat");
            var drawingShape = $(cat).children().attr("inf-ctrl-shape");
            options.uniqueId = uniqueId;
            options.drawingCat = drawingCat;
            options.drawingShape = drawingShape;

            infChart.contextMenuManager.openContextMenu(chartId, {
                top: event.clientY,
                left: event.clientX
            }, infChart.constants.contextMenuTypes.favoriteDrawing, options, event);
        }
        event.preventDefault();
    }

    var _drawingCategoryClick = function (container, uniqueId, parent, cat, event) {
        var hChart;
        var annotations, annotation, drawingObj, shape, role, subType, iChart,
            drawingSettingsContainer = _getDrawingSettingsContainer(container), //parent.find("div[inf-container=drawing_settings]");
            quickDrawingSettingsContainer = _getQuickDrawingSettingContainer(container);

        iChart = infChart.manager.getChart(uniqueId);
        hChart = iChart && iChart.chart;
        if (hChart && iChart._hasData()) {
            role = $(cat).attr("inf-ctrl-role");
            switch (role) {
                case "drawing":
                    //if (infChart.drawingsManager.isMultipleDrawingsEnabled()) {
                    //    drawingCategories.not('a[inf-ctrl-role="multipleDrawing"]').removeClass('active');
                    //} else {
                    //    drawingCategories.removeClass('active');
                    //}
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);

                    _setActiveDrawingToolOptions(uniqueId, parent);
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }

                    $(cat).addClass('active');
                    shape = $(cat).attr("inf-ctrl-shape");
                    subType = $(cat).attr("inf-ctrl-subType");
                    _initializeDrawing(hChart, shape, drawingSettingsContainer, quickDrawingSettingsContainer, subType, true);
                    if (_isMultipleDrawingsEnabled(uniqueId)) {
                        _setIsActiveDrawing(false);
                    }
                    break;
                case "disDrawing":
                    if (_isMultipleDrawingsEnabled(uniqueId)) {
                        _toggleMultipleDrawings(uniqueId);
                    }

                    if (!iChart.isGloballyLocked){
                        _setActiveDrawingToolOptions(uniqueId, parent);
                    }
                    $(cat).addClass('active');
                    _setIsActiveDrawing(false);
                    _removeDrawingEvents(hChart);
                    _deselectDeleteTool(hChart);
                    break;
                case "delDrawing" :
                    if(hChart.annotationChangeInProgress) {
                        events.annotationEnd(hChart);
                    }
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
                    if (_isMultipleDrawingsEnabled(uniqueId)) {
                        _toggleMultipleDrawings(uniqueId);
                    }
                    _setActiveDrawingToolOptions(uniqueId, parent, true);
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }
                    $(cat).addClass('active');
                    _setIsActiveDrawing(false);
                    _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), false);
                    _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), true);
                    _removeDrawingEvents(hChart);
                    if (hChart.annotations) {
                        annotations = hChart.annotations.allItems;
                        for (var i = 0, length = annotations.length; i < length; i++) {
                            annotation = annotations[i];
                            drawingObj = _getDrawingObject(uniqueId, annotation.options.id);

                            if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                                var catConfig = drawingConfigs[uniqueId][$(cat).attr('draw-cat')];
                                var url = catConfig.options[0].cursorUrl ? catConfig.options[0].cursorUrl : '../img/del_cursor.png';
                                if (annotation.shape) {
                                    annotation.shape.element.style.removeProperty("cursor");
                                    annotation.shape.css({'cursor': 'url("' + url + '"), default'});
                                } else if (annotation.title) {
                                    annotation.title.element.style.removeProperty("cursor");
                                    annotation.title.attr({'cursor': 'url("' + url + '"), default'});
                                }

                                $.each(drawingObj.dragSupporters, function (id, value) {
                                    value.element.style.setProperty('cursor', 'url("' + url + '"), default');
                                });
                                if(drawingObj.specificCursorChange){
                                    drawingObj.specificCursorChange(url);
                                }
                            }
                        }
                    }
                    if (hChart.selectedAnnotation) {
                        var selectedAnnotation = hChart.selectedAnnotation;
                        selectedAnnotation.events.deselect.call(selectedAnnotation, undefined, true);
                    }
                    break;
                case "delLevel" :
                    toolbarParent = $(infChart.structureManager.getContainer($(document).find("div[id='" + uniqueId + "']")[0], "drawingToolbar"));
                    var toolbarItems = toolbarParent.find("a[inf-ctrl=drawCat]");
                    var mainSelectItem = $(toolbarItems).filter('[draw-cat="delete"]');
                    if(hChart.annotationChangeInProgress) {
                        events.annotationEnd(hChart);
                    }
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
                    if (_isMultipleDrawingsEnabled(uniqueId)) {
                        _toggleMultipleDrawings(uniqueId);
                    }
                    _setActiveDrawingToolOptions(uniqueId, toolbarParent, true);
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }
                    var deleteToolBarElement = $(toolbarParent.find('a[inf-ctrl="drawCat"][draw-cat="delete"]'));
                    deleteToolBarElement.addClass('active');
                    var options = toolbarParent.find("a[inf-ctrl=delDrawing]");
                    var deleteLevelsOption = $(options).filter('[inf-ctrl-subType="deleteLevels"]');
                    for (let [key, option] of Object.entries(options)) {
                        $(option).removeClass('active');
                    }
                    $(deleteLevelsOption).addClass('active');
                    $(mainSelectItem).addClass('active');
                    $(mainSelectItem).html($(deleteLevelsOption).find('span[rel="icon-span"]')[0].outerHTML);
                    $(mainSelectItem).attr('inf-ctrl-role','delLevel');
                    _setIsActiveDrawing(false);
                    _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), true);
                    _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), false);
                    _removeDrawingEvents(hChart);
                    if (hChart.annotations) {
                        annotations = hChart.annotations.allItems;
                        for (var i = 0, length = annotations.length; i < length; i++) {
                            annotation = annotations[i];
                            drawingObj = _getDrawingObject(uniqueId, annotation.options.id);

                            if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                                var catConfig = drawingConfigs[uniqueId][deleteToolBarElement.attr('draw-cat')];
                                var url = catConfig.options[1].cursorUrl ? catConfig.options[1].cursorUrl : '../img/del-levels.png';
                                if (annotation.shape) {
                                    annotation.shape.element.style.removeProperty("cursor");
                                    annotation.shape.css({ 'cursor': 'url("' + url + '"), default' });
                                } else if (annotation.title) {
                                    annotation.title.element.style.removeProperty("cursor");
                                    annotation.title.attr({ 'cursor': 'url("' + url + '"), default' });
                                }

                                $.each(drawingObj.dragSupporters, function (id, value) {
                                    value.element.style.setProperty('cursor', 'url("' + url + '"), default');
                                });
                                if(drawingObj.specificCursorChange){
                                    drawingObj.specificCursorChange(url);
                                }
                            }
                        }
                    }
                    if (hChart.selectedAnnotation) {
                        var selectedAnnotation = hChart.selectedAnnotation;
                        selectedAnnotation.events.deselect.call(selectedAnnotation, undefined, true);
                    }
                    break;
                case "deleteAllDrawing" :
                    if(hChart.annotationChangeInProgress) {
                        events.annotationEnd(hChart);
                    }
                    _removeAllDrawings(_getChartIdFromHighchartInstance(hChart.annotations.chart), true);
                    iChart.isGloballyLocked = false;
                    break;
                case "globalLock":
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
                    _setActiveDrawingToolOptions(uniqueId, parent);
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }

                    if (iChart) {
                        iChart.isGloballyLocked = !iChart.isGloballyLocked;

                        infChart.drawingUtils.common.globalLockToggle(cat, iChart.isGloballyLocked)
                    };
                    iChart._onPropertyChange("isGloballyLocked", iChart.isGloballyLocked);
                    break;
                case "multipleDrawing":
                    infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
                    var activeEle = $(this).parents("ul").find("a.active[inf-ctrl='drawCat']").not('a[inf-ctrl-role="multipleDrawing"]');
                    role = activeEle.attr("inf-ctrl-role");
                    var enabled = _isMultipleDrawingsEnabled(uniqueId);
                    if (enabled) {
                        _toggleMultipleDrawings(uniqueId);
                        $(cat).removeClass('active');
                        // _disableDrawing(uniqueId);
                    } else {
                        if (role === 'drawing') {
                            _toggleMultipleDrawings(uniqueId);
                            $(cat).addClass('active');

                            shape = activeEle.attr("inf-ctrl-shape");
                            subType = activeEle.attr("inf-ctrl-subType");
                            _initializeDrawing(hChart, shape, drawingSettingsContainer, quickDrawingSettingsContainer, subType, true);
                        } else {
                            _setIsActiveDrawing(false);
                            isActiveEraseMode[uniqueId] = false;
                            isActiveDeleteTool[uniqueId] = false;
                            _deselectDeleteTool(hChart);
                            _setActiveDrawingToolOptions(uniqueId, parent);
                            _toggleMultipleDrawings(uniqueId);
                            $(cat).addClass('active');
                        }
                    }
                    if (hChart.selectedAnnotation) {
                        hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
                    }
                    break;
                case "favorite" : {
                    var favoriteMenu = $(infChart.structureManager.getContainer($(container)[0], "favoriteMenuPanel"));
                    _toggleFavorite(favoriteMenu, uniqueId);
                }
               break;
            }
        }
    }

    var _setDeleteMode = function (chartId) {
        var iChart = infChart.manager.getChart(chartId);
        var hChart = iChart && iChart.chart;
        var toolbarParent = $(infChart.structureManager.getContainer($(document).find("div[id='" + chartId + "']")[0], "drawingToolbar"));
        var toolbarItems = toolbarParent.find("a[inf-ctrl=drawCat]");
        var mainSelectItem = $(toolbarItems).filter('[draw-cat="delete"]');
        infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
        if (_isMultipleDrawingsEnabled(chartId)) {
            _toggleMultipleDrawings(chartId);
        }
        _setActiveDrawingToolOptions(chartId, toolbarParent, true );
        if (hChart.selectedAnnotation) {
            hChart.selectedAnnotation.events.deselect.call(hChart.selectedAnnotation, event, true);
        }
        var deleteToolBarElement = $(toolbarParent.find('a[inf-ctrl="drawCat"][draw-cat="delete"]'));
        deleteToolBarElement.addClass('active');
        var options = toolbarParent.find("a[inf-ctrl=delDrawing]");
        var deleteLevelsOption = $(options).filter('[inf-ctrl-subType="deleteLevels"]');
        for (let [key, option] of Object.entries(options)) {
            $(option).removeClass('active');
        }
        $(deleteLevelsOption).addClass('active');
        $(mainSelectItem).addClass('active');
        $(mainSelectItem).html($(deleteLevelsOption).find('span[rel="icon-span"]')[0].outerHTML);
        $(mainSelectItem).attr('inf-ctrl-role','delLevel');
        _setIsActiveDrawing(false);
        _removeDrawingEvents(hChart);
        _setIsActiveDeleteTool(_getChartIdFromHighchartInstance(hChart), false);
        _setIsActiveEraseMode(_getChartIdFromHighchartInstance(hChart), true);
        if (hChart.annotations) {
            annotations = hChart.annotations.allItems;
            for (var i = 0, length = annotations.length; i < length; i++) {
                annotation = annotations[i];
                drawingObj = _getDrawingObject(chartId, annotation.options.id);

                if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                    var catConfig = drawingConfigs[chartId][deleteToolBarElement.attr('draw-cat')];
                    var url = catConfig.options[1] && catConfig.options[1].cursorUrl ? catConfig.options[1].cursorUrl : '../img/del-levels.png';
                    if (annotation.shape) {
                        annotation.shape.element.style.removeProperty("cursor");
                        annotation.shape.css({ 'cursor': 'url("' + url + '"), default' });
                    } else if (annotation.title) {
                        annotation.title.element.style.removeProperty("cursor");
                        annotation.title.attr({ 'cursor': 'url("' + url + '"), default' });
                    }

                    $.each(drawingObj.dragSupporters, function (id, value) {
                        value.element.style.setProperty('cursor', 'url("' + url + '"), default');
                    });
                    if(drawingObj.specificCursorChange){
                        drawingObj.specificCursorChange(url);
                    }
                }
            }
        }
        if (hChart.selectedAnnotation) {
            var selectedAnnotation = hChart.selectedAnnotation;
            selectedAnnotation.events.deselect.call(selectedAnnotation, undefined, true);
        }
    };

    var _offDeleteMode = function(chartId){
        var iChart = infChart.manager.getChart(chartId);
        var hChart = iChart && iChart.chart;
        var toolbarParent = $(infChart.structureManager.getContainer($(document).find("div[id='" + chartId + "']")[0], "drawingToolbar"));
        if (_isMultipleDrawingsEnabled(chartId)) {
            _toggleMultipleDrawings(chartId);
        }
        isActiveEraseMode[chartId] = false;
        _setActiveDrawingToolOptions(chartId, toolbarParent, true);
        toolbarParent.find("a[draw-cat='select']").addClass('active');
        _setIsActiveDrawing(false);
        _removeDrawingEvents(hChart);
        _deselectDeleteTool(hChart);
    };

    var _setDeleteCursor = function (drawingConfigs) {
        if (drawingConfigs["delete"] && drawingConfigs["delete"].options[0] && !drawingConfigs["delete"].options[0].cursorUrl) {
            drawingConfigs["delete"].options[0].cursorUrl = '../img/del_cursor.png'
        }
    };

    var _setEraseModeCursor = function (drawingConfigs) {
        if (drawingConfigs["delete"] && drawingConfigs["delete"].options[1] && !drawingConfigs["delete"].options[1].cursorUrl) {
            drawingConfigs["delete"].options[1].cursorUrl = '../img/del-levels.png'
        }
    };

    /**
     * set drawing toolbar - add click event
     * @param {object} parent - parent element
     * @param {string} uniqueId - chart id
     * @param {object} config - drawing toolbar toggle button config
     * @param {boolean} showDrawingTbButtons - show/hide drawing toolbar buttons
     */
    var _setDrawingToolBarToggle = function (parent, uniqueId, config, showDrawingTbButtons) {
        _setDrawingToolbarProperties(uniqueId, showDrawingTbButtons);
        if (!showDrawingTbButtons) {
            $(parent).addClass('hide-toolbar');
            $(parent).find("button[inf-ctrl='tb-drawing-toggle']").find("i").removeClass().addClass(config.hideCls);
        }
        parent.find("button[inf-ctrl='tb-drawing-toggle']").bind("click", function (event) {
            var isShowDrawingToolbar = _toggleDrawingToolbar(parent, uniqueId, true);
            $(this).find('i').removeClass().addClass(isShowDrawingToolbar ? config.showCls : config.hideCls);
            event.preventDefault();
        });
    };

    /**
     * set scroll to drawing toolbar and bind click event
     * @param {object} container - container element
     */
    var _setDrawingToolbarScrollButtons = function (container) {
        var drawingTBNav = container.find('ul[inf-pnl="tb-drawing-nav"]');
        var scrollTopBtn = container.find('[inf-ctrl="tb-drawing-scroll-top"]');
        var scrollBottomBtn = container.find('[inf-ctrl="tb-drawing-scroll-bottom"]');

        $(scrollTopBtn).bind('click', function (event) {
            $(drawingTBNav).animate({scrollTop: 0}, 'slow');
            $(scrollBottomBtn).show();
            $(this).hide();
            event.preventDefault();
        });

        $(scrollBottomBtn).bind('click', function (event) {
            $(drawingTBNav).animate({scrollTop: $(drawingTBNav)[0].scrollHeight}, 'slow');
            $(scrollTopBtn).show();
            $(this).hide();
            event.preventDefault();
        });
    };

    /**
     * scroll left toolbar event
     * @param {object} navContainer - left toolbar button container
     * @param {object} scrollTopBtn  - scroll top button
     * @param {object} scrollBottomBtn - scroll bottom button
     */
    var _scrollDrawingToolbar = function (navContainer, scrollTopBtn, scrollBottomBtn) {
        var scrollPos = navContainer.scrollTop;

        if (scrollPos === 0) {
            $(scrollTopBtn).hide();
            $(scrollBottomBtn).show();
        } else if (navContainer.scrollHeight - scrollPos === navContainer.clientHeight) {
            $(scrollTopBtn).show();
            $(scrollBottomBtn).hide();
        } else {
            $(scrollTopBtn).show();
            $(scrollBottomBtn).show();
        }
    };

    /**
     * show and hide left toolbar
     * @param {object} container - container that need to update
     * @param {string} uniqueId - chart id
     * @param {boolean} isPropertyChange - is property change
     * @returns {boolean} show/hide left toolbar
     */
    var _toggleDrawingToolbar = function (container, uniqueId, isPropertyChange) {
        var chart = infChart.manager.getChart(uniqueId);
        var showDrawingToolbarButtons = !_getDrawingToolbarProperties(uniqueId);
        _setDrawingToolbarProperties(uniqueId, showDrawingToolbarButtons);
        $(container).toggleClass('hide-toolbar', !showDrawingToolbarButtons);
        if (isPropertyChange) {
            chart._onPropertyChange('showDrawingToolbarButtons', showDrawingToolbarButtons);
            chart.resizeChart();
        }
        return showDrawingToolbarButtons;
    };

    /**
     * rearrange drawing toolbar
     * @param {object} container - left toolbar
     */
    var _rearrangeDrawingToolbar = function (container) {
        var chartHeight = $(container).height();
        var drawingTbNav = container.querySelector('[inf-pnl="tb-drawing-nav"]');
        var scrollTopBtn = container.querySelector('[inf-ctrl="tb-drawing-scroll-top"]');
        var scrollBottomBtn = container.querySelector('[inf-ctrl="tb-drawing-scroll-bottom"]');
        $(drawingTbNav).unbind('scroll');

        if(drawingTbNav){
            if (drawingTbNav.scrollHeight <= chartHeight) {
                $(drawingTbNav).css('height', '');
                $(scrollTopBtn).hide();
                $(scrollBottomBtn).hide();
            } else {
                $(drawingTbNav).height(chartHeight);
                _scrollDrawingToolbar(drawingTbNav, scrollTopBtn, scrollBottomBtn);
                $(drawingTbNav).bind('scroll', function (event) {
                    _scrollDrawingToolbar(event.target, scrollTopBtn, scrollBottomBtn);
                });
            }
        }
    };

    var _afterRedrawXAxisWithoutSetExtremes = function (chartId) {
        var drawings = chartDrawingObjects[chartId];
        if (drawings) {
            $.each(drawings, function (key, drawing) {
                if (drawing.annotation.chart && drawing.afterRedrawXAxisWithoutSetExtremes) {
                    drawing.afterRedrawXAxisWithoutSetExtremes();
                }
            });
        }
    };

    /**
     * open drawing settings window/popup
     * @param {object} drawingObj - drawing object
     * @param {boolean} isHide - true if hide
     * @param {object} popupPosition - position object
     */
    var _openSettings = function (drawingObj, isHide, popupPosition) {
        drawingObj.openDrawingSettings.call(drawingObj, isHide, {
            "isDisableDrawingSettingsPanel": _isDisableDrawingSettingsPanel,
            "popupPosition": popupPosition
        });
    };


    var _toggleSettings = function (drawingObj, isHide, popupPosition) {
        if (drawingObj.settingsPopup) {
            drawingObj.settingsPopup.remove();
            drawingObj.settingsPopup = null;
        }
        if (!drawingObj.isQuickSetting) {
            if (!drawingObj.disableQuickSettingPanel) {
                drawingObj.loadQuickSettingPopup.call(drawingObj);
            }
        } else {
            drawingObj.openDrawingSettings.call(drawingObj, isHide, {
                "isDisableDrawingSettingsPanel": _isDisableDrawingSettingsPanel,
                "popupPosition": popupPosition
            });
        }
    };

    /**
     * load drawing object setting window/popup
     * @param {object} drawingObj - draiwng object
     */
    var _loadSettings = function (drawingObj) {
        drawingObj.loadSettingWindow(true, {"isDisableDrawingSettingsPanel": _isDisableDrawingSettingsPanel});
    };

    var _loadQuickSettings = function (drawingObj) {
        if (!drawingObj.disableQuickSettingPanel) {
            drawingObj.loadQuickSettingPopup(drawingObj.annotation.options.isLocked);
        }
    };

    //region public

    var _changeGlobalLockStatus = function (chart) {
        var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
        var chartInstance = infChart.manager.getChart(stockChartId);
        if (chartInstance.isGloballyLocked) {
            chartInstance.isGloballyLocked = !chartInstance.isGloballyLocked

            if (chartInstance.container){
                var leftPanel = $(chartInstance.container).find('div[inf-pnl=tb-drawing-nav-container]');
                if (leftPanel){
                    var globalLockTool =leftPanel.find('a[inf-ctrl-role=globalLock]')
                    if (globalLockTool){
                        globalLockTool.removeClass('active')
                    }
                }
            }
        }
    };

    var _initializeDrawing = function (chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer, subType, isPropertyChange) {
        isActiveDrawing = true;
        isActiveDrawingInprogress = true;
        _deselectDeleteTool(chartObj);

        var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chartObj);
        var chartInstance = infChart.manager.getChart(stockChartId);
        if (chartInstance.isGloballyLocked){
            chartInstance.isGloballyLocked = !chartInstance.isGloballyLocked
        }

        events.bindEvents(chartObj, shapeId, drawingSettingsContainer, quickDrawingSettingsContainer, subType, isPropertyChange);
    };

    var _getActiveDrawing = function () {
        return activeDrawing;
    };

    var _setActiveDrawing = function (drawing) {
        activeDrawing = drawing;
    };

    var _removeActiveDrawing = function (isPropertyChange) {
        if (activeDrawing) {
            var drawingId = activeDrawing.options.id,
                stockChartId = _getChartIdFromHighchartInstance(activeDrawing.chart);
            _removeDrawing(stockChartId, drawingId, undefined, isPropertyChange);
        }
    };

    /**
     * set active drawing settings / show or activate the tab
     * @param {object} drawingObject - drawing object
     * @param {object} popupPosition - popup position
     */
    var _setActiveDrawingSettings = function (drawingObject, popupPosition) {
        activeDrawingSettings = drawingObject.settingsPopup;
        if (!_isDisableDrawingSettingsPanel) {
            drawingObject.stockChart.showRightPanelWithTab((drawingObject.stockChartId + "_" + "drawingToolPanelView"));
            if (!drawingObject.settingsPopup.find('div.panel-collapse').is(":visible")) {
                drawingObject.settingsPopup.find('div.panel-heading a').trigger('click');
            }
        } else {
            infChart.structureManager.settings.hideAllSettingsPopups(_isDisableDrawingSettingsPanel);
            infChart.structureManager.settings.setPopupPositionAndHeight(drawingObject.container, drawingObject.settingsPopup, popupPosition);
            $(drawingObject.settingsPopup).show();
        }

    };

    var _setActiveDrawingToolOptions = function (uniqueId, parent, isSetDeleteModeOn, isDeleteMode) {
        var chartInstance = infChart.manager.getChart(uniqueId);
        parent.find("a[inf-ctrl=drawCat]").removeClass('active');
        let element = parent.find('a[inf-ctrl-role="globalLock"]')
        infChart.drawingUtils.common.globalLockToggle(element, false);

        if (_isMultipleDrawingsEnabled(uniqueId)) {
            parent.find('a[inf-ctrl-role="multipleDrawing"]').addClass('active');
        }

        if (chartInstance.isGloballyLocked && (isDeleteMode || isSetDeleteModeOn) ) {
            let element = parent.find('a[inf-ctrl-role="globalLock"]')
            infChart.drawingUtils.common.globalLockToggle(element, true);
        }

        if (_isFavoriteEnabled(uniqueId)) {
            parent.find('a[inf-ctrl-role="favorite"]').addClass('active');
        }
        _deselectFavDrawingTool(uniqueId);
    };

    var _deselectFavDrawingTool = function (uniqueId) {
        var containerElem = $('#' + uniqueId);
        var parentElement = $(infChart.structureManager.getContainer(containerElem[0], "favoriteMenuPanel"));
        parentElement.find("a[inf-ctrl=drawCat]").removeClass('active');
    };

    var _removeAllDrawings = function (chartId, isPropertyChange) {
        var drawings = chartDrawingObjects[chartId];
        var chartRedrawRequired = false;
        var stockChart = infChart.manager.getChart(chartId);
        if (drawings) {
            $.each(drawings, function (drawingId) {
                var redrawStatus = _removeDrawingInner(chartId, drawingId, isPropertyChange);
                if (!chartRedrawRequired) {
                    chartRedrawRequired = redrawStatus;
                }
            });
            if (chartRedrawRequired) {
                stockChart.redrawChart();
            }
        }
        if(!infChart.drawingsManager.isDrawnDrawingsAvailable(chartId) && _getIsActiveEraseMode(chartId)){
            _setIsActiveEraseMode(chartId, false);
            _setSelectToolbarIconOnReset(chartId);
        }
    };

    var _positionElliotWaveDrawingLabels = function (chartId, updateValues) {
        var drawings = chartDrawingObjects[chartId];
        var pointValues = [];
        if (drawings) {
            $.each(drawings, function (drawingId, drawing) {
                if (drawing.shape == 'elliotTriangleWave' || drawing.shape == 'elliotImpulseWave' || drawing.shape == 'elliotCorrectiveWave' || drawing.shape == 'correctiveTripleWave' || drawing.shape == 'elliotCorrectiveDoubleWave') {
                    var elliotDrawing = drawing;
                    var lineShapes = drawing.getPatternShapes(updateValues);
                    infChart.util.forEach(lineShapes.positions.pointLabels, function (positionId, position) {
                        var count = 0;
                        infChart.util.forEach(pointValues, function (index, point) {
                            if (point.xValue == position.xValue && point.yValue == position.yValue && point.topOfThePoint == position.topOfThePoint) {
                                count = count + 1;
                            }
                        })
                        if (elliotDrawing.additionalDrawings.labels[positionId + "Label"]) {
                            elliotDrawing.additionalDrawings.labels[positionId + "Label"].attr({
                                y: (position.topOfThePoint) ? position.y - 14 * count : position.y + 14 * count
                            });
                        }
                        if (elliotDrawing.additionalDrawings.labels[positionId + "Label"] && elliotDrawing.additionalDrawings.labels[positionId + "Label"].visibility != "hidden") {
                            pointValues.push({
                                xValue: position.xValue,
                                yValue: position.yValue,
                                topOfThePoint: position.topOfThePoint
                            });
                        }
                    })
                }
            });
        }
    };

    var _removeDrawing = function (chartId, drawingId, setExtremes, isPropertyChange) {
        var drawings = chartDrawingObjects[chartId];
        var stockChart = infChart.manager.getChart(chartId);
        if (drawings && drawings[drawingId]) {
            var drawingObj = drawings[drawingId], ann = drawingObj.annotation, chart = ann.chart,
                annOptions = ann.options,
                isTabSwitchRequired = annOptions.drawingType === infChart.constants.drawingTypes.shape,
                isSetExtremesRequired = _validateExtremes(annOptions);
            if (chart.activeAnnotation === ann) {
                chart.activeAnnotation = null;
                chart.annotationChangeInProgress = false;
                chart.annotations.allowZoom = true;
                _setActiveAnnotationInprogress(null);
                stockChart.onAnnotationRelease();
            }
            if (chart.selectedAnnotation === ann) {
                drawingObj.annotation.events.deselect.call(drawingObj.annotation);
            }

            var drawingProperties = _getDrawingProperties(ann);
            _deleteDrawingObject(chartId, drawingId);
            if (isPropertyChange) {
                drawingObj.onPropertyChange("drawings");
            }
            var chartRedrawRequired = drawingObj.destroy(isPropertyChange, drawingProperties);

            if (isSetExtremesRequired && (typeof setExtremes === 'undefined' || setExtremes === true)) {
                // _setExtremes(chartId);
                _setExtremesOnRemove(chartId, drawingId);
            } else {
                var yAxis = stockChart && stockChart.getMainYAxis();
                if (yAxis.infMaxAnnotation === drawingId) {
                    yAxis.infMaxAnnotation = null;
                }
                if (yAxis.infMinAnnotation === drawingId) {
                    yAxis.infMinAnnotation = null;
                }
                // redraw chart if plot area is adjusted according to the deleted drawing
                if (chartRedrawRequired) {
                    stockChart.redrawChart();
                }

            }
            if (isTabSwitchRequired) {
                _switchSettingsTab(chartId);
            }
        }
        if(!infChart.drawingsManager.isDrawnDrawingsAvailable(chartId)){
            _setIsActiveEraseMode(chartId, false);
            _setSelectToolbarIconOnReset(chartId);
        }
    };

    var _updateIsGloballyLockInDelete = function(chartId){
        var drawings = chartDrawingObjects[chartId];
        var stockChart = infChart.manager.getChart(chartId);
        if (drawings && Object.keys(drawings).length === 0) {
            stockChart.isGloballyLocked = false;
        }
        stockChart._onPropertyChange("isGloballyLocked", stockChart.isGloballyLocked);
    };

    var _closeActiveDrawingSettings = function () {
        if (activeDrawingSettings) {
            //activeDrawingSettings.hide();
            //activeDrawingSettings.removeClass('active');

            //if(activeDrawingSettings.find('div[drawing-collapsible-panel]').is(":visible")) {
            //    activeDrawingSettings.find('div.panel-heading a').trigger('click');
            //}
        }
    };

    var _removeDrawingEvents = function (chartObj) {
        events.unbindEvents(chartObj);
    };

    var _deselectDeleteTool = function (chart) {
        var annotations, annotation, drawingObj, stockChartId;
        var chartId = _getChartIdFromHighchartInstance(chart)
        isActiveDeleteTool[chartId] = false;
        isActiveEraseMode[chartId] = false;


        if (chart.annotations) {
            annotations = chart.annotations.allItems;

            for (var i = 0, length = annotations.length; i < length; i++) {
                annotation = annotations[i];
                stockChartId = _getChartIdFromHighchartInstance(annotation.chart);
                drawingObj = _getDrawingObject(stockChartId, annotation.options.id);

                if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                    if (annotation.shape) {
                        annotation.shape.element.style.removeProperty("cursor");
                        infChart.util.setCursor(annotation.shape, 'move');
                        //annotation.shape.css({'cursor': 'move'});
                    } else if (annotation.title) {
                        annotation.title.element.style.removeProperty("cursor");
                        annotation.title.attr({'cursor': 'move'});
                        // infChart.util.setCursor(annotation.title.css, 'move');
                        //annotation.title.css({'cursor': 'move'});
                    }

                    $.each(drawingObj.dragSupporters, function (id, value) {
                        value.element.style.removeProperty("cursor");
                        infChart.util.setCursor(value, 'move');
                        //value.css({'cursor': 'move'});
                    });
                    if(drawingObj.specificCursorChange){
                        drawingObj.specificCursorChange();
                    }
                }
            }
        }
    };

    var _getDrawingObject = function (chartId, drawingId) {
        return chartDrawingObjects[chartId] && chartDrawingObjects[chartId][drawingId];
    };

    var _getAllDrawings = function (chartId) {
        return chartDrawingObjects[chartId];
    };

    var _getIsActiveDrawing = function () {
        return isActiveDrawing;
    };

    var _getIsActiveDrawingInprogress = function () {
        return isActiveDrawingInprogress;
    };

    var _setIsActiveDrawing = function (isActiveDraw) {
        isActiveDrawing = isActiveDraw;
    };

    var _getIsActiveDeleteTool = function (chartId) {
        return isActiveDeleteTool[chartId];
    };

    var _setIsActiveDeleteTool = function (chartId, isActDelTool) {
        isActiveDeleteTool[chartId] = isActDelTool;
    };

    var _getIsActiveEraseMode = function (chartId) {
        return isActiveEraseMode[chartId];
    };

    var _setIsActiveEraseMode = function (chartId, isActEraseTool) {
        isActiveEraseMode[chartId] = isActEraseTool;
    };

    var _isMultipleDrawingsEnabled = function (chartId) {
        return _multipleDrawingsEnabledProperties[chartId];
    };

    var _toggleMultipleDrawings = function (chartId) {
        _multipleDrawingsEnabledProperties[chartId] = !_multipleDrawingsEnabledProperties[chartId];
        if (_multipleDrawingsEnabledProperties[chartId]) {
            _addChartAreaKeyDownListener(chartId, ESC_KEY, function (key) {
                _multipleDrawingsEnabledProperties[chartId] = false;
                _removeChartAreaKeyDownListener(chartId, ESC_KEY);
                _disableDrawing(chartId);
            });
        } else {
            _removeChartAreaKeyDownListener(chartId, ESC_KEY);
        }
        return _multipleDrawingsEnabledProperties[chartId];
    };

    /**
     *
     * @param {*} chartId Unique ID for chart instance
     * @param {*} key key to add listener "*" will add listener to all keys
     * @param {*} listenerFunction callbank function
     */
    var _addChartAreaKeyDownListener = function (chartId, key, listenerFunction) {
        if (typeof listenerFunction !== 'function') {
            console.error("listenerFunction Should be a function");
        }
        var onKeyDown = function (event) {
            var chart = infChart.manager.getChart(chartId);
            if (!chart.chart.infMouseIn) {
                return;
            }
            var keyCode = event.which || event.keyCode;
            if (key === "*") {
                listenerFunction(keyCode);
            } else if (key === keyCode) {
                listenerFunction(keyCode);
            } else {
                console.info("Listener is not listening to Provided (" + key + ") user press on" + keyCode);
            }
        }
        $(document).on('keydown', onKeyDown);
        _chartAreaKeyDownFunctions[chartId + "_" + key] = onKeyDown;
    }


    /**
     * @param {*} chartId Unique ID for chart instance
     * @param {*} key key to add listener "*" will add listener to all keys
     */
    var _removeChartAreaKeyDownListener = function (chartId, key) {
        $(document).off('keydown', _chartAreaKeyDownFunctions[chartId + "_" + key]);
        delete _chartAreaKeyDownFunctions[chartId + "_" + key];
    }

    var _toggleFavorite = function (favoriteMenu, containerId) {
        var favElement = $(event.target);
        if (favElement.is("span")) {
            favElement = $(event.target).parent("a");
        }
        var chart = infChart.manager.getChart(containerId);
        if (chart.isFavoriteEnabled) {
            favoriteMenu.hide();
            favElement.removeClass('active');
        } else {
            favoriteMenu.show();
            favElement.addClass('active');
        }
        chart.isFavoriteEnabled = !chart.isFavoriteEnabled;
    };

    var _isFavoriteEnabled = function (containerId) {
        var chart = infChart.manager.getChart(containerId);
        return chart.isFavoriteEnabled;
    };

    var _getDrawingProperties = function (annotation) {
        var stockChartId = _getChartIdFromHighchartInstance(annotation.chart);
        var drawingObj = _getDrawingObject(stockChartId, annotation.options.id);
        var properties = drawingObj.getConfig() || {};
        properties.yValue = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.yValue);
        properties.yValueEnd = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.yValueEnd);
        properties.trendYValue = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.trendYValue);
        if (properties.intermediatePoints && properties.intermediatePoints.length) {
            var intermediatePoints = [];
            infChart.util.forEach(properties.intermediatePoints, function (index, value) {
                intermediatePoints.push({
                    xValue: value.xValue,
                    yValue: infChart.drawingUtils.common.getBaseYValues.call(drawingObj, value.yValue)
                });
            });
            properties["intermediatePoints"] = intermediatePoints;
        }
        return properties;
    };

    /**
     * update drawing object from given properties
     * @param {string} stockChartId chart id
     * @param drawingId
     * @param properties
     */
    var updateDrawingProperties = function (stockChartId, drawingId, properties) {
        var drawingObj = _getDrawingObject(stockChartId, drawingId);
        drawingObj.update(properties);
    };

    /**
     * Returns the properties to copy from the selected drawing
     * @param {object} annotation selected annotation
     * @returns {object} properties
     * @private
     */
    var _getDrawingPropertiesToCopy = function (annotation) {
        var stockChartId = _getChartIdFromHighchartInstance(annotation.chart);
        var chartInstance = infChart.manager.getChart(stockChartId);
        var drawingObj = _getDrawingObject(stockChartId, annotation.options.id);
        var properties = drawingObj.getConfigToCopy();

        properties.yValue = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.yValue);
        properties.yValueEnd = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.yValueEnd);
        properties.trendYValue = infChart.drawingUtils.common.getBaseYValues.call(drawingObj, properties.trendYValue);
        if (properties.intermediatePoints) {
            var intermediatePoints = [];
            infChart.util.forEach(properties.intermediatePoints, function (index, value) {
                intermediatePoints.push({
                    xValue: value.xValue,
                    yValue: infChart.drawingUtils.common.getBaseYValues.call(drawingObj, value.yValue)
                });
            });
            properties["intermediatePoints"] = intermediatePoints;
        }
        return properties;
    };

    var _getAllDrawingProperties = function (chartId, includeDrawingId) {
        var drawings = [];
        for (var drawingId in chartDrawingObjects[chartId]) {
            if (chartDrawingObjects[chartId].hasOwnProperty(drawingId)) {
                var drawing = chartDrawingObjects[chartId][drawingId], annotation = drawing.annotation;
                if (annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                    var properties = _getDrawingProperties(annotation);
                    if (includeDrawingId) {
                        properties.drawingId = drawingId;
                    }
                    drawings.push(properties);
                }
            }
        }
        return drawings;
    };

    /**
     * get drawing toolbar properties (show/hide)
     * @param {string} chartId - chart id
     * @returns {boolean} show/hide drawing toolbar
     */
    var _getDrawingToolbarProperties = function (chartId) {
        return drawingToolBarProperties[chartId];
    };

    /**
     * set drawnig toolbar properties
     * @param {string} chartId - chart id
     * @param {boolean} value - show/hide drawing toolbar
     */
    var _setDrawingToolbarProperties = function (chartId, value) {
        drawingToolBarProperties[chartId] = value;
    };

    /**
     *
     * @param {object} drawingObj of the drawing
     * @param {object} chartObj
     * @param {object} drawingSettingsContainer
     * @param {object} properties
     * @returns drawing
     */
    var _drawDrawingFromProperties = function (drawingObj, chartObj, drawingSettingsContainer, properties) {
        var drawingObj = _addAnnotation(drawingObj, chartObj, drawingObj.shape, properties, true);
        var chartInstance = infChart.manager.getChart(drawingObj.stockChartId);
        if (drawingObj.chartRedrawRequired) {
            // redraw chart when plot area needs to be adjusted acording to the added annotation
            chartInstance.redrawChart();
        } else {
            // scale drawing is executed through resize event
            drawingObj.scaleDrawing(true, true);
        }
        // set drawing settings if panel is open
        // var isHideSettingPanel = !_isDisableDrawingSettingsPanel ? !chartInstance.isRightPanelOpen() : true;
        // drawingObj.openDrawingSettings.call(drawingObj, isHideSettingPanel, {"isDisableDrawingSettingsPanel": _isDisableDrawingSettingsPanel});
        // drawingObj.showDrawingSettings.call(drawingObj, isHideSettingPanel, {"isDisableDrawingSettingsPanel": _isDisableDrawingSettingsPanel});
        drawingObj.annotation.events.deselect.call(drawingObj.annotation);
        // infChart.drawingUtils.common.onPropertyChange.call(drawingObj);
        return drawingObj;
    };

    /**
     * scale drawing
     * @param {string} chartId - chart unique id
     * @param {boolean} isCalculateNewValueForScale - is redraw from chart properties
     */
    var _scaleDrawings = function (chartId, isCalculateNewValueForScale) {
        if (scaleDrawingPausedCharts.indexOf(chartId) === -1) {
            _scaleDrawingsInner(chartId, isCalculateNewValueForScale);
        } else {
            if (scaleDrawingCalledWhenPaused.indexOf(chartId) === -1) {
                scaleDrawingCalledWhenPaused.push(chartId);
            }
        }
    };

    /**
     * scale the timestampMarker drawings in chart
     * @param {string} chartId
     */
    var _scaleDrawingOnChartTypeChange = function (chartId) {
        var drawings = chartDrawingObjects[chartId];

        if (drawings) {
            $.each(drawings, function (key, drawing) {
                switch (drawing.shape) {
                    case 'timestampMarker':
                        drawing.scale();
                        break;
                }
            });
        }
    };

    var _pauseScaleDrawings = function (chartId) {
        if (scaleDrawingPausedCharts.indexOf(chartId) === -1) {
            scaleDrawingPausedCharts.push(chartId);
        }
    };

    var _unPauseScaleDrawings = function (chartId) {
        var index = scaleDrawingPausedCharts.indexOf(chartId);
        if (index !== -1) {
            var pauseIndex = scaleDrawingCalledWhenPaused.indexOf(chartId);
            if (pauseIndex !== -1) {
                _scaleDrawingsInner(chartId);
                scaleDrawingCalledWhenPaused.splice(index, 1);
            }
            scaleDrawingPausedCharts.splice(index, 1);
        }
    };

    var _setActiveAnnotationInprogress = function (annotation) {
        activeAnnotationInprogress = annotation;
    };

    var _getActiveAnnotationInprogress = function () {
        return activeAnnotationInprogress;
    };

    /**
     * called when user grabs the drawing before dragging
     * @param annotation
     */
    var _onAnnotationStore = function (annotation) {
        var chartId = _getChartIdFromHighchartInstance(annotation.chart),
            drawing = _getDrawingObject(chartId, annotation.options.id);
        infChart.manager.onAnnotationStore(chartId, drawing);
    };

    /**
     * called when user releases the drawing after dragging
     * @param annotation
     */
    var _onAnnotationRelease = function (annotation) {
        var chartId = _getChartIdFromHighchartInstance(annotation.chart),
            drawing = _getDrawingObject(chartId, annotation.options.id);
        _setYExtremesOnAnnotationUpdate(chartId, annotation);
        infChart.manager.onAnnotationRelease(chartId, drawing);
    };

    /**
     * set y extremes when show orders on chart.
     * @param {string} chartId
     * @param {object} annotation
     */
    var _setYExtremesOnExternalChanges = function (chartId, annotation) {
        _setYExtremesOnAnnotationUpdate(chartId, annotation);
    };

    /**
     * create drawing toolbar (left toolbar) and bind events
     * @param {object} containerElem - container element
     * @param {string} containerId - chart container id
     * @param {Array} toolbarItems - left toolbar items array
     * @param {object} config - chart toolbar config
     * @param {boolean} display - show/hide left toolbar panel
     * @param {boolean} showDrawingTbButtons - show/hide drawing toolbar buttons
     * @param {boolean} isFavoriteToolBar - specify whether favorite tool bar or drawing tool bar
     * @param {boolean} subLevelToolTipEnabled - specify whether level II tool tip enabed
     */
    var _createDrawingToolbar = function (containerElem, containerId, toolbarItems, config, display, showDrawingTbButtons, isFavoriteToolBar, subLevelToolTipEnabled, isGloballyLocked) {
       var toolbarParent;
        if (isFavoriteToolBar) {
            toolbarParent = $(infChart.structureManager.getContainer(containerElem[0], "favoriteMenuPanel"));
            infChart.structureManager.drawingTools.getfavoriteToolBarHTML(toolbarParent, toolbarItems, config);
            infChart.structureManager.toolbar.bindFavoriteMenuEvents(containerElem, toolbarParent, containerId);
        } else {
            toolbarParent = $(infChart.structureManager.getContainer(containerElem[0], "drawingToolbar"));
            infChart.structureManager.drawingTools.getDrawingToolBarHTML(toolbarParent, toolbarItems, config, subLevelToolTipEnabled);
        }
        _setDrawingToolBarToggle(toolbarParent, containerId, config.leftTBToggleButton, showDrawingTbButtons);
        _setDrawingToolbarScrollButtons(toolbarParent);
        drawingConfigs[containerId] = {};
        infChart.util.forEach(toolbarItems, function (i, val) {
            switch (val) {
                case "select":
                    _setSelectOptions(containerElem[0], containerId, toolbarParent, config[val]);
                    drawingConfigs[containerId][val] = config[val];
                    break;
                case "delete":
                    _setDeleteOptions(containerElem, containerId, toolbarParent, config[val]);
                    drawingConfigs[containerId][val] = config[val];
                    break;
                default:
                    drawingConfigs[containerId][val] = config[val];
                    _setDrawing(containerElem, containerId, toolbarParent, config[val]);
                    _setDrawingCategory(containerElem, containerId, toolbarParent, config[val], isGloballyLocked);
                    _setFavoritePanelDrawing(containerElem, containerId, toolbarParent, config[val]);
                    _setDrawingFavoriteIcons(containerElem, containerId, config);
                    break;
            }
        });
        if (!display) {
            toolbarParent.hide();
        }
    };

    var _getDrawingConfigs = function (chartId) {
        var drawingConfig = drawingConfigs[chartId];
        _setDeleteCursor(drawingConfig);
        return drawingConfig;
    };

    var _getDrawingEraseModeConfigs = function (chartId) {
        var drawingConfig = drawingConfigs[chartId];
        _setEraseModeCursor(drawingConfig);
        return drawingConfig;
    };

    var _getDeleteCursor = function (chartId) {
        var drawingConfig = _getDrawingConfigs(chartId);
        var deleteCursor = drawingConfig && drawingConfig["delete"]  && drawingConfig["delete"].options[0] && drawingConfig["delete"].options[0].cursorUrl || "../img/del_cursor.png";
        return deleteCursor;
    };

    var _getEraseModeCursor = function (chartId) {
        var drawingConfig = _getDrawingEraseModeConfigs(chartId);
        var deleteCursor = drawingConfig && drawingConfig["delete"] && drawingConfig["delete"].options[1] && drawingConfig["delete"].options[1].cursorUrl || "../img/del-levels.png";
        return deleteCursor;
    };

    /**
     * Returns the maximum axis offset needed for the drawings in the chart
     * @param chartId
     * @param axis
     * @returns {number}
     * @private
     */
    var _getAxisLabelOffset = function (chartId, axis) {

        var drawings = chartDrawingObjects[chartId],
            axisLabelOffset = 0;

        if (drawings) {

            $.each(drawings, function (key, drawing) {
                if (drawing.annotation && drawing.annotation.chart) {
                    var offset;
                    if (drawing.getAxisOffset) {
                        offset = drawing.getAxisOffset(axis);
                    } else {
                        offset = 0;
                    }
                    if (offset) {
                        axisLabelOffset = Math.max(axisLabelOffset, offset);
                    }
                }
            });

        }

        return axisLabelOffset;
    };

    /**
     * get events to be bind in drawing object
     * @param {string} drawingId - drawing id
     * @param {string} chartId - chart id
     * @param {string} drawingType - drawing type
     * @returns {{click: Function, dblclick: Function, mousedown: Function, mouseup: Function, touchstart: Function, touchend: Function}}
     * @private
     */
    var _getDrawingEvents = function (drawingId, chartId, drawingType) {
        var drawingEvents = {
            click: function (event) {
                var ann = this,
                    annotationOptions = ann.options,
                    drawingId = annotationOptions.id,
                    stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, drawingId);

                if (!_isMultipleDrawingsEnabled(chartId) && !_getIsActiveDrawingInprogress() && !_getIsActiveDeleteTool(stockChartId) && !_getIsActiveEraseMode(stockChartId) && !ann.chart.isAnnotationSelected && !annotationOptions.isDisplayOnly) {
                    if (!_isDisableDrawingSettingsPanel) {
                        _openSettings(drawingObj, false);
                    }
                    if (drawingObj.select) {
                        drawingObj.select();
                    }
                    if (drawingObj.onClick) {
                        drawingObj.onClick(event);
                    }
                }
            },
            dblclick: function (event) {
                var ann = this,
                    annotationOptions = ann.options,
                    drawingId = annotationOptions.id,
                    stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, drawingId);

                if (!_isMultipleDrawingsEnabled(chartId) && !_getIsActiveDrawingInprogress() && !_getIsActiveDeleteTool(stockChartId) && !_getIsActiveEraseMode(stockChartId) && !ann.chart.isAnnotationSelected && !annotationOptions.isDisplayOnly) {
                    if (!_isDisableDrawingSettingsPanel) {
                        _openSettings(drawingObj, false);
                    }
                    if (drawingObj.select) {
                        drawingObj.select();
                    }
                    if (drawingObj.onDoubleClick) {
                        drawingObj.onDoubleClick(event);
                    }
                }

                if (drawingType === infChart.constants.drawingTypes.indicator && this.options.indicatorId) {
                    infChart.indicatorMgr.indicatorLegendClick(_getChartIdFromHighchartInstance(ann.chart), ann.chart.get(this.options.indicatorId).options.id);
                }
            },
            mousedown: function (e) {
                var ann = this,
                    annotationOptions = ann.options,
                    drawingId = annotationOptions.id,
                    stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, drawingId),
                    stockChart = infChart.manager.getChart(stockChartId),
                    isPropergateEvent = annotationOptions.isLocked || stockChart.isGloballyLocked;

                if (e.detail === 2 && drawingObj.onDoubleClick && !isActiveDrawingInprogress && !_getIsActiveDeleteTool(stockChartId) && !_getIsActiveEraseMode(stockChartId)){
                        drawingObj.onDoubleClick(e);
                }

                if (_getIsActiveDeleteTool(stockChartId) && e.which == 1) {
                    if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                        ann.chart.isAnnotationSelected = false;
                        _removeDrawing(stockChartId, drawingId, undefined, true);
                        _updateIsGloballyLockInDelete(stockChartId);
                    }
                } else if(_getIsActiveEraseMode(stockChartId) && e.which == 1){
                    var drawingType = e.target.getAttribute('type');
                    var selectedLevel = e.target.getAttribute('level');
                    if(!selectedLevel && e.target.parentNode && (drawingObj.shape ==  "fibVerRetracements" || drawingObj.shape ==  "fib2PointTimeProjection" || drawingObj.shape ==  "fib3PointTimeProjection")){
                        if (e.target.parentNode.getAttribute('level')) {
                            selectedLevel = e.target.parentNode.getAttribute('level');
                            drawingType = e.target.parentNode.getAttribute('type');
                        } else if (e.target.parentNode.parentNode && e.target.parentNode.parentNode.getAttribute('level')) {
                            selectedLevel = event.target.parentElement.parentElement.getAttribute('level');
                            drawingType = e.target.parentNode.parentNode.getAttribute('type');
                        }
                    }
                    if(drawingType == "additionalDrawing" && selectedLevel){
                        if (drawingObj.isVisibleLastLevel()) {
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                            _updateIsGloballyLockInDelete(stockChartId);
                        } else {
                            if(drawingObj.shape == "fibFans"){
                                drawingObj.onFibFansLevelChange(selectedLevel, false, true);
                            } else if (drawingObj.shape ==  "fibArcs"){
                                drawingObj.onFibArcsLevelChange(selectedLevel, false, true);
                            } else if (drawingObj.shape ==  "fibVerRetracements" || drawingObj.shape ==  "fib2PointTimeProjection" || drawingObj.shape ==  "fib3PointTimeProjection"){
                                drawingObj.eraseFibLevel(selectedLevel, false, true);
                            } else if (drawingObj.shape ==  "shortLine" || drawingObj.shape ==  "longLine"){
                                infChart.drawingUtils.common.settings.onApplyLine.call(drawingObj, false, selectedLevel, true);
                            } else if (drawingObj.shape == "andrewsPitchfork"){
                                drawingObj.onChangeFibLines(drawingObj.getFibLevelById(selectedLevel), 'enable', false, true);
                            } else {
                                infChart.drawingUtils.common.settings.onFibLevelChange.call(drawingObj, selectedLevel, false, true, true);
                            }
                        }
                    } else if(drawingType == "fibLevelDrawing"){
                        var subType = e.target.getAttribute('subType');
                        if (drawingObj.isVisibleLastLevel()) {
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                            _updateIsGloballyLockInDelete(stockChartId);
                        } else {
                            drawingObj.onFibLevelChange(selectedLevel, false, subType, true);
                        }
                    } else {
                        if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                            ann.chart.isAnnotationSelected = false;
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                            _updateIsGloballyLockInDelete(stockChartId);
                        }
                    }
                } else {
                    if (!_getIsActiveDrawing()) {
                        // ann.events.deselect.call(ann, e);
                        //infChart.drawingsManager.closeActiveDrawingSettings();
                    }

                    if (drawingObj && ann.options.drawingType === infChart.constants.drawingTypes.shape) {
                        _unbindKeyDown(stockChartId);
                    }

                    if (!isPropergateEvent && drawingObj && ann.chart.isAnnotationSelected) {
                        e.stopPropagation();
                    }

                }
            },
            mouseup: function (e) {
                var ann = this, annotationOptions = ann.options;
                var stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, annotationOptions.id);

                if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                    _bindKeyDown(ann);
                }

                if (!_getIsActiveDeleteTool(stockChartId) && !_getIsActiveEraseMode(stockChartId) && ann.chart.isAnnotationSelected) {
                    if (!annotationOptions.isDisplayOnly && ann.chart.selectedAnnotation === ann) {
                        drawingObj.selectAndBindResize();
                        ann.chart.selectedAnnotation = ann;
                        // drawingObj.openDrawingSettings.call(drawingObj);
                        if (e.detail !== 2 && !ann.chart.isContextMenuOpen){
                                drawingObj.showQuickDrawingSettings.call(drawingObj);
                        }
                    }

                    ann.chart.isAnnotationSelected = false;
                    _disableDrawing(stockChartId);
                }

                if(!_getIsActiveDeleteTool(stockChartId) && !_getIsActiveEraseMode(stockChartId) && !_getIsActiveDrawingInprogress() && drawingObj.initialSettingPanelLoad){
                    drawingObj.openSettingPanel();
                    drawingObj.initialSettingPanelLoad = false;
                }
            },
            touchstart: function (e) {
                var ann = this,
                    annotationOptions = ann.options,
                    drawingId = annotationOptions.id,
                    stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, drawingId);

                if (_getIsActiveDeleteTool(stockChartId)) {
                    if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                        ann.chart.isAnnotationSelected = false;
                        _removeDrawing(stockChartId, drawingId, undefined, true);
                    }
                } else if(_getIsActiveEraseMode(stockChartId)) {
                    var drawingType = e.target.getAttribute('type');
                    var selectedLevel = e.target.getAttribute('level');
                    if(drawingType == "additionalDrawing" && selectedLevel){
                        if (drawingObj.isVisibleLastLevel()) {
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                        } else {
                            infChart.drawingUtils.common.settings.onFibLevelChange.call(drawingObj, selectedLevel, false, true, true);
                        }
                    } else if(drawingType == "fibLevelDrawing"){
                        var subType = e.target.getAttribute('subType');
                        if (drawingObj.isVisibleLastLevel()) {
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                        } else {
                            drawingObj.onFibLevelChange(selectedLevel, false, subType, true);
                        }
                    } else {
                        if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                            ann.chart.isAnnotationSelected = false;
                            _removeDrawing(stockChartId, drawingId, undefined, true);
                        }
                    }
                } else {
                    if (!_getIsActiveDrawing()) {
                        // ann.events.deselect.call(ann, e);
                        //infChart.drawingsManager.closeActiveDrawingSettings();
                    }

                    if (drawingObj && ann.options.drawingType === infChart.constants.drawingTypes.shape) {
                        _unbindKeyDown(stockChartId);
                    }

                    if (drawingObj && ann.chart.isAnnotationSelected) {
                        e.stopPropagation();
                    }
                }
            },
            touchend: function () {
                var ann = this, annotationOptions = ann.options;
                var stockChartId = _getChartIdFromHighchartInstance(ann.chart),
                    drawingObj = _getDrawingObject(stockChartId, annotationOptions.id);

                if (drawingObj && annotationOptions.drawingType === infChart.constants.drawingTypes.shape) {
                    _bindKeyDown(ann);
                }

                if (ann.chart.isAnnotationSelected) {
                    if (!annotationOptions.isDisplayOnly) {
                        drawingObj.selectAndBindResize();
                        ann.chart.selectedAnnotation = ann;
                        // drawingObj.openDrawingSettings.call(drawingObj);
                    }

                    ann.chart.isAnnotationSelected = false;
                    _disableDrawing(stockChartId);
                }
            }
        };
        if (infChart.contextMenuManager && infChart.contextMenuManager.isContextMenuEnabled(chartId) && (drawingType === infChart.constants.drawingTypes.shape || drawingType === infChart.constants.drawingTypes.indicator)) {
            drawingEvents.contextmenu = function (event) {
                if (!_isMultipleDrawingsEnabled(chartId)) {
                    if (drawingType === infChart.constants.drawingTypes.shape)  {
                        var ann = this;
                        if (ann.chart.selectedAnnotation) {
                            ann.chart.selectedAnnotation.events.deselect.call(ann.chart.selectedAnnotation, event, true);
                        }
                        var chartId = _getChartIdFromHighchartInstance(ann.chart);
                        var drawingId = ann.options.id;
                        var drawingObj = _getDrawingObject(chartId, drawingId);
                        if (!ann.options.isDisplayOnly) {
                            drawingObj.selectAndBindResize();
                            ann.chart.selectedAnnotation = ann;
                            drawingObj.showQuickDrawingSettings.call(drawingObj);
                        }
                        infChart.contextMenuManager.openContextMenu(chartId, {
                            top: event.clientY,
                            left: event.clientX
                        }, infChart.constants.contextMenuTypes.drawing, {drawingId: ann.options.id}, event);
                    } else if (drawingType === infChart.constants.drawingTypes.indicator && this.options.indicatorId) {
                        infChart.indicatorMgr.openContextMenu(this.chart.renderTo.id, event, this.chart.get(this.options.indicatorId));
                    }

                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }
        return drawingEvents;
    };

    //endregion

    /**
     * update saved drawing options
     * @param {string} chartId - chart id
     * @param {string} shapeId - shape id
     * @param {string} drawingId - drawing id
     * @param {boolean} setToDefault - true, if saved id need to be removed
     * @private
     */
    var _updateSavedDrawingProperties = function (chartId, shapeId, drawingId, setToDefault) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        if (drawingProviderType) {
            if (!_savedDrawingOptionsMap[drawingProviderType]) {
                _savedDrawingOptionsMap[drawingProviderType] = {};
            }
            var drawingObject = _getDrawingObject(chartId, drawingId);
            if (drawingObject) {
                if (setToDefault) {
                    _savedDrawingOptionsMap[drawingProviderType][shapeId] = undefined;
                    infChart.drawingsManager.resetDrawing(chartId, drawingId, _getDrawingProperties(drawingObject.annotation));
                } else {
                    let drawingPropertiesClone = JSON.parse(JSON.stringify(_getDrawingPropertiesToSave(chartId, drawingId)));
                    _savedDrawingOptionsMap[drawingProviderType][shapeId] = drawingPropertiesClone;
                }
                _providerInstances[drawingProviderType].saveDefaultDrawingTemplates(_savedDrawingOptionsMap[drawingProviderType]);
            }
        }
    };


    var _resetToUserDefaultDrawingProperties = function (chartId, shapeId, drawingId) {
        var drawingObject = _getDrawingObject(chartId, drawingId);
        var drawingTemplateProperties = $.extend(true, {}, _getUserDefaultDrawingProperties(chartId, shapeId));
        infChart.drawingsManager.applyTemplateProperties(chartId, drawingId, _getDrawingProperties(drawingObject.annotation), drawingTemplateProperties);
        _reloadSettings(chartId, drawingId);
    };


    var _getUserDefaultDrawingProperties = function (chartId, shapeId) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        return _savedDrawingOptionsMap[drawingProviderType]?.[shapeId];
    };

    /**
     * get drawing settings to save
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @private
     */
    var _getDrawingPropertiesToSave = function (chartId, drawingId) {
        var drawingPropertiesToSave = {};
        var drawingObject = _getDrawingObject(chartId, drawingId);
        if (drawingObject) {
            var drawingProperties = _getDrawingProperties(drawingObject.annotation);
            if (drawingProperties) {
                for (var property in drawingProperties) {
                    if (!_isRequiredProperty(drawingObject, property)) {
                        drawingPropertiesToSave[property] = drawingProperties[property];
                    }
                }
            }
        }
        return drawingPropertiesToSave;
    };

    /**
     * reset drawing properties
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @param {object} currentDrawingProperties - properties of current drawing object
     * @private
     */
    var _resetDrawingProperties = function (chartId, drawingId, currentDrawingProperties) {
        var currentPopupPosition = infChart.structureManager.settings.getPopupPosition(_getDrawingObject(chartId, drawingId).settingsPopup);
        var drawingObject = _getDrawingObject(chartId, drawingId);

        var properties = {
            shape: currentDrawingProperties.shape
        };
        for (var property in currentDrawingProperties) {
            if (_isRequiredProperty(drawingObject, property, true)) {
                properties[property] = currentDrawingProperties[property];
            }
        }

        _removeDrawing(chartId, drawingId);
        var drawingObj = _createDrawing(infChart.manager.getChart(chartId).chart, properties.shape, _getSettingsContainer(chartId), _getQuickSettingsContainer(chartId), drawingId);
        _drawDrawingFromProperties(drawingObj, infChart.manager.getChart(chartId).chart, _getSettingsContainer(chartId), properties);
        var newDrawingObj = _getDrawingObject(chartId, drawingId);
        _openSettings(newDrawingObj, false, currentPopupPosition);
        newDrawingObj.onPropertyChange("drawings");
        return properties;
    };

    /**
     * check if given property is required when saving and resetting the drawing
     * @param {Object} drawingObject - drawing object
     * @param {string} propertyId - property id
     * @returns {boolean} - true if position related property
     * @private
     */
    var _isRequiredProperty = function (drawingObject, propertyId, reset) {
        var isPositionProperty;

        if (drawingObject && drawingObject.isRequiredProperty) {
            isPositionProperty = drawingObject.isRequiredProperty(propertyId, reset);
        }

        if (isPositionProperty === undefined) {
            switch (propertyId) {
                case "yValue":
                case "yValueEnd":
                case "xValue":
                case "xValueEnd":
                case "trendYValue":
                case "trendXValue":
                case "intermediatePoints":
                case "linePointValues":
                case "clickCords" :
                case "text":
                case "textValue":
                case "jointLineValue":
                case "xValueDataIndex":
                case "xValueEndDataIndex":
                case "isLocked":
                    isPositionProperty = true;
                    break;
                default :
                    isPositionProperty = false;
                    break;
            }
        }

        return isPositionProperty;
    };

    /**
     * set data provider
     * @param {string} chartId - chart id
     * @param {string} providerObj - - chart id
     * @private
     */
    var _setDataProvider = function (chartId, providerObj) {
        if (providerObj) {
            if (!_providerInstances[providerObj.type]) {
                var dataProvider;
                switch (providerObj.type) {
                    case 'infinit':
                        dataProvider = new infChart.xinDrawingDataProvider(providerObj.source);
                        break;
                    default:
                        dataProvider = new infChart.mockDrawingDataProvider(providerObj.source);
                        break;
                }
                _providerInstances[providerObj.type] = dataProvider;
                _loadDrawingTemplates(providerObj.type);
            }
            _chartDrawingProviderTypes[chartId] = providerObj.type;
        }
    };

    /**
     * get contect menu options
     * @param {string} chartId
     * @param {string} drawingId
     * @param {object} event
     * @returns {object} options
     */
    var _getContextMenuOptions = function (chartId, drawingId, event) {
        var drawingObj = infChart.drawingsManager.getDrawingObject(chartId, drawingId);
        var option = _getDrawingContextMenuOptions(chartId);
        if (drawingObj.getContextMenuOptions) {
            options = drawingObj.getContextMenuOptions(chartId,
                drawingId,
                option,
                event
            );
        } else {
            options = infChart.drawingUtils.common.getContextMenuOptions(chartId,
                drawingId,
                option,
                event
            );
        }
        return options;
    };

    var _getDrawingContextMenuOptions = function (chartId) {
        var options = infChart.manager.getChart(chartId).settings.contextMenu.drawing.options;
        return options;
    };

    var _getFavoriteDrawingContextMenuOptions = function (chartId, options) {
        var contextMenu =  {
            "favoriteDrawing" : {
                icon : options.remove.icon,
                displayText : options.remove.displayText,
                action : function () {
                    _removeFavoriteDrawingFromContextMenu(options.uniqueId, options.drawingCat, options.drawingShape, chartId);
                }
            }
        };
        return contextMenu;
    };

    /**
     * get default drawing properties for the shape
     * @param {string} chartId - chart id
     * @param {string} shapeId - shape id
     * @returns {object} - default properties
     * @private
     */
    var _getDefaultDrawingProperties = function (chartId, shapeId) {
        var savedOptions = _savedDrawingOptionsMap?.[_chartDrawingProviderTypes[chartId]]?.[shapeId];
        return savedOptions || {};
    };

    /**
     * load drawing templates for given provider type
     * @param providerType
     * @private
     */
    var _loadDrawingTemplates = function (providerType) {
        _providerInstances[providerType].getSavedDrawingTemplates(function (data) {
            _drawingTemplates[providerType] = data;
        });
        _loadDefaultDrawingTemplates(providerType);
    };

    var _loadSavedDrawingTemplates = function (chartId) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        _loadDrawingTemplates(drawingProviderType);
    };


    /**
     * load drawing templates for given provider type
     * @param providerType
     * @private
     */
    var _loadDefaultDrawingTemplates = function (providerType) {
        _providerInstances[providerType].getDefaultSavedDrawingTemplates(function (data) {
            _savedDrawingOptionsMap[providerType] = data;
        });
    };

    /**
     * save drawing templates
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @param {string} shapeId - shape id
     * @param {string} templateId - template id
     * @private
     */
    var _saveDrawingTemplate = function (chartId, drawingId, shape, templateId) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        if (drawingProviderType) {
            if (!_drawingTemplates[drawingProviderType]) {
                _drawingTemplates[drawingProviderType] = {};
            }
            if (!_drawingTemplates[drawingProviderType][shape]) {
                _drawingTemplates[drawingProviderType][shape] = {};
            }
            var drawingObject = _getDrawingObject(chartId, drawingId);
            if (drawingObject) {
                _drawingTemplates[drawingProviderType][shape][templateId] = $.extend(true, {}, _getDrawingPropertiesToSave(chartId, drawingId));
                _providerInstances[drawingProviderType].saveDrawingTemplates(_drawingTemplates[drawingProviderType]);
                _reloadSettings(chartId, drawingId);
            }
        }
    };

    /**
     * delete given template
     * @param {string} chartId - chart id
     * @param {string} shapeId - shape id
     * @param {string} templateId - template id
     * @private
     */
    var _deleteDrawingTemplate = function (chartId, drawingId, shape, templateId) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        if (drawingProviderType) {
            delete _drawingTemplates[drawingProviderType][shape][templateId]
            _providerInstances[drawingProviderType].saveDrawingTemplates(_drawingTemplates[drawingProviderType]);
            _reloadSettings(chartId, drawingId);
        }
    };

    /**
     * apply given drawing template for given drawing
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @param {string} shapeId - shape id
     * @param {string} templateId - template id
     * @private
     */
    var _applyDrawingTemplate = function (chartId, drawingId, shape, templateId) {
        var drawingProviderType = _chartDrawingProviderTypes[chartId];
        var drawingObject = _getDrawingObject(chartId, drawingId);
        if (drawingProviderType) {
            var drawingTemplateProperties = $.extend(true, {}, _drawingTemplates[drawingProviderType][shape][templateId]);
            infChart.drawingsManager.applyTemplateProperties(chartId, drawingId, _getDrawingProperties(drawingObject.annotation), drawingTemplateProperties);
            _reloadSettings(chartId, drawingId);
        }
    };

    /**
     * get drawing templates for given drawing id
     * @param {string} chartId - chart id
     * @param {string} shapeId - shape id
     * @returns {Array} - list of templates
     * @private
     */
    var _getDrawingTemplates = function (chartId, shape) {
        var templatesMap = _drawingTemplates?.[_chartDrawingProviderTypes[chartId]]?.[shape];
        return templatesMap ? Object.keys(templatesMap).sort() : [];
    };

    /**
     * apply template properties
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @param {object} currentDrawingProperties - current drawing properties
     * @param {object} templateProperties - template properties
     * @private
     */
    var _applyTemplateProperties = function (chartId, drawingId, currentDrawingProperties, templateProperties) {
        var currentPopupPosition = infChart.structureManager.settings.getPopupPosition(_getDrawingObject(chartId, drawingId).settingsPopup);
        var drawingObject = _getDrawingObject(chartId, drawingId);
        var ann = drawingObject.annotation;
        var chart = ann.chart;
        var properties = {
            shape: currentDrawingProperties.shape
        };
        for (var property in currentDrawingProperties) {
            if (_isRequiredProperty(drawingObject, property, true)) {
                properties[property] = currentDrawingProperties[property];
            }
        }
        for (var templateProperty in templateProperties) {
            if (!_isRequiredProperty(drawingObject, templateProperty, true)) {
                properties[templateProperty] = templateProperties[templateProperty];
            }
        }
        _removeDrawing(chartId, drawingId);
        var drawingObj = _createDrawing(infChart.manager.getChart(chartId).chart, properties.shape, _getSettingsContainer(chartId), _getQuickSettingsContainer(chartId), drawingId);
        _drawDrawingFromProperties(drawingObj, infChart.manager.getChart(chartId).chart, _getSettingsContainer(chartId), properties);
        drawingObj.selectAndBindResize();
        ann = drawingObj.annotation;
        chart.selectedAnnotation = ann;
        var newDrawingObj = _getDrawingObject(chartId, drawingId);
        _openSettings(newDrawingObj, false, currentPopupPosition);
        newDrawingObj.onPropertyChange("drawings");
        return properties;
    };

    /**
     * reload settings window
     * @param {string} chartId - chart id
     * @param {string} drawingId - drawing id
     * @private
     */
    var _reloadSettings = function (chartId, drawingId) {
        var drawingObject = _getDrawingObject(chartId, drawingId);
        if (drawingObject.settingsPopup && !drawingObject.isQuickSetting) {
            var currentPopupPosition = infChart.structureManager.settings.getPopupPosition(drawingObject.settingsPopup);
            drawingObject.settingsPopup.remove();
            drawingObject.settingsPopup = null;
            _openSettings(drawingObject, false, currentPopupPosition);
        }
    };

    var _getTotalPoints = function (chart) {
        var iChart = chart && infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chart.renderTo.id));
        var totalPoints = iChart.calculateTotalPoints(chart);
        return totalPoints;
    };

    /**
     * whether drawn drawings available
     * @param {string} chartId - chart id
     * @retruns {boolean} whether drawn drawings available
     * @private
     */
    var _isDrawnDrawingsAvailable = function (chartId) {
        let drawings = chartDrawingObjects[chartId];

        for (let drawingId in drawings) {
            if (drawings.hasOwnProperty(drawingId)) {
                if (drawings[drawingId].annotation.options.drawingType === infChart.constants.drawingTypes.shape) {
                    return true;
                }
            }
        }

        return false;
    };

    var _resetEnabledMyDefaultButton = function(chartId, shape, currentDrawingId, value){
        var drawings = chartDrawingObjects[chartId];

        if (drawings) {
            for (let drawingId in drawings) {
                var drawingObj = _getDrawingObject(chartId, drawingId);
                if(shape == drawingObj.shape && drawingId != currentDrawingId){
                    if(drawingObj.annotation && drawingObj.annotation.options){
                        drawingObj.annotation.options.enabledMyDefaultButton = value;
                    }
                }
            }
        }
    };

    var _hasPositionChanged = function (shapeId, options) {
        var isPositionChanged = true;
        switch (shapeId) {
            case 'fibRetracements':
                if (options.xValue === options.xValueStore && options.yValue === options.yValueStore &&
                    options.xValueEnd === options.xValueEndStore && options.yValueEndStore === options.yValueEnd &&
                    options.nearestXValue === options.nearestXValueStore && options.nearestXValueEnd === options.nearestXValueEndStore &&
                    options.nearestYValue === options.nearestYValueStore && options.nearestYValueEnd === options.nearestYValueEndStore) {
                        isPositionChanged = false;
                }
                break;
            case 'fib3PointPriceProjectionHLH':
            case 'fib3PointPriceProjectionLHL':
            case 'fib3PointPriceProjectionGeneric':
                if (options.xValue === options.xValueStore && options.yValue === options.yValueStore &&
                    options.xValueEnd === options.xValueEndStore && options.yValueEnd === options.yValueEndStore &&
                    options.trendXValue === options.trendXValueStore &&  options.trendYValue === options.trendYValueStore &&
                    options.nearestXValue === options.nearestXValueStore && options.nearestXValueEnd === options.nearestXValueEndStore &&
                    options.nearestYValue === options.nearestYValueStore && options.nearestYValueEnd === options.nearestYValueEndStore &&
                    options.nearestTrendYValue === options.nearestTrendYValueStore && options.nearestTrendXValue === options.nearestTrendXValueStore) {
                        isPositionChanged = false;
                }
                break;
            default:
                break;
        }
        return isPositionChanged;
    }

    return {
        //initializeDrawing: _initializeDrawing,
        setActiveDrawing: _setActiveDrawing,
        setActiveDrawingSettings: _setActiveDrawingSettings,
        getActiveDrawing: _getActiveDrawing,
        removeActiveDrawing: _removeActiveDrawing,
        closeActiveDrawingSettings: _closeActiveDrawingSettings,
        removeAllDrawings: _removeAllDrawings,
        removeDrawing: _removeDrawing,
        //removeDrawingEvents: _removeDrawingEvents,
        //deselectDeleteTool: _deselectDeleteTool,
        getDrawingObject: _getDrawingObject,
        getIsActiveDrawing: _getIsActiveDrawing,
        getIsActiveDrawingInprogress: _getIsActiveDrawingInprogress,
        //setIsActiveDrawing: _setIsActiveDrawing,
        getIsActiveDeleteTool: _getIsActiveDeleteTool,
        getIsActiveEraseMode: _getIsActiveEraseMode,
        //setIsActiveDeleteTool: _setIsActiveDeleteTool,
        isMultipleDrawingsEnabled: _isMultipleDrawingsEnabled,
        //toggleMultipleDrawings: _toggleMultipleDrawings,
        getDrawingProperties: _getDrawingProperties,
        getAllDrawingProperties: _getAllDrawingProperties,
        getAllDrawings: _getAllDrawings,
        drawDrawingFromProperties: _drawDrawingFromProperties,
        // scaleDrawings: _scaleDrawings,
        //pauseScaleDrawings: _pauseScaleDrawings,
        //unPauseScaleDrawings: _unPauseScaleDrawings,
        setActiveAnnotationInprogress: _setActiveAnnotationInprogress,
        getActiveAnnotationInprogress: _getActiveAnnotationInprogress,
        onAnnotationStore: _onAnnotationStore,
        onAnnotationRelease: _onAnnotationRelease,
        setYExtremesOnExternalChanges: _setYExtremesOnExternalChanges,
        applyNewDrawings: _onNewProperties,
        initialize: _onInitialize,
        destroy: _onDestroy,
        createDrawingToolbar: _createDrawingToolbar,
        getDrawingConfigs: _getDrawingConfigs,
        getDeleteCursor: _getDeleteCursor,
        getEraseModeCursor:_getEraseModeCursor,
        resetYExtremes: _resetYExtremes,
        getAxisLabelOffset: _getAxisLabelOffset,
        getSettingsContainer: _getSettingsContainer,
        getChartIdFromHighchartInstance: _getChartIdFromHighchartInstance,
        pasteNewItem: pasteNewItem,
        updateDrawingProperties: updateDrawingProperties,
        rearrangeDrawingToolbar: _rearrangeDrawingToolbar,
        getDrawingToolbarProperties: _getDrawingToolbarProperties,
        updateSavedDrawingProperties: _updateSavedDrawingProperties,
        resetDrawing: _resetDrawingProperties,
        openSettings: _openSettings,
        createDrawing: _createDrawing,
        getContextMenuOptions: _getContextMenuOptions,
        toggleFavorite: _toggleFavorite,
        toggleSettings: _toggleSettings,
        getQuickSettingsContainer: _getQuickSettingsContainer,
        addChartAreaKeyDownListener: _addChartAreaKeyDownListener,
        removeChartAreaKeyDownListener: _removeChartAreaKeyDownListener,
        saveDrawingTemplate: _saveDrawingTemplate,
        deleteDrawingTemplate: _deleteDrawingTemplate,
        applyDrawingTemplate: _applyDrawingTemplate,
        getDrawingTemplates: _getDrawingTemplates,
        applyTemplateProperties: _applyTemplateProperties,
        loadSavedDrawingTemplates: _loadSavedDrawingTemplates,
        positionElliotWaveDrawingLabels: _positionElliotWaveDrawingLabels,
        deselectDrawingTools: _deselectDrawingTools,
        resetToUserDefaultDrawingProperties: _resetToUserDefaultDrawingProperties,
        reloadSettings: _reloadSettings,
        getUserDefaultDrawingProperties: _getUserDefaultDrawingProperties,
        getTotalPoints: _getTotalPoints,
        isDrawnDrawingsAvailable: _isDrawnDrawingsAvailable,
        setSelectToolbarIconOnReset: _setSelectToolbarIconOnReset,
        setDeleteMode: _setDeleteMode,
        offDeleteMode: _offDeleteMode,
        hasPositionChanged: _hasPositionChanged,
        resetEnabledMyDefaultButton: _resetEnabledMyDefaultButton,
        getFavoriteDrawingContextMenuOptions: _getFavoriteDrawingContextMenuOptions,
        setActiveSelectOption: _setActiveSelectOption,
        updateIsGloballyLockInDelete: _updateIsGloballyLockInDelete,
        setActiveDrawingToolOptions: _setActiveDrawingToolOptions
    }

})(jQuery, infChart);
