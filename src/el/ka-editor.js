

KaToolsV1.ce_define("ka-editor", class extends KaEditorElement {

    /**
     * @type {KaEditorElementFloater}
     */
    #floater;

    /**
     * @type {KaEditorElementIndicator}
     */
    #indicator;
    /**
     * @type {KaEditorHoverIndicator}
     */
    #hoverIndicator;
    constructor() {
        super();
    }


    async connected() {
        let facet = new KaEditorFacet();

        this.#floater = document.createElement("ka-editor-int-floater");
        this.parentElement.appendChild(this.#floater);
        this.#indicator = document.createElement("ka-editor-int-indicator");
        this.parentElement.appendChild(this.#indicator);
        this.#hoverIndicator = document.createElement("ka-editor-int-hover-indicator");
        this.parentElement.appendChild(this.#hoverIndicator);

        this.addEventListener("mouseover", (e) => {
            let target = e.target;

            target = facet.getEditableParentElement(target);
            if (target === null)
                return;

            this.$eventDispatcher.triggerEvent("hoverElement", {element: target});

        })
        document.addEventListener("click", (e) => {
            let target = e.target;
            console.log("bocy click", e);
            target = facet.getEditableParentElement(target);
            this.$eventDispatcher.triggerEvent("selectElement", {element: target});

        })
    }
});
