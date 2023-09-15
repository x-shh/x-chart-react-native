window.infChart = window.infChart || {};

infChart.alertManager = (function (infChart, $, H) {

    var _instances = {}, _providerInstances = {}, _crosshairWrapped = false;

    var _initialize = function(chartId, providerObj, options) {
        if (!_isAlertAvailable(chartId)) {
            var dataProvider = _getDataProvider(providerObj);
            _initiateInstance(chartId, dataProvider, options);
            if(!_crosshairWrapped){
                _wrapCrosshair();
                _crosshairWrapped = true;
            }
        }
    };

    /**
    * @param {object} chartObj
    * @param {object} drawingSettingsContainer - chart container
    * @param {object} drawingProperties
    * @returns drawing object
    */
    var _createAlertDrawing = function (chartObj, drawingSettingsContainer, drawingProperties) {
        var drawing;
        if (drawingProperties) {
            var shapeId = drawingProperties.shape;
        }
        var drawingId = infChart.util.generateUUID();
        switch (shapeId) {
            case 'alertLine':
                drawing = new infChart.alertLineDrawing(drawingId, chartObj, shapeId, drawingSettingsContainer);
                break;
        };
        return infChart.drawingsManager.drawDrawingFromProperties(drawing, chartObj, drawingSettingsContainer, drawingProperties, drawing.drawingId);
    };

    var _getDataProvider = function(providerObj){
        var dataProvider;
        if(_providerInstances[providerObj.type]){
            dataProvider = _providerInstances[providerObj.type];
        } else {
            switch (providerObj.type) {
                case 'infinit':
                    dataProvider = new infChart.xinAlertDataProvider(providerObj.source);
                    break;
                default:
                    dataProvider = new infChart.mockAlertDataProvider(providerObj.source);
                    break;
            }
        }
        return dataProvider;
    };

    var _initiateInstance = function(chartId, dataProvider, options) {
        var chartInstance = infChart.manager.getChart(chartId),
            container = chartInstance.getContainer(),
            settingsContainer = $(infChart.structureManager.getContainer(container, options.containerKey));

        _instances[chartId] = {
            dataProvider: dataProvider,
            listeners: [],
            drawings: [],
            items: {},
            symbol: chartInstance.symbol,
            settingsContainer: settingsContainer,
            options: options
        };

        _instances[chartId].listeners.push({
            method: 'setSymbol',
            id: chartInstance.registerForEvents('setSymbol', function(symbol) {
                _resetItems(chartId);
                _instances[chartId].symbol = symbol;
            })
        });

        _instances[chartId].listeners.push({
            method: 'onReadHistoryDataLoad',
            id: chartInstance.registerForEvents('onReadHistoryDataLoad', function(data) {
                if (data && data.length > 0) {
                    _loadItems(chartId);
                }
            })
        });

        _instances[chartId].listeners.push({
            method: 'destroy',
            id: chartInstance.registerForEvents('destroy', function() {
                _destroyInstance(chartId);
            })
        });
    };
    
    var _isAlertAvailable = function(chartId){
        return _instances.hasOwnProperty(chartId);
    };

    var _wrapCrosshair = function(){
        H.wrap(H.Axis.prototype, 'drawCrosshair', function (proceed, e, point) {

            var chartId = infChart.manager.getContainerIdFromChart(this.chart.renderTo.id), chart = infChart.manager.getChart(chartId);
        
            if ("undefined" === typeof chart || !chart.chart || !infChart.alertManager.isAlertAvailable(chartId)) {
                proceed.call(this, e, point);
                return;
            }
        
            var yAxis = chart.getMainYAxis(), crosshairOptions = yAxis.options.crosshair.label;

            if(!this.isXAxis && this.options.id === yAxis.options.id){//!chart.isDefaultCrosshairEnabled(this) && 
                if(!yAxis.crossLabel){
                    yAxis.crossLabel = chart.chart.renderer.label(null, null, null, 'square', undefined, undefined, true)//crosshairOptions.shape || 'callout'
                        .addClass('highcharts-crosshair-label highcharts-crosshair-alert-label' + (yAxis.series[0] && ' highcharts-color-' + yAxis.series[0].colorIndex))
                        .attr({
                            align: crosshairOptions.align || (yAxis.horiz ? 'center' : 
                                yAxis.opposite ? (yAxis.labelAlign === 'right' ? 'right' : 'left') : (yAxis.labelAlign === 'left' ? 'left' : 'center')),
                            padding: H.pick(crosshairOptions.padding, 8),
                            r: H.pick(crosshairOptions.borderRadius, 3),
                            zIndex: 11
                        })
                        .add(yAxis.labelGroup);
                    
                    yAxis.crossLabel
                        .attr({
                            fill: crosshairOptions.backgroundColor || (yAxis.series[0] && yAxis.series[0].color) || '#666666',
                            stroke: crosshairOptions.borderColor || '',
                            'stroke-width': crosshairOptions.borderWidth || 0
                        })
                        .css(H.extend({
                            color: '#ffffff',
                            fontWeight: 'normal',
                            fontSize: '11px',
                            textAlign: 'center'
                        }, crosshairOptions.style));
                    
                    if(!yAxis.crossAlertLabel){
                        yAxis.crossAlertLabel = chart.chart.renderer.label("<span>\uf0a2</span>", null, null, 'square', undefined, undefined, true)
                            .addClass('highcharts-crosshair-label icon-label-fa highcharts-crosshair-alert-icon' + (yAxis.series[0] && ' highcharts-color-' + yAxis.series[0].colorIndex))
                            .attr({
                                align: crosshairOptions.align || (yAxis.horiz ? 'center' : 
                                    yAxis.opposite ? (yAxis.labelAlign === 'right' ? 'right' : 'left') : (yAxis.labelAlign === 'left' ? 'left' : 'center')),
                                padding: H.pick(crosshairOptions.padding, 8),
                                r: H.pick(crosshairOptions.borderRadius, 3),
                                zIndex: 11,
                                cursor: 'pointer'
                            })
                            .add(yAxis.labelGroup);
                
                        yAxis.crossAlertLabel
                            .attr({
                                fill: crosshairOptions.backgroundColor || (yAxis.series[0] && yAxis.series[0].color) || '#666666',
                                stroke: crosshairOptions.borderColor || '',
                                'stroke-width': crosshairOptions.borderWidth || 0
                            })
                            .css(H.extend({
                                color: '#ffffff',
                                fontWeight: 'normal',
                                fontSize: '11px',
                                textAlign: 'center'
                            }, crosshairOptions.style));
                        
                        H.addEvent(yAxis.crossAlertLabel.div, 'click', function(event) {
                            var price = parseFloat(yAxis.crossLabel.div.textContent.replaceAll(',', ''));
                            _addItem(chartId, price);
                        }, false);
                    }
                }
            }

            //Draw the crosshair
            proceed.call(this, e, point);

            if(e && (chart.chart.mouseIsDown != "mousedown" || this.chart.infManualCrosshair) && (this.top < e.chartY && (this.top + this.height) > e.chartY)){
                if(!chart.isLastCrosshair() && !this.isXAxis && this.options.id === yAxis.options.id){//!chart.isDefaultCrosshairEnabled(this) && 
                    if(chart.rangeData && chart.rangeData.data.length > 0){
                        yAxis.crossLabel.show();
                        
                        var x = yAxis.opposite ? yAxis.crossLabel.x - (yAxis.crossAlertLabel.width + 1) : yAxis.crossLabel.x + (yAxis.crossLabel.width + 1);

                        yAxis.crossAlertLabel.attr({
                            x: x,
                            y: yAxis.crossLabel.y,
                            height: yAxis.crossLabel.height - yAxis.crossAlertLabel.padding * 2,
                            visibility: 'visible'
                        }).toFront();

                        yAxis.crossLabel.toFront();

                        if(this.chart.options.isNotAlertEnableSymbol) {  //enable disbale alert according to the isAlertEnableSymbol configs  
                            yAxis.crossAlertLabel.hide();
                            yAxis.crossLabel.hide()
                        }

                    }
                }
            }
        });   
        
        // Wrapper to hide the label
		H.wrap(H.Axis.prototype, 'hideCrosshair', function(proceed, i) {

			proceed.call(this, i);
			
			if (this.crossAlertLabel) {
    			this.crossAlertLabel = this.crossAlertLabel.hide();
			}
		});
    };

    var _loadItems = function(chartId){
        if(_isAlertAvailable(chartId)){
            var chartInstance = infChart.manager.getChart(chartId), highchartInstance = chartInstance.chart, symbol = _instances[chartId].symbol;
            _instances[chartId].dataProvider.getItems(chartId, symbol, function(items){
                items.forEach(function(item){
                    if(!_instances[chartId].items[item.id]) {
                        var drawing = _addDrawing(highchartInstance, item, _instances[chartId].settingsContainer);
                        _instances[chartId].drawings.push(drawing.drawingId);
                        _instances[chartId].items[item.id] = drawing.drawingId;
                    }
                });
                infChart.manager.getChart(chartId).settings.registeredMethods.showHideAlerts();
            });
        }
    };
    
    var _addDrawing = function(chart, item, settingsContainer){
        var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            price = parseFloat(item.price);

        var drawingProperties = {
            "shape": "alertLine",
            "xValue": xAxis.toValue(chart.plotLeft),
            "yValue": price,
            "itemId": item.id,
            "width": chart.plotWidth,
            "clickCords": {
                "x": chart.plotLeft,
                "y": yAxis.toPixels(price)
            }
        };

        return _createAlertDrawing(chart, settingsContainer, drawingProperties);
    };

    var _resetItems = function(chartId){
        if(_isAlertAvailable(chartId)){
            _instances[chartId].drawings.forEach(function(drawingId){
                infChart.drawingsManager.removeDrawing(chartId, drawingId, false);
            });
            _instances[chartId].items = {};
        }
    };

    var _destroyInstance = function(chartId) {
        if(_isAlertAvailable(chartId)){
            var chart = infChart.manager.getChart(chartId);
            _instances[chartId].drawings.forEach(function(drawingId){
                infChart.drawingsManager.removeDrawing(chartId, drawingId, false);
            });
            _instances[chartId].listeners.forEach(function(val){
                chart.removeRegisteredEvent(val.method, val.id);
            });
            delete _instances[chartId];
        }
    };

    var _isEqualantSymbol = function (chartId, item) {
        var stockChart = infChart.manager.getChart(chartId);
        return stockChart.checkEquivalentSymbols(item.symbol, stockChart.symbol);
    };

    var _onUpdates = function(chartId, item) {
        if(_isAlertAvailable(chartId) && _isEqualantSymbol(chartId, item)){
            if(_instances[chartId].items[item.id]){
                var drawingId = _instances[chartId].items[item.id];
                if(item.active){
                    infChart.drawingsManager.updateDrawingProperties(chartId, drawingId, {yValue : item.price});
                } else {
                    infChart.drawingsManager.removeDrawing(chartId, drawingId, true);
                    _instances[chartId].drawings.splice(_instances[chartId].drawings.indexOf(drawingId));
                    delete _instances[chartId].items[item.id];
                }
            } else {
                if(item.active){
                    var chart = infChart.manager.getChart(chartId);
                    var drawing = _addDrawing(chart.chart, item, _instances[chartId].settingsContainer);
                    _instances[chartId].drawings.push(drawing.drawingId);
                    _instances[chartId].items[item.id] = drawing.drawingId;
                }
            }
        }
    };

    var _drawAlertDrawing = function (chartId, alert) {
        var chart = infChart.manager.getChart(chartId);
        var drawing = _addDrawing(chart.chart, alert, _instances[chartId].settingsContainer);
        _instances[chartId].drawings.push(drawing.drawingId);
        _instances[chartId].items[alert.id] = drawing.drawingId;
    };
    
    var _removeAlertDrawings = function (alertId) {
        for (const [key, value] of Object.entries(_instances)) {
            var chartId = key;
            var drawingId = _instances[chartId].items[alertId];
            infChart.drawingsManager.removeDrawing(chartId, drawingId, true);
            _instances[chartId].drawings.splice(_instances[chartId].drawings.indexOf(drawingId));
            delete _instances[chartId].items[alertId];
        }
    };
    
    var _hideAlertDrawings = function (chartId, isEnabled, isPropertyChanged) {
        var chartAlertInstance = _instances[chartId];
        
        if(chartAlertInstance) {
            var drawings = chartAlertInstance.items;
            
            for (const [key, value] of Object.entries(drawings)) {
                var drawing = infChart.drawingsManager.getDrawingObject(chartId, value);
                var shape = drawing.annotation.shape;
                var additionalDrawings = drawing.additionalDrawings;
                
                if(isEnabled) {
                    shape.show();
                    for (const [key, additionalDrawing] of Object.entries(additionalDrawings)) {
                        additionalDrawing.show();
                    }
                } else {
                    shape.hide();
                    for (const [key, additionalDrawing] of Object.entries(additionalDrawings)) {
                        additionalDrawing.hide();
                    }
                    if(drawing && drawing.annotation && drawing.annotation.selectionMarker && drawing.annotation.selectionMarker[0]){
                        drawing.annotation.selectionMarker[0].hide();
                    }
                    
                }
            }
        }
    
        if(isPropertyChanged) {
            let chart = infChart.manager.getChart(chartId);
            
            if(chart) {
                chart._onPropertyChange('alert', isEnabled);
            }
        }

    };
    
    var _formatYValue = function(chartId, yValue){
        var formattedYValue;
        if(_isAlertAvailable(chartId)){
            if(_instances[chartId].options && typeof _instances[chartId].options.formatPrice === 'function'){
                formattedYValue = _instances[chartId].options.formatPrice(yValue);
            } else{
                var chart = infChart.manager.getChart(chartId);
                formattedYValue = infChart.manager.getYLabel(chart.chart, yValue, false);
            }
        } else{
            formattedYValue = yValue;
        }
        return formattedYValue;
    };

    var _addItem = function(chartId, price){
        if(_isAlertAvailable(chartId)){
            var symbol = _instances[chartId].symbol;
            _instances[chartId].dataProvider.addItem(chartId, symbol, price);
        }
    };

    var _updateItem = function(chartId, id, price, originalPrice){
        if(_isAlertAvailable(chartId)){
            var symbol = _instances[chartId].symbol;
            _instances[chartId].dataProvider.updateItem(chartId, id, price, originalPrice, symbol);
        }
    };

    var _deleteItem = function(chartId, id){
        if(_isAlertAvailable(chartId)){
            _instances[chartId].dataProvider.deleteItem(chartId, id);
        }
    };
    
    var _onItemSelect = function(chartId, id, priceLevel){
        if(_isAlertAvailable(chartId)){
            if(_instances[chartId].options && typeof _instances[chartId].options.onSelect === 'function'){
                _instances[chartId].options.onSelect(id, priceLevel);
            }
        }
    };
    
   var _onAnnotationStore = function(chartId, drawing) {
        if(_isAlertAvailable(chartId)){
            if(_instances[chartId].drawings.indexOf(drawing.drawingId) !== -1){
                _instances[chartId].activeAlert = {id: drawing.annotation.options.itemId, price: drawing.yValue};
            } else{
                _instances[chartId].activeAlert = undefined;
            }
        }
    };

    var _onAnnotationRelease = function(chartId, drawing) {
        if(_isAlertAvailable(chartId)){
            if(_instances[chartId].drawings.indexOf(drawing.drawingId) !== -1){
                infChart.alertManager.updateItem(chartId, drawing.annotation.options.itemId, drawing.yValue, _instances[chartId].activeAlert && _instances[chartId].activeAlert.price);
            }
        }
    };
    
    var _overrideCrosshairLabelValue = function(chartId, value){
        var override = false;
        if(_isAlertAvailable(chartId)){
            var chart = infChart.manager.getChart(chartId);
            override = !chart.isLastCrosshair();//!chart.isDefaultCrosshairEnabled(this) && 
        }
        return override;
    };
    
    var _getCrosshairLabelValue = function(chartId, value){
        var chart = infChart.manager.getChart(chartId);
        var baseYValue = chart.getBaseValue(value, chart.isLog, chart.isCompare, chart.isPercent);
        return chart.formatValue(baseYValue, chart.getMainSeries().options.dp, undefined, true, false);
    };

    return {
        initialize: _initialize,
        resetItems: _resetItems,
        loadItems: _loadItems,
        addItem : _addItem,
        updateItem : _updateItem,
        deleteItem : _deleteItem,
        onItemSelect: _onItemSelect,
        onUpdates: _onUpdates,
        onAnnotationStore: _onAnnotationStore,
        onAnnotationRelease: _onAnnotationRelease,
        formatYValue: _formatYValue,
        overrideCrosshairLabelValue: _overrideCrosshairLabelValue,
        getCrosshairLabelValue: _getCrosshairLabelValue,
        isAlertAvailable: _isAlertAvailable,
        removeAlertDrawings: _removeAlertDrawings,
        hideAlertDrawings: _hideAlertDrawings,
        drawAlertDrawing: _drawAlertDrawing
    }
})(infChart, jQuery, Highcharts);
infChart.alertDataProvider = function(vendor){};

