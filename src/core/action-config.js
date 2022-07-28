
class ActionConfig {

    constructor(name, config) {
        this.name = name;
        Object.assign(this, config);

    }

    /**
     * Shortcut to get the template
     *
     * @param element
     * @return {TemplateConfig|null}
     * @protected
     */
    _getTemplateConfig(element) {
        return KaEditorConfig.templateManager.getTemplateConfig(element);
    }

    getText(element) {
        return this.name
    }

    /**
     * Return true if this Action is valid for this element
     *
     * @param element
     * @return {boolean}
     */
    isValid(element) {
        return true;
    }

    isEnabled(element) {
        return true;
    }

    async onSelect(element) {
        console.log("orig")
    }

    async onDeSelect(element) {

    }

    async onAction(element) {

    }

}
