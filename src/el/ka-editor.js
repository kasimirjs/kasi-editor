

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

        if (this.hasAttribute("data-ed-template")) {
            this.parentElement.appendChild((await KaToolsV1.loadHtml(this.getAttribute("data-ed-template"))).content);

        }
        let curSelectedElement = null;

        // Manage the selected Element and apply actions
        this.$eventDispatcher.addEventListener("selectElement", (e) => {
            if (curSelectedElement !== null && curSelectedElement !== e.element) {
                Object.values((new KaEditorFacet()).getActionsForElement(curSelectedElement, "onDeSelect")).forEach((action) => action.onDeSelect(curSelectedElement))
                curSelectedElement = null;
            }
            if (e.element !== null && e.element !== curSelectedElement) {
                Object.values((new KaEditorFacet()).getActionsForElement(e.element, "onSelect")).forEach((action) => action.onSelect(e.element))
                curSelectedElement = e.element
            }

        })

        this.addEventListener("mouseover", (e) => {
            let target = e.target;

            target = facet.getEditableParentElement(target);
            if (target === null)
                return;

            this.$eventDispatcher.triggerEvent("hoverElement", {element: target});

        })
        document.addEventListener("click", (e) => {
            let target = e.target;
            target = facet.getEditableParentElement(target);
            this.$eventDispatcher.triggerEvent("selectElement", {element: target});

        })
    }
});