infChart.alertDataProvider.prototype.getItems = function(chartId, symbol, onSuccess){};

infChart.alertDataProvider.prototype.addItem = function(chartId, symbol, price){};

infChart.alertDataProvider.prototype.updateItem = function(chartId, id, price, originalPrice){};

infChart.alertDataProvider.prototype.deleteItem = function(chartId, id){};

(function(infChart, $){

    infChart.mockAlertDataProvider = function () {
        infChart.alertDataProvider.apply(this, arguments);
    };

    infChart.util.extend(infChart.alertDataProvider, infChart.mockAlertDataProvider);

    infChart.mockAlertDataProvider.prototype.getItems = function(chartId, symbol, onSuccess){
        var data = infChart.manager.getChart(chartId).rangeData.data;
        onSuccess([
            {
                id : Math.floor(Math.random() * 10000),
                symbol: symbol,
                price: data[data.length - 1] * 1.0001,
                active: true
            },
            {
                id : Math.floor(Math.random() * 10000),
                symbol: symbol,
                price: data[data.length - 1] * 0.9999,
                active: true
            }
        ]);
    };

    infChart.mockAlertDataProvider.prototype.addItem = function(chartId, symbol, price){
        infChart.alertManager.onUpdates(chartId, {
            id : Math.floor(Math.random() * 10000),
            symbol: symbol,
            price: price,
            active: true
        });
    };

    infChart.mockAlertDataProvider.prototype.updateItem = function(chartId, id, price, originalPrice){
        infChart.alertManager.onUpdates(chartId, {
            id : id,
            symbol: infChart.manager.getChart(chartId).symbol,
            price: price,
            active: true
        });
    };

    infChart.mockAlertDataProvider.prototype.deleteItem = function(chartId, id){
        infChart.alertManager.onUpdates(chartId, {
            id : id,
            price: price,
            active: false
        });
    };

})(infChart, jQuery);
window.infChart = window.infChart || {};

