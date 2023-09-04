//region ************************************** Mondays Indicator******************************************

/**
 * Mondays Indicator
 * @param id
 * @param chartId
 * @param type
 * @param chartInstance
 * @constructor
 */
infChart.MondaysIndicator = function (id, chartId, type, chartInstance) {
    this.days = [
        {day: 1, name: "Mondays", color: "#9BDB49"}];
    this.fiftyPercentLine =  {label: "50% of Monday", color: "#ffffff", height: 14 , width: 79, padding: 2};

    infChart.DaysIndicator.apply(this, arguments);
};

infChart.util.extend(infChart.DaysIndicator, infChart.MondaysIndicator);

//endregion ************************************** end of Mondays Indicator******************************************