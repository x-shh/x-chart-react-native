window.infChart = window.infChart || {};

infChart.trendChannelDrawing = function () {
   infChart.drawingObject.apply(this, arguments);
};

infChart.trendChannelDrawing.prototype = Object.create(infChart.drawingObject.prototype);

infChart.trendChannelDrawing.prototype.additionalDrawingsFunction = function () {
   var self = this,
       ann = self.annotation,
       options = ann.options,
       chart = ann.chart,
       xAxis = chart.xAxis[options.xAxis],
       yAxis = chart.yAxis[options.yAxis],
       additionalDrawingsArr = self.additionalDrawings,
       theme = infChart.themeManager.getTheme(),
       shape = "trendChannel";

   additionalDrawingsArr.midLine = chart.renderer.path(['M', 0, 0, 'L', 0, 0]).attr({
      'stroke-width': options.middleLineWidth? options.middleLineWidth : theme.drawing[shape] && theme.drawing[shape].middleLineWidth ? theme.drawing[shape].middleLineWidth : 1,
      stroke: options.middleLineColor? options.middleLineColor : theme.drawing[shape] && theme.drawing[shape].middleLineColor ? theme.drawing[shape].middleLineColor : theme.drawing.base.borderColor,
      'z-index': 2,
      cursor: 'default',
      dashstyle: options.middleLineStyle? options.middleLineStyle : theme.drawing[shape] && theme.drawing[shape].middleLineStyle ? theme.drawing[shape].middleLineStyle : 'dash'
   }).add(ann.group);

   additionalDrawingsArr.fill = chart.renderer.path(['M', 0, 0, 'L', 0, 0, 'L', 0, 0, 'L', 0, 0]).attr({
      'stroke-width': 0,
      fill: options.fillColor? options.fillColor : theme.drawing[shape] && theme.drawing[shape].fillColor ? theme.drawing[shape].fillColor : theme.drawing.base.fillColor,
      'fill-opacity': options.fillOpacity? options.fillOpacity : theme.drawing[shape] && theme.drawing[shape].fillOpacity ? theme.drawing[shape].fillOpacity : theme.drawing.base.fillOpacity,
      stroke: options.fillColor? options.fillColor : theme.drawing[shape] && theme.drawing[shape].fillColor ? theme.drawing[shape].fillColor : theme.drawing.base.fillColor,
      'z-index': 0,
      cursor: 'default',
      'pointer-events':'none'
   }).add(ann.group);

   ann.selectionMarker = [];
   infChart.drawingUtils.common.addSelectionMarker.call(this, ann, 0, 0);
};

infChart.trendChannelDrawing.prototype.bindSettingsEvents = function () {
   var self = this,
       ann = self.annotation;

   function onChannelLineColorChange(rgb, color) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      infChart.drawingUtils.common.settings.onLineColorChange.call(self, rgb, color, isPropertyChange, "input[inf-ctrl=channelColorPicker]");
   }

   function onChannelLineWidthChange(channelLineWidth) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      infChart.drawingUtils.common.settings.onLineWidthChange.call(self, channelLineWidth, isPropertyChange, self.settingsPopup.find(".channel-styles"));
   }

   function onChannelLineStyleChange(channelLineStyle) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      infChart.drawingUtils.common.settings.onLineStyleChange.call(self, channelLineStyle, isPropertyChange, self.settingsPopup.find(".channel-styles"));
   }

   function onFillColorChange(rgb, value, opacity) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }

      self.onFillColorChange.call(self, rgb, value, opacity, isPropertyChange);
   }

   function onMiddleLineColorChange(rgb, color) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      self.onMiddleLineColorChange.call(self, rgb, color, isPropertyChange);
   }

   function onMiddleLineWidthChange(middleLineWidth) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      self.onMiddleLineWidthChange.call(self, middleLineWidth, isPropertyChange);
   }

   function onMiddleLineStyleChange(middleLineStyle) {
      var isPropertyChange = true;
      if (self.settingsPopup) {
         isPropertyChange = self.isSettingsPropertyChange();
      }
      self.onMiddleLineStyleChange.call(self, middleLineStyle, isPropertyChange);
   }

   function onResetToDefault () {
      self.updateSavedDrawingProperties(true);
   }

   infChart.structureManager.drawingTools.bindTrendChannelSettings(self.settingsPopup, onChannelLineColorChange, onChannelLineWidthChange, onChannelLineStyleChange, onFillColorChange, onMiddleLineColorChange, onMiddleLineWidthChange, onMiddleLineStyleChange, onResetToDefault);
};