infChart.alertLineDrawing = function () {
    infChart.drawingObject.apply(this, arguments);
};

infChart.alertLineDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.alertLineDrawing.prototype.additionalDrawingsFunction = function () {
    var drawingObject = this,
        ann = drawingObject.annotation,
        chart = ann.chart,
        options = ann.options,
        theme = Highcharts.theme && Highcharts.theme.alert || {},
        labelTheme = theme.label || {},
        height = theme.height || 14,
        padding = theme.padding || 3,
        top = -(height / 2 + padding),
        labelFill = labelTheme.fill || "rgb(255,255,255)",
        stroke = labelTheme.stroke || "#ffffff",
        opacity = theme.opacity || 1,
        labelFontColor = labelTheme.fontColor || "#ffffff",
        labelFontWeight = labelTheme.fontWeight || 500;

    var labelX = 0;

    /**
     * price label
     * @type {*|SVGElement}
     */
    var priceLabel = chart.renderer.label(infChart.alertManager.formatYValue(drawingObject.stockChartId, drawingObject.yValue), labelX, top).attr({
        'zIndex': 20,
        'padding': padding,
        'r': 1,
        'fill': labelFill,
        'opacity': opacity,
        'stroke': stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'price-lbl'
    }).add(ann.group);

    //textProps: ['direction', 'fontSize', 'fontWeight', 'fontFamily','fontStyle', 'color', 'lineHeight', 'width', 'textAlign','textDecoration', 'textOverflow', 'textOutline']
    priceLabel.css({ //to color text
        'fontWeight': labelFontWeight,
        'color': labelFontColor
    });

    labelX += priceLabel.width;

    drawingObject.additionalDrawings['priceLabel'] = priceLabel;

    var drawingLabel = chart.renderer.label("\uf017", labelX, top).attr({
        'zIndex': options.isDisplayOnly ? 1 : 20,
        'padding': padding,
        'r': 1,
        'fill': labelFill,
        'opacity': opacity,
        'stroke': stroke,
        'stroke-width': 1,
        'stroke-linecap': 'butt',
        'stroke-linejoin': 'miter',
        'stroke-opacity': 1,
        'hAlign': 'center',
        'height': height,
        'class': 'icon-label-fa',
        'cursor': 'pointer'
    }).add(ann.group);

    drawingLabel.css({ //to color text
        'fontWeight': labelFontWeight,
        'fill': labelFontColor
    });

    infChart.util.bindEvent(drawingLabel.element, 'mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();

        infChart.alertManager.onItemSelect(drawingObject.stockChartId, options.itemId);
    });

    drawingObject.additionalDrawings['ctrlLabel'] = drawingLabel;
};

