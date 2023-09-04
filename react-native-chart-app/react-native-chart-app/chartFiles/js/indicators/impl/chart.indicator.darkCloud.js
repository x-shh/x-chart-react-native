/*
 //region ************************************** Dark Cloud (DarkC) Indicator******************************************

 /!***
 * Constructor for Dark Cloud (DarkC) Indicator Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 *!/
 infChart.DarkCloudIndicator = function (id, chartId, type, chartInstance) {

 infChart.Indicator.apply(this, arguments);
 this.params.period = 5;
 this.titleParams = ["period"];
 this.icons["infsignal"] = "ico-arrow-up";
 this.icons["plotrange"] = "ico-shape1";

 var upColor = infChart.util.getDefaultUpColor(), downColor = infChart.util.getDefaultDownColor();

 this.series[0] = chartInstance.addSeries({
 id: id,
 name: "DarkC",
 infIndType: "DarkC",
 infIndSubType: "DarkCBar",
 type: "plotrange",
 infType: "indicator",
 yAxis: "#0",
 data: [],
 showInLegend: true, /!*
 style : {fontWeight : "bold" , fontSize :"8px", color : "#fff"},*!/
 groupPadding: 0,
 pointPadding: 0,
 borderWidth: 0,
 fillOpacity: 0.5,
 pointPlacement: 'on',
 title: "S"
 }, false);
 this.series[1] = chartInstance.addSeries({
 id: id + '_DarkCSignal',
 name: "DarkCSignal",
 infIndType: "DarkC",
 infIndSubType: "DarkCSignal",
 /!*data: [],*!/
 type: "infsignal",
 shape: "downarw",
 infType: "indicator",
 yAxis: "#0",
 showInLegend: false,
 hideLegend: true,
 onKey: "high",
 onSeries: this.series[0].options.id,
 lineColor: upColor,
 fillColor: upColor,
 color: upColor,
 /!*textAlign : "top",*!/
 textAlign: "bottom",
 style: {fontWeight: "bold", fontSize: "10px", color: upColor},
 title: "BullEng"/!*,
 y : 12*!/
 }, true);


 this.style[this.series[0].options.id] = ["plotrange"];
 this.style[this.series[1].options.id] = ["infsignal"];
 this.onOff = [this.series[0].options.id, this.series[1].options.id];

 };

 infChart.util.extend(infChart.Indicator, infChart.DarkCloudIndicator);

 infChart.DarkCloudIndicator.prototype.calculate = function (ohlc, data, redraw) {
 var high = ohlc.h,
 low = ohlc.l,
 close = ohlc.c,
 open = ohlc.o;
 var that = this;

 if (data && data.length > 0) {
 var macdCross = that.getSeries(high, low, close, open, that.params.period);
 $.each(this.series, function (i, series) {
 switch (series.options.infIndSubType) {
 case 'DarkCBar':
 var _macd = that.merge(data, macdCross.barh, macdCross.barl);
 series.setData(_macd, false);
 break;
 case 'DarkCSignal':
 var _macd2 = that.merge(data, macdCross.bar);
 series.setData(_macd2, false);
 break;
 }
 });
 if (redraw) {
 var chart = this.chart;
 chart.redraw();
 }
 }
 };

 infChart.DarkCloudIndicator.prototype.getSeries = function (hts, lts, cts, ots, period) {
 var i, k = Math.min(cts.length - 1, period - 1), resultb = new Array(cts.length), resultbh = new Array(cts.length), resultbl = new Array(cts.length);


 if (cts.length >= period) {
 for (k; k < cts.length; k++) {
 var trend = true;
 for (i = k; i > k - period + 2; i--) {
 if (cts[i] < cts[i - 2]) {
 trend = false;
 break;
 }
 }
 if (trend && cts[k - 1] > ots[k - 1] && cts[k] < ots[k] &&
 ots[k] > hts[k - 1] && cts[k] < (ots[k - 1] + cts[k - 1]) / 2 && cts[k] > lts[k - 1]) {
 resultb[k] = hts[k];
 resultbh[k - 1] = Math.max(hts[k], hts[k - 1]);
 resultbh[k] = Math.max(hts[k], hts[k - 1]);
 resultbl[k] = Math.min(lts[k], lts[k - 1]);
 resultbl[k - 1] = Math.min(lts[k], lts[k - 1]);
 }
 }
 }

 return {bar: resultb, barh: resultbh, barl: resultbl};
 };

 infChart.DarkCloudIndicator.prototype.getTooltipValue = function (point) {

 if (point.series.hideToolTip) {
 return '';
 }
 var value = '';
 return infChart.util.getTooltipRowValue(this.getLabel(point.series.options.id, "indicatorShortDesc"), value, 0, point.series.color, true);
 };


 //endregion ************************************** end of Dark Cloud (Darkc) Indicator******************************************
 */
