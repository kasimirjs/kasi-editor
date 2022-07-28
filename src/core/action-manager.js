
class ActionManager {

    constructor() {
        /**
         *
         * @type {ActionConfig[]}
         * @private
         */
        this._actions = [];
    }

    /**
     *
     * @param name {string}
     * @param action {ActionConfig}
     */
    define(action) {
        this._actions.push(action);
    }


    /**
     *
     * @param element
     * @return {ActionConfig[]}
     */
    getActionsForElement(element) {
        if ( ! (element instanceof HTMLElement))
            return [];
        return this._actions.filter((a) => a.isValid(element));
    }

}