infChart.alertLineDrawing.prototype.bindSettingsEvents = function () { };

infChart.alertLineDrawing.prototype.destroyDrawing = function () {
    this.additionalDrawings['priceLabel'].destroy();
    infChart.util.unbindEvent(this.additionalDrawings['ctrlLabel'].element, 'mousedown', function (e) {
        e.stopPropagation();
        e.preventDefault();

        infChart.alertManager.onItemSelect(drawingObject.stockChartId, options.id);
    });
    this.additionalDrawings['ctrlLabel'].destroy();
};

infChart.alertLineDrawing.prototype.getConfig = function () { };

infChart.alertLineDrawing.prototype.getOptions = function (properties) {
    var options = {
        xValue: properties.xValue,
        x: properties.x,
        yValue: properties.yValue,
        itemId: properties.itemId,
        isDisplayOnly: false,
        allowDragX: false,
        allowDragY: true,
        drawingType: infChart.constants.drawingTypes.alert,
        shape: {
            params: {
                d: ['M', 0, 0, 'L', 0, 0],
                dashstyle: 'solid',
                opacity: infChart.constants.chartTrading.theme.tradingLine.opacity,
                fill: infChart.constants.chartTrading.theme.tradingLine.buyColor,
                stroke: infChart.constants.chartTrading.theme.tradingLine.buyColor,
                'class': 'line',
                'stroke-width': 1
            }
        }
    };

    if (properties.width && !isNaN(properties.plotLeft)) {
        options.shape.params.d = ['M', properties.plotLeft, 0, 'L', properties.width + properties.plotLeft, 0];
    }

    if (properties.clickCords) {
        options.clickCords = properties.clickCords;
    }

    options.shape.params['z-index'] = 10;
    // options.adjustYAxisToViewAnnotation = true;
    // options.getExtremesFn = infChart.drawingUtils.common.tradingUtils.getLineExtremesFn;
    options.validateTranslationFn = this.validateTranslation;
    options.isRealTimeTranslation = true;

    return options;
};

