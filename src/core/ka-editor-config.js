import {TemplateManager} from "./template/template-manager";
import {ActionManager} from "./action/action-manager";

export const KaEditorConfig = {
    cssStyles: [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
    ],
    sidebarTopHtml: '<img src="https://leuffen.de/assets/leuffen-logo-big.svg" height="48" style="margin-left: -10px">',


    zindex: {
        sidebar: 1030,
        indicatorHover: 1031,
        indicatorSelect: 1031,
    },

    /**
     * @type {TemplateManager}
     */
    templateManager: new TemplateManager(),

    /**
     * @type {ActionManager}
     */
    actionManager: new ActionManager()
}
