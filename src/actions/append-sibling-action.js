import {KaEditorConfig} from "../core/ka-editor-config";
import {ActionConfig} from "../core/action/action-config";

KaEditorConfig.actionManager.define(new ActionConfig("append-sibling", {

    getText: (element) => {
        return "Append child";
    },

    isValid: (element) => {
        let myTemplateConfig = KaEditorConfig.templateManager.getTemplateConfig(element.parentElement);
        return KaEditorConfig.templateManager.getAllowedChildTemplates(myTemplateConfig)
    },

    /**
     *
     * @param element {HTMLElement}
     * @return {Promise<void>}
     */
    onAction: async (element) => {
        let templateConfig = KaEditorConfig.templateManager.getTemplateConfig(element.parentElement);
        let childTemplates = KaEditorConfig.templateManager.getAllowedChildTemplates(templateConfig);

        /**
         * @type {TemplateConfig}
         */
        let tpl = await KaToolsV1.modal.show("ka-insert-modal", {templateConfigs: childTemplates});
        let node = tpl.getInstance();

        element.parentElement.insertBefore(node, element.nextElementSibling);
        tpl.initElement(node);
    }
}));
