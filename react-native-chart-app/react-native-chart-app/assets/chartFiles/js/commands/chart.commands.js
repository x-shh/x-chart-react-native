var infChart = window.infChart || {};
/**
 * @constructor
 */
infChart.Commands = function () {
    this.undoStack = [];
    this.redoStack = [];
};

/**
 * Executes an action and adds it to the undo stack.
 * @param {function()} action Action function.
 * @param {function()} reverse Reverse function.
 * @param {Object=} ctx The 'this' argument for the action/reverse functions.
 * @param {boolean} executeAction whether to execute the action immediately or not
 * @param {string} actionType type to uniquely identify the actions
 * @param {string} callbackOptions callback Options if anything to be set as params
 */
infChart.Commands.prototype.execute = function (action, reverse, ctx, executeAction, actionType, callbackOptions) {
    this.undoStack.push({
        action: action,
        reverse: reverse,
        ctx: ctx,
        actionType: actionType,
        callbackOptions: callbackOptions
    });
    if (executeAction) {
        action.call(ctx);
    }
    console.debug("================execute================");
    console.debug(this.undoStack[this.undoStack.length - 1]);
    this.redoStack.length = 0;
    console.debug(new Error().stack);
};

/**
 * Undo the action
 */
infChart.Commands.prototype.undo = function () {
    var c = this.undoStack.pop();
    console.debug("================undo================");
    console.debug(c);
    if (c) {
        var redoObject = Object.assign({}, c);
        if (c.callbackOptions && c.callbackOptions.redoProperties) {
            var redoProp = JSON.parse(JSON.stringify(c.callbackOptions.redoProperties));
            redoObject.callbackOptions.redoProperties = redoProp;
        }
        c.reverse.call(c.ctx, c.callbackOptions);
        this.redoStack.push(redoObject);
    }
};

/**
 * Redo the action if any
 */
infChart.Commands.prototype.redo = function () {
    var c = this.redoStack.pop();
    console.debug("================redo================");
    console.debug(c);
    if (c) {
        var newStackItem = c.action.call(c.ctx, c.callbackOptions);
        if (newStackItem) {
            c = $.extend(c, newStackItem);
        }
        this.undoStack.push(c);
    }
};

/**
 * Returns true if there are redo actions
 * @returns {null|boolean} has redo
 */
infChart.Commands.prototype.hasRedo = function () {
    return this.redoStack && this.redoStack.length > 0;
};

/**
 * Returns true if there are undo actions
 * @returns {null|boolean} has undo
 */
infChart.Commands.prototype.hasUndo = function () {
    return this.undoStack && this.undoStack.length > 0;
};

/**
 *
 */
infChart.Commands.prototype.destroy = function () {
    this.undoStack = null;
    this.redoStack = null;
};

/***
 * Clean the given action type from the given stack or remove all if not specified
 * @param {string} actionType unique key of the action
 * @param {string} type type of the command
 */
infChart.Commands.prototype.clearStack = function (actionType, type) {
    if (actionType) {
        function clearStack(stack) {
            for (var i = stack.length - 1; i >= 0; i--) {
                if (stack[i].actionType === actionType) {
                    stack.splice(i, 1);
                }
            }
        }

        if (type === "undo" || !type) {
            clearStack(this.undoStack);
        }
        if (type === "redo" || !type) {
            clearStack(this.redoStack);
        }

    } else {

        if (type === "undo" || !type) {
            this.undoStack = [];
        }
        if (type === "redo" || !type) {
            this.redoStack = [];
        }
    }
};

/**
 * Update the last undo action from given options
 * @param update
 */
infChart.Commands.prototype.updateLastUndo = function (update) {
    if (this.undoStack.length) {
        var lastUndo = this.undoStack[this.undoStack.length - 1];
        $.extend(lastUndo, update);
    }
};

/**
 * Whether the last action is frozen to update or not
 * @returns {boolean}
 */
infChart.Commands.prototype.isLastUpdateFrozen = function () {
    if (this.undoStack.length) {
        var lastUndo = this.undoStack[this.undoStack.length - 1];
        return lastUndo && lastUndo.freezeUpdatingSame;
    }
    return false
};

/**
 * Returns the last undo action
 * @returns {object}
 */
infChart.Commands.prototype.getLastAction = function () {
    if (this.undoStack.length) {
        return this.undoStack[this.undoStack.length - 1];
    }
};

/**
 * Remove the last undo action
 * @returns {object}
 */
infChart.Commands.prototype.removeLastAction = function () {
    if (this.undoStack.length) {
        this.undoStack.pop();
    }
};