infChart.trendChannelDrawing.prototype.onFillColorChange = function (rgb, value, opacity, isPropertyChange) {
   var self = this;

   self.annotation.update({
      fillColor: value,
      fillOpacity: opacity,
   });

   if(self.additionalDrawings['fill']){
      self.additionalDrawings['fill'].attr({
         fill: value,
         'fill-opacity': opacity
      });
   }

   isPropertyChange && self.onPropertyChange();
   if (this.settingsPopup) {
      this.settingsPopup.data("infUndoRedo", false);
   }
   infChart.drawingUtils.common.saveDrawingProperties.call(self);
}

infChart.trendChannelDrawing.prototype.onMiddleLineColorChange = function (rgb, color, isPropertyChange) {
   var self = this;
   self.annotation.update({
      middleLineColor: color
   });

   if(self.additionalDrawings['midLine']){
      self.additionalDrawings['midLine'].attr({
         stroke: color
      });
   }

   isPropertyChange && self.onPropertyChange();
   if (this.settingsPopup) {
      this.settingsPopup.data("infUndoRedo", false);
   }
   infChart.drawingUtils.common.saveDrawingProperties.call(self);
}

infChart.trendChannelDrawing.prototype.onMiddleLineWidthChange = function (strokeWidth, isPropertyChange) {
   var self = this;

   self.annotation.update({
      middleLineWidth: strokeWidth
   });

   if(self.additionalDrawings['midLine']){
      self.additionalDrawings['midLine'].attr({
         'stroke-width': strokeWidth
      });
   }

   isPropertyChange && self.onPropertyChange();
   if (this.settingsPopup) {
      this.settingsPopup.data("infUndoRedo", false);
   }
   infChart.drawingUtils.common.saveDrawingProperties.call(self);
}

infChart.trendChannelDrawing.prototype.onMiddleLineStyleChange = function (dashStyle, isPropertyChange) {
   var self = this;

   self.annotation.update({
      middleLineStyle: dashStyle
   });

   if(self.additionalDrawings['midLine']){
      self.additionalDrawings['midLine'].attr({
         dashstyle: dashStyle
      });
   }
   isPropertyChange && self.onPropertyChange();
   if (this.settingsPopup) {
      this.settingsPopup.data("infUndoRedo", false);
   }
   infChart.drawingUtils.common.saveDrawingProperties.call(self);
}

infChart.trendChannelDrawing.prototype.getConfig = function () {
   var annotation = this.annotation;
   return {
      shape: 'trendChannel',
      channelLineColor: infChart.themeManager.getDrawingsBorderColor(annotation.options.shape.params.stroke, 'trendChannel'),
      channelLineWidth: annotation.options.shape.params['stroke-width'],
      channelLineStyle: annotation.options.shape.params.dashstyle,
      fillColor: annotation.options.fillColor,
      fillOpacity: annotation.options.fillOpacity,
      middleLineColor: annotation.options.middleLineColor,
      middleLineWidth: annotation.options.middleLineWidth,
      middleLineStyle: annotation.options.middleLineStyle,
      xValue: annotation.options.xValue,
      yValue: annotation.options.yValue,
      trendYValue: annotation.options.trendYValue,
      xValueEnd: annotation.options.xValueEnd,
      yValueEnd: annotation.options.yValueEnd,
      isLocked : annotation.options.isLocked

   };
};

