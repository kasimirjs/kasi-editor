
KaEditorConfig.actionManager.define(new ActionConfig("clone", {

    getText: (element) => {
        return "Clone Node";
    },

    isValid: (element) => {
        let template = KaEditorConfig.templateManager.getTemplateConfig(element);
        if (template === null)
            return false;
        return template.isRepeatable();
    },

    onAction: (element) => {
        let template = KaEditorConfig.templateManager.getTemplateConfig(element);
        let clone = element.cloneNode(true);

        element.parentElement.insertBefore(clone, element.nextElementSibling);
        template.initElement(element);
    }
}));
