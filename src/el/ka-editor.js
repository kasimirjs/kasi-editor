

KaToolsV1.ce_define("ka-editor", class extends KaEditorElement {

    /**
     * @type {KaEditorElementFloater}
     */
    #floater;

    /**
     * @type {KaEditorElementIndicator}
     */
    #indicator;

    constructor() {
        super();
    }

    #getAllPropNames() {
        let ret = [];
        for(let en in KaIndicatiorActions)
            ret.push(...KaIndicatiorActions[en].on);
        return ret;
    }

    #getEditableElement(curTarget) {
        let listOfDataNames = this.#getAllPropNames();

        if (listOfDataNames.some(r => curTarget.getAttributeNames().includes(r)))
            return curTarget;
        if (curTarget.parentElement === this)
            return null;
        return this.#getEditableElement(curTarget.parentElement);
    }

    async connected() {
        this.#floater = document.createElement("ka-editor-int-floater");
        this.parentElement.appendChild(this.#floater);
        this.#indicator = document.createElement("ka-editor-int-indicator");
        this.parentElement.appendChild(this.#indicator);

        this.addEventListener("mouseover", (e) => {
            let target = e.target;

            target = this.#getEditableElement(target);
            if (target === null)
                return;

            this.#indicator.setElement(target);
        })

    }
});
