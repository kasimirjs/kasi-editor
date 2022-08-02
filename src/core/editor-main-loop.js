
import KaToolsV1 from "kasimir-embed";
import {ka_dom_ready} from "kasimir-embed/src/core/dom-ready";
import {ka_create_element} from "kasimir-embed/src/core/create-element";


class EditorMainLoopCls {

    constructor() {
        this.elements = {
            floater: null,
            indicator: null,
            hoverIndicator: null,
            sidebar: null,
        }
    }


    registerKaEditor(kaEditorElement) {

    }

    async run() {
        await ka_dom_ready();

        this.elements.floater = ka_create_element("ka-editor-components-floater", null, null, document.body);
        this.elements.indicator = ka_create_element("ka-editor-components-indicator", null, null, document.body);
        this.elements.hoverIndicator = ka_create_element("ka-editor-components-hover-indicator", null, null, document.body);
        this.elements.sidebar = ka_create_element("ka-editor-sidebar", null, null, document.body);

    }

}

export const EditorMainLoop = new EditorMainLoopCls();
EditorMainLoop.run();
