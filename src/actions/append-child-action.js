import {ActionConfig} from "../core/action/action-config";
import {KaEditorConfig} from "../core/ka-editor-config";

KaEditorConfig.actionManager.define(new ActionConfig("append-child", {

    getText: (element) => {
        return "Append child";
    },

    isValid: (element) => {
        let myTemplateConfig = KaEditorConfig.templateManager.getTemplateConfig(element);
        return KaEditorConfig.templateManager.getAllowedChildTemplates(myTemplateConfig)
    },

    onAction: async (element) => {
        let templateConfig = KaEditorConfig.templateManager.getTemplateConfig(element);
        let childTemplates = KaEditorConfig.templateManager.getAllowedChildTemplates(templateConfig);

        /**
         * @type {TemplateConfig}
         */
        let tpl = await KaToolsV1.modal.show("ka-insert-modal", {templateConfigs: childTemplates});
        let node = tpl.getInstance();
        console.log("create child", node);
        element.append(node);
        tpl.initElement(node);
    }
}));