infChart.alertLineDrawing.prototype.getPlotHeight = function () {
    return {
        height: this.additionalDrawings['priceLabel'] && this.additionalDrawings['priceLabel'].height
    };
};

infChart.alertLineDrawing.prototype.getSettingsPopup = function () {
    return $("<div></div>");
};

infChart.alertLineDrawing.prototype.scale = function () {
    var self = this,
        ann = self.annotation,
        chart = ann.chart,
        plotWidth = chart.plotWidth,
        plotx = chart.plotLeft;

    var label = self.additionalDrawings['priceLabel'];

    label.textSetter(infChart.alertManager.formatYValue(self.stockChartId, self.yValue));

    var ctrlLabel = self.additionalDrawings['ctrlLabel'];

    /* to fix hidden tab's label issues in flax layout, https://xinfiit.atlassian.net/browse/TTW-249 */
    ctrlLabel.textSetter(ctrlLabel.text.textStr);
    ctrlLabel.attr({
        x: label.x + label.width
    });

    var lastX = ctrlLabel.x + ctrlLabel.width;


    var line = ["M", lastX, 0, 'L', plotWidth, 0];

    ann.update({
        x: plotx, // since xValue is based on the actual time values on the series xAxis.min doesn't provide the exact coordinations of the plotLeft of the chart.
        xValue: null, // set xValue as null to position annotation to into x.
        shape: {
            params: {
                d: line
            }
        }
    });

    infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
    infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.alertLineDrawing.prototype.selectAndBindResize = function () {
    infChart.drawingUtils.common.tradingUtils.selectAndBindResize.call(this, (this.annotation.chart.plotWidth * 0.9));
    var ann = this.annotation;

    if (ann.selectionMarker) {
    } else {
        var x = ann.chart.plotWidth * 0.9, y = 0, selectPointStyles = { stroke: ann.options.shape.params.stroke };
        ann.selectionMarker = [];
        infChart.drawingUtils.common.addSelectionMarker.call(this, ann, x, y, selectPointStyles);
    }
};

infChart.alertLineDrawing.prototype.step = function () { };

infChart.alertLineDrawing.prototype.stop = function (e) { };

infChart.alertLineDrawing.prototype.translate = function () {
    var self = this,
        ann = this.annotation,
        chart = ann.chart

    var priceLabel = this.additionalDrawings['priceLabel'];
    priceLabel.attr({
        text: infChart.alertManager.formatYValue(self.stockChartId, self.yValue)
    });

    this.selectAndBindResize();
    chart.selectedAnnotation = ann;
};

infChart.alertLineDrawing.prototype.updateSettings = function () { };

/**
 * validate moving orders below zero
 * called from annotations => translateAnnotation
 * should invoke with drawing object
 * @param x
 * @param y
 * @returns {boolean}
 */
infChart.alertLineDrawing.prototype.validateTranslation = function (x, y) {
    var annotation = this.annotation,
        yValue = annotation && annotation.options && infChart.drawingUtils.common.getBaseYValue.call(this, y);
    console.debug("validateTranslation : yValue : " + yValue);
    return (yValue && yValue >= 0);
};

var infChart = window.infChart || {};

(function ($, infChart) {
  /**
   * Wrapping up the _hideAlertDrawings to catch the function singleton indicator toggling and set the cammands(undo/redo) accordingly
   */
  infChart.util.wrap(infChart.alertManager, '_hideAlertDrawings', function (proceed, chartId, isEnabled) {
      function undoRedo(isEnabled) {
          proceed.call(this, chartId, isEnabled);
      }
      infChart.commandsManager.registerCommand(chartId, function () {
          undoRedo(isEnabled);
      }, function () {
          undoRedo(!isEnabled);
      }, undefined, false, '_hideAlertDrawings');
      return proceed.call(this, chartId, isEnabled);
  });

})(jQuery, infChart);
