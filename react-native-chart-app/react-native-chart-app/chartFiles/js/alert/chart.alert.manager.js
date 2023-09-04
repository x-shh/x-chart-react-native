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