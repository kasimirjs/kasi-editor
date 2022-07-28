

class TemplateManager {

    constructor() {
        /**
         *
         * @type {Object<string, TemplateConfig>}
         * @private
         */
        this._templates = {}
    }

    /**
     * The Template ID
     *
     * @param config {TemplateConfig}
     */
    define(config) {
        this._templates[config.tid] = config;
    }

    /**
     *
     * @param element {HTMLElement}
     * @return {null|TemplateConfig}
     */
    getTemplateConfig(element) {
        if ( ! element.hasAttribute("data-ed-tid"))
            return null;

        return this._templates[element.getAttribute("data-ed-tid")] ?? null
    }

    /**
     *
     * @param parentElementTemplateConfig {TemplateConfig}
     * @return {TemplateConfig[]}
     */
    getAllowedChildTemplates(parentElementTemplateConfig) {
        return Object.keys(this._templates).map((key) => this._templates[key]).filter((conf) => conf.isAllowedChild(parentElementTemplateConfig))
    }

}
