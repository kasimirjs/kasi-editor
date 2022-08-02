import {EditorContainer} from "./editor-container";
import {KaEditorConfig} from "./ka-editor-config";

export class Facet {

    /**
     *
     * @param config {KaEditorConfig}
     * @param bus {KaMessageBus}
     */
    constructor(config, bus) {
        /**
         *
         * @type {EditorContainer}
         */
        this.container = EditorContainer.getInstance();

        /**
         *
         * @type {KaEditorConfig}
         */
        this.config = config
    }

    /**
     *
     * @param element {HTMLElement}
     * @param curTreeElem
     * @return {*}
     */
    getElementTree(element, curTreeElem={elem: null, children: []}) {
        for(let child of element.children) {
            if (this.isEditableElement(child)) {
                let newElem = {elem: child, children: []};
                curTreeElem.children.push(newElem);
                this.getElementTree(child, newElem);
                continue;
            }
            this.getElementTree(child, curTreeElem);
        }
        return curTreeElem;
    }


    /**
     * Return true if this element is editable (has at least one data-ed attribute
     *
     * @param element {HTMLElement}
     * @returns {boolean}
     */
    isEditableElement(element) {
        return this.config.actionManager.getActionsForElement(element).length > 0;
    }


    /**
     *
     * @param element
     * @param visual {Boolean}      Show only action with text
     * @return {ActionConfig[]}
     */
    getActionsForElement(element, visual = false) {
        return KaEditorConfig.actionManager.getActionsForElement(element)
            .filter((ac) => visual ? ac.getText(element) !== null : true);
    }


    /**
     * Find the first editable parent
     *
     * @param curTarget {HTMLElement}
     * @returns {HTMLElement|null}
     */
    getEditableParentElement(curTarget) {
        if (curTarget === null)
            return null;

        if (this.isEditableElement(curTarget))
            return curTarget;
        if (curTarget.parentElement === this)
            return null;
        return this.getEditableParentElement(curTarget.parentElement);
    }



    /**
     * Initialize a newly or copied element
     *
     * Will execute data-ed-oninit="javascirpt" code
     * @param element {HTMLElement}
     */
    initElement(element) {
        if (typeof element.hasAttribute !== "undefined" && element.hasAttribute("data-ed-oninit")) {
            console.log (element);
            KaToolsV1.eval(element.getAttribute("data-ed-oninit"), {}, element, {});
        }
        Array.from(element.children).forEach((e) => this.initElement(e));
    }


    async showActions(element, positionElementOrEvent) {
        //let m = new KaToolsV1.ContextMenu();
        //await m.ready();

        let actions = this.getActionsForElement(element, true).map((c) =>
            new KaToolsV1.ContextMenuAction(c.name, c.name, null, async() => await c.onAction(element))
        );

        // Load the ContextMenu and Wait for click
        let action = await (await KaToolsV1.ContextMenu.Load()).show(positionElementOrEvent, actions);


        await KaToolsV1.sleep(50);

        console.log("update");
        (await KaToolsV1.provider.get("$eventDispatcher")).triggerEvent("update");

    }

}