infChart.trendChannelDrawing.prototype.getOptions = function (properties) {
   var options = {
      xValue: properties.xValue,
      yValue: properties.yValue,
      shape: {
         params: {
            d: ['M', 0, 0, 'L', 0, 0, 'M', 0, -60, 'L', 0, -60],
            dashstyle: 'solid'
         }
      },
      middleLineWidth: 1,
      middleLineStyle: 'dash'
   };
   if (properties.fillColor) {
      options.fillColor = properties.fillColor;
   }
   if (properties.fillOpacity) {
      options.fillOpacity = properties.fillOpacity;
   }
   if (properties.channelLineColor) {
      options.shape.params.stroke = properties.channelLineColor;
   }
   if (properties.channelLineWidth) {
      options.shape.params['stroke-width'] = properties.channelLineWidth;
   }
   if (properties.channelLineStyle) {
      options.shape.params.dashstyle = properties.channelLineStyle;
   }
   if (properties.middleLineColor) {
      options.middleLineColor = properties.middleLineColor;
   }
   if (properties.middleLineWidth) {
      options.middleLineWidth = properties.middleLineWidth;
   }
   if (properties.middleLineStyle) {
      options.middleLineStyle = properties.middleLineStyle;
   }
   if (properties.trendYValue) {
      options.trendYValue = properties.trendYValue;
   }
   if (properties.xValueEnd && properties.yValueEnd) {
      options.xValueEnd = properties.xValueEnd;
      options.yValueEnd = properties.yValueEnd;
   }
   options.validateTranslationFn = this.validateTranslation;

   options = infChart.Drawing.prototype.getOptions(properties,options);

   return options;
};

infChart.trendChannelDrawing.prototype.validateTranslation = function (newXValue) {
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

/**
 * Returns the properties to set to the copy object
 * @returns {object} properties
 */
infChart.trendChannelDrawing.prototype.getConfigToCopy = function () {
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

   properties.yValue = yAxis.toValue(yAxis.toPixels(properties.yValue) + copyDistanceY);
   properties.yValueEnd = yAxis.toValue(yAxis.toPixels(properties.yValueEnd) + copyDistanceY);
   properties.trendYValue = yAxis.toValue(yAxis.toPixels(properties.trendYValue) + copyDistanceY);
   if (!near45) {
      properties.xValue = xAxis.toValue(xAxis.toPixels(properties.xValue) + copyDistanceX);
      properties.xValueEnd = xAxis.toValue(xAxis.toPixels(properties.xValueEnd) + copyDistanceX);
   }
   return properties;
};

infChart.trendChannelDrawing.prototype.getMidpointResizeTrendChannel = function (e) {
   var ann = this.annotation,
       chart = ann.chart,
       pathDefinition = ann.shape.d.split(' '),
       width = parseFloat(pathDefinition[4]),
       height = parseFloat(pathDefinition[5]),
       //bbox = chart.container.getBoundingClientRect(),
       x = e.chartX,
       y = e.chartY,
       additionalDrawings = this.additionalDrawings;
   /* x = e.clientX - bbox.left,
   y = e.clientY - bbox.top;
   if (chart.infScaleX) {
   x = x / chart.infScaleX;
   }
   
   if (chart.infScaleY) {
   y = y / chart.infScaleY;
   }*/
   var yAxis = chart.yAxis[ann.options.yAxis],
      dy = y - yAxis.toPixels(ann.options.yValue),
      distance = (-1) * (height / 2 - dy), line;

   if (chart.isInsidePlot(x - chart.plotLeft, y - chart.plotTop)) {
      line = ["M", 0, 0, 'L', width, height, "M", 0, distance, 'L', width, height + distance];

      additionalDrawings.midLine.attr({
         d: ["M", 0, distance/2, 'L', width, (height + distance/2)]
      });

      additionalDrawings.fill.attr({
         d: ['M', 0, 0, 'L', width, height, 'L', width, height + distance, 'L', 0, distance]
      })
   } else {
      line = pathDefinition;
   }

   ann.shape.attr({
      d: line
   });

   return line;
};

infChart.trendChannelDrawing.prototype.getMidpointResizeTrendChannelAndUpdate = function (e) {
   var ann = this.annotation,
      chart = ann.chart,
      line = this.getMidpointResizeTrendChannel.call(this, e),
      xAxis = chart.xAxis[ann.options.xAxis],
      yAxis = chart.yAxis[ann.options.yAxis],
      x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
      y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
      trendY = yAxis.toValue(line[8] + yAxis.toPixels(ann.options.yValue));

   ann.update({
      xValueEnd: x,
      yValueEnd: y,
      trendYValue: trendY,
      shape: {
         params: {
            d: line
         }
      }
   });

   infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y, trendY);
   infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
   infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
};

