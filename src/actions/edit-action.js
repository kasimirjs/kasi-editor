
KaEditorConfig.actionManager.define(new ActionConfig("text-edit-inline", {

    isValid: (element) => {
        return element.hasAttribute("data-ed-text");
        //return KaEditorConfig.templateManager.getTemplateConfig(element).isTextEditable(element);
    },

    getText: (element) => {
        return null; // No visual action -> Don't display in Menu
    },

    onSelect: async (element) => {
        console.log("editor on");
        element.contentEditable = true;
        element.focus();
    },

    onDeSelect: (element) => {
        element.contentEditable = false;
    }
}));
