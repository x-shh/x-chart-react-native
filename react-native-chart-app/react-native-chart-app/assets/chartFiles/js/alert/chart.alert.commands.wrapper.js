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
