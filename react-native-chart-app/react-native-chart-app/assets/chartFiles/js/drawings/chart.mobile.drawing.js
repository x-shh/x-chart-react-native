var infChart = window.infChart || {};

infChart.mobileDrawing = function () {
    infChart.Drawing.apply(this, arguments);
};

infChart.mobileDrawing.prototype = Object.create(infChart.Drawing.prototype);

infChart.mobileDrawing.prototype.selectPointEvents = function (dragItem, stepFunction, stopFunction, isStartPoint, itemProperties) {
    var self = this;
    var ann = self.annotation, chart = ann.chart;
    var stockChartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
    var chartInstance = infChart.manager.getChart(stockChartId);

    function drag(e) {
        if (e.button !== 2 && !(e.ctrlKey && e.button === 0)) { // ignore right click - cannot use an event since mousedown event is fired first , ignore ctrl + click
            var chartId = infChart.drawingsManager.getChartIdFromHighchartInstance(chart);
            if (!infChart.drawingsManager.isMultipleDrawingsEnabled(chartId) && !infChart.drawingsManager.getIsActiveDrawingInprogress()) {
                //e.preventDefault();
                e.stopPropagation();
                e = chart.pointer.normalize(e);
                //ann.events.deselect.call(ann, e);
                if(self.showSelectionMarkers){
                    self.showSelectionMarkers(itemProperties);
                }
                chart.annotationChangeInProgress = true;
                infChart.drawingsManager.onAnnotationStore(ann);

                if (!ann.options.isLocked && !chartInstance.isGloballyLocked){
                    infChart.util.bindEvent(dragItem.element, 'mousemove', step);
                    infChart.util.bindEvent(dragItem.element, 'mouseup', drop);
                };
            }
        }
    }

    function step(e) {
        e = chart.pointer.normalize(e);
        if(ann.options){
            ann.options.mouseDownOnAnn = false;
            if(self.toggleFibLevelEraseIcon){
                self.toggleFibLevelEraseIcon(true);
            }
            if (stepFunction) {
                stepFunction.call(self, e, isStartPoint, itemProperties);
            }
        }
    }

    function drop(e) {
        e = self.chart.pointer.normalize(e);
        infChart.util.unbindEvent(dragItem.element, 'mousemove', step);
        infChart.util.unbindEvent(dragItem.element, 'mouseup', drop);
        if (self.annotation && self.stop) {
            stopFunction.call(self, e, isStartPoint, itemProperties);
        }
        //$(document).unbind('.dragItem');
        // self.openDrawingSettings.call(self);
        self.selectAndBindResize();
        chart.selectedAnnotation = ann;
        chart.annotationChangeInProgress = false;
        infChart.drawingsManager.onAnnotationRelease(ann);
        if(self.toggleFibLevelEraseIcon){
            self.toggleFibLevelEraseIcon(false);
        }
    }

    infChart.util.bindEvent(dragItem.element, 'mousedown', drag);
};