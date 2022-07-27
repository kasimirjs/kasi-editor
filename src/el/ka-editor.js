

KaToolsV1.ce_define("ka-editor", class extends KaEditorElement {


    constructor() {
        super();
        this.elements = {
            floater: null,
            indicator: null,
            hoverIndicator: null,
            sidebar: null,

        }
    }


    async connected() {
        let facet = new Facet();

        this.elements.floater = KaToolsV1.createElement("ka-editor-int-floater", null, null, document.body);
        this.elements.indicator = KaToolsV1.createElement("ka-editor-int-indicator", null, null, document.body);
        this.elements.hoverIndicator = KaToolsV1.createElement("ka-editor-int-hover-indicator", null, null, document.body);
        this.elements.sidebar = KaToolsV1.createElement("ka-editor-sidebar", null, null, document.body);


        // Import the templates
        if (this.hasAttribute("data-ed-template")) {
            for (let url of this.getAttribute("data-ed-template").split(" ")) {
                let tpl = document.createElement("ka-ed-imported-templates");
                tpl.hidden = true;
                document.body.appendChild(tpl);
                tpl.append((await KaToolsV1.loadHtml(url)).content)
                KaToolsV1.execImportedScriptTags(tpl, url);
            }
        }

        let curSelectedElement = null;

        // Manage the selected Element and apply actions
        this.$eventDispatcher.addEventListener("selectElement", (e) => {
            if (curSelectedElement !== null && curSelectedElement !== e.element) {
                Object.values((new Facet()).getActionsForElement(curSelectedElement, "onDeSelect")).forEach((action) => action.onDeSelect(curSelectedElement))
                curSelectedElement = null;
            }
            if (e.element !== null && e.element !== curSelectedElement) {
                Object.values((new Facet()).getActionsForElement(e.element, "onSelect")).forEach((action) => action.onSelect(e.element))
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

            if (e.defaultPrevented === true)
                return;

            // Deselect the element
            if (KaToolsV1.getParentElement(this, target) === null)
                this.$eventDispatcher.triggerEvent("selectElement", {element: null});
            target = facet.getEditableParentElement(target);
            this.$eventDispatcher.triggerEvent("selectElement", {element: target});

        })

        // Finally - if everything is loaded: Trigger one update
        document.addEventListener("DOMContentLoaded", () => this.$eventDispatcher.triggerEvent("update"));
    }
});