infChart.trendChannelDrawing.prototype.getQuickSettingsPopup = function () {
   var ann = this.annotation,
       options = ann.options,
       common = infChart.drawingUtils.common,
       theme = infChart.themeManager.getTheme(),
       shape = "trendChannel";
   var opacity = options.fillOpacity? options.fillOpacity : theme.drawing[shape] && theme.drawing[shape].fillOpacity ? theme.drawing[shape].fillOpacity : theme.drawing.base.fillOpacity;
   var fill = options.fillColor? options.fillColor : theme.drawing[shape] && theme.drawing[shape].fillColor ? theme.drawing[shape].fillColor : theme.drawing.base.fillColor;
   var channelLineColor = options.channelLineColor? options.channelLineColor : theme.drawing[shape] && theme.drawing[shape].channelLineColor ? theme.drawing[shape].channelLineColor : theme.drawing.base.borderColor;
   return infChart.structureManager.drawingTools.getTrendChannelQuickSettings(channelLineColor, fill, opacity);
};

infChart.trendChannelDrawing.prototype.getSettingsPopup = function () {
   var ann = this.annotation,
       options = ann.options,
       common = infChart.drawingUtils.common,
       theme = infChart.themeManager.getTheme(),
       shape = "trendChannel";
   var opacity = options.fillOpacity? options.fillOpacity : theme.drawing[shape] && theme.drawing[shape].fillOpacity ? theme.drawing[shape].fillOpacity : theme.drawing.base.fillOpacity;
   var fill = options.fillColor? options.fillColor : theme.drawing[shape] && theme.drawing[shape].fillColor ? theme.drawing[shape].fillColor : theme.drawing.base.fillColor;
   var channelLineColor = options.channelLineColor? options.channelLineColor : theme.drawing[shape] && theme.drawing[shape].channelLineColor ? theme.drawing[shape].channelLineColor : theme.drawing.base.borderColor;
   var middleLineColor = options.middleLineColor? options.middleLineColor : theme.drawing[shape] && theme.drawing[shape].middleLineColor ? theme.drawing[shape].middleLineColor : theme.drawing.base.borderColor;
   return infChart.structureManager.drawingTools.getTrendChannelSettings(channelLineColor, middleLineColor, fill, opacity);
};

infChart.trendChannelDrawing.prototype.scale = function () {
   var ann = this.annotation,
       chart = ann.chart,
       options = ann.options,
       line = ann.shape.d.split(' '),
       xAxis = chart.xAxis[options.xAxis],
       yAxis = chart.yAxis[options.yAxis],
       additionalDrawings = this.additionalDrawings;

   line[4] = xAxis.toPixels(options.xValueEnd) - xAxis.toPixels(options.xValue);
   line[5] = yAxis.toPixels(options.yValueEnd) - yAxis.toPixels(options.yValue);
   line[7] = line[1];
   line[8] = yAxis.toPixels(options.trendYValue) - yAxis.toPixels(ann.options.yValue);
   line[10] = line[4];
   line[11] = line[5] + line[8];

   ann.update({
      shape: {
         params: {
            d: line
         }
      }
   });

   additionalDrawings.midLine.attr({
      d: ["M", 0, (line[8]/2), 'L', line[4], (line[5] + line[8]/2)]
   });

   additionalDrawings.fill.attr({
      d: ['M', 0, 0, 'L', line[4], line[5], 'L', line[4], line[11], 'L', 0, line[8]]
   })

   infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
   infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
   infChart.drawingUtils.common.fixSelectionMarker.call(this, ann);
};

