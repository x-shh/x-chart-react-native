/**
 * Management of commands(undo/redo) of the chart goes here
 * @type {*|{}}
 */
var infChart = window.infChart || {};

infChart.commandsManager = (function ($, infChart) {

    var _commands = {};
    var _mouseIsDown = false;
    var _lastRegisteredCommand;
    var _keyDownFunction = {};
    var mouseWheelInProgress = false;
    var _lastRegisteredChartId;

    /**
     * Returns the StockChart object of the given container
     * @param chartContainerId
     * @returns {*}
     * @private
     */
    var _getChartObj = function (chartContainerId) {
        return infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartContainerId));
    };

    /**
     * Initializing commands for the given chart
     * Note that this should be executed when initializing the chart
     * @param {string} chartId chart id
     */
    var initializeCommands = function (chartId) {
        _commands[chartId] = new infChart.Commands();
        _bindMouseMove(chartId);
        _bindKeyDown(chartId);
    };

    /**
     * Track whether the mouse is inside the chart
     * @param chartId
     * @private
     */
    var _bindMouseMove = function (chartId) {
        var xChart = _getChartObj(chartId);
        var container = xChart.getContainer();
        var $container = $(container);
        $container.on("mousemove", function (e) {
            container.xMouseIn = true;
            if (mouseWheelInProgress) {
                mouseWheelInProgress = false;
                _lastRegisteredCommand && _lastRegisteredCommand.updateLastUndo({freezeUpdatingSame: true});
            }
        });
        $container.on("mouseleave", function (e) {
            container.xMouseIn = false;
        });
    };

    /**
     * Bind key down for keyboard commands
     * @param {string} chartId chart id
     * @private
     */
    var _bindKeyDown = function (chartId) {
        function onKeyDown(event) {
            var xChart = _getChartObj(chartId);
            var container = xChart.getContainer();
            if (!xChart || (!xChart.chart || !container.xMouseIn)) {
                return;
            }

            var key = event.which || event.keyCode;
            var ctrl = event.ctrlKey || event.metaKey || ((key === 17) ? true : false);
            var shift = !!event.shiftKey;

            if (key == 90) {
                if (shift && ctrl) {
                    executeCommand(chartId, "redo");
                } else if (ctrl) {
                    executeCommand(chartId, "undo");
                    event.preventDefault();
                }
            }
        }

        _keyDownFunction[chartId] = onKeyDown;
        $(document).on('keydown', onKeyDown);
    };

    /**
     * unbinding key down
     * @param {string} chartId chart id
     * @private
     */
    var _unbindKeyDown = function (chartId) {
        if (_keyDownFunction[chartId]) {
            $(document).off('keydown', _keyDownFunction[chartId]);
            delete _keyDownFunction[chartId];
        }
    };

    /**
     * set mousewheel status here since  chart mousewheel to avoid stops the event propogation
     */
    var setMouseWheel = function () {
        mouseWheelInProgress = true;
    };

    /**
     * Destroying commands when destroy the chart
     * @param {string} chartId chart id
     */
    var destroyCommands = function (chartId) {
        if (_commands[chartId]) {
            _commands[chartId].destroy();
            delete _commands[chartId];
        }
        _unbindKeyDown(chartId);
        _removeLastRegisteredCommands(chartId);
    };

    /**
     * Returns the commands object related to the given chart
     * @param {string} chartId chart id
     * @returns {infChart.commands} commands object
     */
    var getCommands = function (chartId) {
        return _commands[chartId];
    };

    /**
     * Register for undo/redo commands for the given chart
     * @param {string} chartId chart id
     * @param {function} action function to redo the action
     * @param {function} reverse function to undo the action
     * @param {object} ctx context
     * @param {boolean} executeImmediately
     * @param {string} actionType
     * @param {string} callbackOptions callbackOptions if any
     */
    var registerCommand = function (chartId, action, reverse, ctx, executeImmediately, actionType, callbackOptions) {
        var xChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
        var commands = _commands[chartId];
        if (commands) {
            commands.execute(action, reverse, ctx, executeImmediately, actionType, callbackOptions);
            if (xChart._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(chartId, "undo", commands.hasUndo());
            }
            _lastRegisteredCommand = commands;
            _lastRegisteredChartId = chartId;
        }
    };

    /**
     * Execute undo or redo command
     * @param {string} chartId chart id
     * @param {string} type command type undo/redo
     * @returns {boolean} whether to enable or disable btn
     */
    var executeCommand = function (chartId, type) {
        var command = _commands[chartId],
            enableBtn = false;
        if (command) {
            switch (type) {
                case "undo":
                    command.undo();
                    enableBtn = command.hasUndo();
                    infChart.toolbar.setSelectedControls(chartId, "redo", command.hasRedo());
                    break;
                case "redo":
                    command.redo();
                    enableBtn = command.hasRedo();
                    infChart.toolbar.setSelectedControls(chartId, "undo", command.hasUndo());
                    break;
                default :
                    break;
            }
        }
        return enableBtn;
    };

    /**
     * Clear undo or redo commands for specific actions
     * @param {string} chartId chart id
     * @param {string} actionType actionType
     * @param {string} type command type undo/redo
     */
    var clearFromCommandStacks = function (chartId, actionType, type) {
        var xChart = infChart.manager.getChart(infChart.manager.getContainerIdFromChart(chartId));
        var command = _commands[chartId];
        if (command) {
            command.clearStack(actionType, type);
            if (xChart._isToolbarEnabled()) {
                infChart.toolbar.setSelectedControls(chartId, "redo", command.hasRedo());
                infChart.toolbar.setSelectedControls(chartId, "undo", command.hasUndo());
            }
        }
    };

    /**
     * Bind mouse events to catch the whether the mouse move events has been finished or not
     * (useful in setColor which is triggered from colorpicker
     * @private
     */
    var _initialBindings = function () {
        $(document).ready(function () {
            _mouseIsDown = false;
            $(document).mousedown(function () {
                _mouseIsDown = true;
            }).mouseup(function () {
                _mouseIsDown = false;
                // this is done to use in 'setColor' to avoid updating the colors changed before (from clicks and previous colorpicker movements)
                _lastRegisteredCommand && _lastRegisteredCommand.updateLastUndo({freezeUpdatingSame: true});
            });
        });
    };

    /**
     * Returns the last action in the cammand of the given chart
     * @param {string} chartId chart id
     * @returns {object} last action
     */
    var getLastAction = function (chartId) {
        var command = _commands[chartId];
        if (command) {
            return command.getLastAction();
        }
    };

    /**
     * Update the last action of the given chart from given options
     */
    var updateLastActionOptions = function (chartId, options) {
        var command = _commands[chartId];
        if (command) {
            return command.updateLastUndo({callbackOptions: options});
        }
    };

    /**
     * remove the last action of the given chart
     */
    var removeLastAction = function (chartId) {
        var command = _commands[chartId];
        if (command) {
            return command.removeLastAction();
        }
    };

    /**
     * remove last registered commands and chart id when destroy chart
     * to fix mouse up/down event issue
     * @param {string} chartId
     */
    var _removeLastRegisteredCommands = function (chartId) {
        if(chartId == _lastRegisteredChartId) {
            _lastRegisteredCommand = undefined;
            _lastRegisteredChartId = undefined;
        }
    };

    _initialBindings();

    return {
        initializeCommands: initializeCommands,
        setMouseWheel: setMouseWheel,
        destroyCommands: destroyCommands,
        getCommands: getCommands,
        executeCommand: executeCommand,
        registerCommand: registerCommand,
        clearFromCommandStacks: clearFromCommandStacks,
        getLastAction: getLastAction,
        updateLastActionOptions: updateLastActionOptions,
        removeLastAction: removeLastAction
    };
})(jQuery, infChart);