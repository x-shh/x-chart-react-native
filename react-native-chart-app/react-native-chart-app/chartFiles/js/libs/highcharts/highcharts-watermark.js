(function (H) {
    H.Chart.prototype.callbacks.push(function (chart) {
        if (chart.options.watermark && chart.options.watermark.enabled) {
            var opt = chart.options.watermark;
            var theme = (Highcharts.theme.watermark) ? Highcharts.theme.watermark : {};
            theme = $.extend(true, {color: "#cccccc", opacity: 0.1}, theme);
            if (!opt || (!opt.url && !opt.type)) return;
            opt = $.extend({}, {opacity: theme.opacity, top: false, width: 200, height: 200}, opt);

            chart.setWatermark = function () {
                opt = chart.options.watermark;
                if (opt.type == "text") {
                    chart.watermark = chart.renderer.text(opt.text, (chart.plotBox.width - opt.width) / 2 + chart.plotBox.x, (chart.plotBox.height - opt.height) / 2 + chart.plotBox.y).css({
                        opacity: opt.opacity,
                        "font-size": 200,
                        color: theme.color,
                        zIndex: 3
                    }).add();
                } /*else if(opt.type == "mix"){
                 if(chart.options.watermark.images) {
                 chart.watermark = chart.renderer.g("watermark-group");

                 infChart.util.forEach( chart.watermark.images, function (i, img) {
                 chart.renderer.image(opt.url,
                 (chart.plotBox.width - opt.width) / 2 + chart.plotBox.x,
                 (chart.plotBox.height - opt.height) / 2 + chart.plotBox.y,
                 opt.width,
                 opt.height).css({opacity: opt.opacity}).add(chart.watermark);
                 });
                 }
                 }*/ else {
                    chart.watermark = chart.renderer.image(opt.url, (chart.plotBox.width - opt.width) / 2 + chart.plotBox.x, (chart.plotBox.height - opt.height) / 2 + chart.plotBox.y, opt.width, opt.height).css({opacity: opt.opacity}).add();
                }
                chart.redrawWaterMark(true);
            };

            chart.hasWatermarkPropertyChange = function () {
                var axisHeight = chart.series[0].yAxis.height,
                    plotWidth = chart.plotWidth,
                    text = chart.options.watermark.text,
                    prevProperties = chart.options.watermark.prevProperties;
                return (!prevProperties || (prevProperties.axisHeight != axisHeight || prevProperties.plotWidth != plotWidth || prevProperties.text != text));

            };

            chart.redrawWaterMark = function (force) {
                if (chart.watermark) {
                    //chart.watermark.toFront();

                    /*if(this.annotations && this.annotations.groups){
                     $.each(this.annotations.groups, function( key, grp){
                     grp.toFront();
                     });
                     }*/
                    //chart.seriesGroup.toFront();
                    if (force || chart.hasWatermarkPropertyChange()) {

                        // var watermarkElementBBox = chart.watermark.element.getBBox(),
                        // width = watermarkElementBBox.width,
                        // height = watermarkElementBBox.height,
                        var axisHeight = chart.series[0].yAxis.height,
                            properties = {
                                axisHeight: axisHeight,
                                plotWidth: chart.plotWidth,
                                text: chart.options.watermark.text

                            };

                        if(axisHeight) {

                            chart.options.watermark.prevProperties = properties;

                            var fontsize = chart.plotWidth / (chart.options.watermark.text.length);

                            if(axisHeight / 4 < fontsize){
                                fontsize = axisHeight / 4;
                            }

                            // var fontsize = chart.plotWidth > width &&
                            // ((axisHeight / 4) * chart.options.watermark.text.length) < chart.plotWidth ?
                            // axisHeight / 4 : chart.plotWidth / (chart.options.watermark.text.length);

                            chart.watermark.css({
                                "font-size": Math.floor(fontsize) + 'px'
                            });

                            var width = chart.watermark.element.getBBox().width;

                            chart.watermark.attr({
                                zIndex: chart.seriesGroup.zIndex - 1,
                                x: (chart.plotBox.width - width) / 2 + chart.plotBox.x,
                                y: (axisHeight ) / 2 + chart.plotBox.y,
                                text: chart.options.watermark.text
                            });
                        }
                    }
                } else if (chart.setWatermark) {
                    chart.setWatermark();
                }
            };
        }


    });
}(Highcharts));