infChart.trendChannelDrawing.prototype.selectAndBindResize = function () {
   var ann = this.annotation,
      width, height, distance, startPoint, endPoint, midPoint, pathDefinition;

   ann.events.deselect.call(ann);
   ann.selectionMarker = [];
   pathDefinition = ann.shape.d.split(' ');
   width = parseFloat(pathDefinition[4]);
   height = parseFloat(pathDefinition[5]);
   distance = parseFloat(pathDefinition[8]);
   infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, 0, 0, this.stepFunction, this.stop, true);
   infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width, height, this.stepFunction, this.stop, false);
   infChart.drawingUtils.common.addAndBindSelectionMarker.call(this, ann, width / 2, height / 2 + distance, this.getMidpointResizeTrendChannel, this.getMidpointResizeTrendChannelAndUpdate, false);
};

infChart.trendChannelDrawing.prototype.step = function (e, isStartPoint) {
   var ann = this.annotation,
       pathDefinition = ann.shape.d.split(' '),
       distance = parseFloat(pathDefinition[8]),
       points = infChart.drawingUtils.common.calculateInitialPoints(e, ann, isStartPoint, 0, 0),
       additionalDrawings = this.additionalDrawings;

   var line = ["M", 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10), "M", 0, distance, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10) + distance];
   ann.shape.attr({
      d: line
   });

   additionalDrawings.midLine.attr({
      d: ["M", 0, distance/2, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10) + distance/2]
   });

   additionalDrawings.fill.attr({
      d: ['M', 0, 0, 'L', parseInt(points.dx, 10), parseInt(points.dy, 10), 'L', parseInt(points.dx, 10), parseInt(points.dy, 10) + distance, 'L', 0, distance]
   })

   return line;
};

infChart.trendChannelDrawing.prototype.stop = function (e, isStartPoint) {
   var ann = this.annotation,
      chart = ann.chart,
      line = this.stepFunction(e, isStartPoint),
      xAxis = chart.xAxis[ann.options.xAxis],
      yAxis = chart.yAxis[ann.options.yAxis],
      x = xAxis.toValue(line[4] + xAxis.toPixels(ann.options.xValue)),
      y = yAxis.toValue(line[5] + yAxis.toPixels(ann.options.yValue)),
      trendY = yAxis.toValue(line[8] + yAxis.toPixels(ann.options.yValue));

   ann.update({
      xValueEnd: x,
      yValueEnd: y,
      trendYValue: trendY,
      shape: {
         params: {
            d: line
         }
      }
   });

   infChart.drawingUtils.common.saveBaseYValues.call(this, ann.options.yValue, y, trendY);
   infChart.drawingUtils.common.removeDragSupporters.call(this, this.dragSupporters);
   infChart.drawingUtils.common.addDragSupporters.call(this, ann, chart, line, this.dragSupporters);
   infChart.drawingUtils.common.fixSelectionMarker.call(this, ann);
   infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.trendChannelDrawing.prototype.translateEnd = function () {
   infChart.drawingUtils.common.onPropertyChange.call(this);
};

infChart.trendChannelDrawing.prototype.updateSettings = function (properties) {
   infChart.structureManager.drawingTools.updateTrendChannelSettings($(this.settingsPopup), properties.channelLineColor, properties.channelLineWidth, properties.channelLineStyle, properties.fillColor, properties.fillOpacity,
       properties.middleLineColor, properties.middleLineWidth, properties.middleLineStyle);
};

