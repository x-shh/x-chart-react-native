/***
 * Constructor for Volume
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
 infChart.VolumeInPanelIndicator = function (id, chartId, type, chartInstance) {

    infChart.Indicator.apply(this, arguments);

    var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor(),
        chartOptions = chartInstance.options,
        plotOptions = chartOptions.plotOptions,
        typeOptions = plotOptions["volume"],
        toolbarConfig = infChart.manager.getChart(chartId).settings.toolbar.config,
        hideClose = toolbarConfig && toolbarConfig.volume && toolbarConfig.volume.type && toolbarConfig.volume.type === "VOLUME_PNL";

    this.axisId = "#VOLUME_PNL_" + id;
    this.addAxis({
        id: this.axisId,
        startOnTick: false,
        endOnTick: false
    });

    this.series[0] = chartInstance.addSeries({
        id: id,
        name: "VOLUME",
        infIndType: "VOLUME_PNL",
        infIndSubType: "VOLUME_PNL",
        /* data: [],*/
        infType: "indicator",
        "type": "volume",
        upColor: upColor,
        color: downColor,
        hasColumnNegative: true,
        lineWidth: typeOptions.lineWidth,
        "yAxis": this.axisId,
        showInLegend: false,
        dp: 0,
        //hideToolTip: true,
        className: "volume_panel",
        hideClose: hideClose
    }, false);
    this.style[this.series[0].options.id] = ["line", "volume", "area", "dash"];
    this.icons["volume"] = "icon ico-chart-column";
};

infChart.util.extend(infChart.VolumeIndicator, infChart.VolumeInPanelIndicator);

infChart.VolumeInPanelIndicator.prototype._isAxisParallelToBase = function () {
    return false;
};