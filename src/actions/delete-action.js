import {KaEditorConfig} from "../core/ka-editor-config";
import {ActionConfig} from "../core/action/action-config";

KaEditorConfig.actionManager.define(new ActionConfig("delete", {

    getText: (element) => {
        return "Delete element";
    },

    isValid: (element) => {
        let myTemplateConfig = KaEditorConfig.templateManager.getTemplateConfig(element);
        if (myTemplateConfig === null)
            return false;
        return myTemplateConfig.isRepeatable();
    },

    /**
     *
     * @param element {HTMLElement}
     * @return {Promise<void>}
     */
    onAction: async (element) => {
        element.remove();
    }
}));
