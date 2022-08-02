import {ka_load_html} from "kasimir-embed/src/ce/loadHtml";
import {EditorContainer} from "../core/editor-container";
import {SelectMessage} from "../core/messages/select-message";
import {HoverMessage} from "../core/messages/hover-message";
import {ka_get_parent_element} from "kasimir-embed/src/core/get-parent-element";
import {ka_sleep} from "kasimir-embed/src/core/sleep";
import {ka_ce_define} from "kasimir-embed/src/ce/ka-ce-define";
import {KaCustomElement} from "kasimir-embed/src/ce/custom-element";
import {ka_execImportedScriptTags} from "kasimir-embed/src/core/exec-imported-script-tags";
import {UpdateMessage} from "../core/messages/update-message";


ka_ce_define("ka-editor", class extends KaCustomElement {


    constructor() {
        super();
        /**
         *
         * @type {EditorContainer}
         */
        this.container = EditorContainer.getInstance();
    }


    async connected() {
        let facet = await this.container.getFacet();
        let bus = await this.container.getBus();

        // Import the templates
        if (this.hasAttribute("data-ed-template")) {
            for (let url of this.getAttribute("data-ed-template").split(" ")) {
                let tpl = document.createElement("ka-ed-imported-templates");
                tpl.hidden = true;
                document.body.appendChild(tpl);
                tpl.append((await ka_load_html(url)).content)
                ka_execImportedScriptTags(tpl, url);
            }
        }

        let curSelectedElement = null;

        // Manage the selected Element and apply actions
        bus.on(SelectMessage, (el) => {
            if (curSelectedElement !== null && curSelectedElement !== el.element) {
                facet.getActionsForElement(curSelectedElement).forEach((action) => action.onDeSelect(curSelectedElement))
                curSelectedElement = null;
            }
            if (el.element !== null && el.element !== curSelectedElement) {

                facet.getActionsForElement(el.element).forEach((action) => action.onSelect(el.element));
                curSelectedElement = el.element
            }

        })

        this.addEventListener("mouseover", (e) => {
            let target = e.target;
            target = facet.getEditableParentElement(target);
            if (target === null)
                return;

            bus.trigger(new HoverMessage(target));

        })
        document.addEventListener("click", (e) => {
            let target = e.target;
            let editableTarget = facet.getEditableParentElement(target);

            // Click outside editable area
            if (editableTarget === null || ka_get_parent_element(this, editableTarget) === null) {
                if (e.defaultPrevented)
                    return; // Click on Navbar, Icons or other stuff

                bus.trigger(new SelectMessage(null));
                return;
            }

            bus.trigger(new SelectMessage(editableTarget));

        })

        // Finally - if everything is loaded: Trigger one update

        await ka_sleep(500);
        bus.trigger(new UpdateMessage())

    }
});
