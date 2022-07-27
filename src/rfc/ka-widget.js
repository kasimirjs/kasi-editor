/**
 * @abstract
 * @class
 * @type {KaToolsV1.Widget}
 */
KaToolsV1.Widget = class {

    /**
     * Don't call this directly
     *
     * call await Widget.show() instead
     *
     * @private
     * @deprecated Use Widget.show() instead of constructor
     * @param autoAppendToElement
     */
    constructor(autoAppendToElement = window.document.body) {
        let self = this.constructor;

        /**
         *
         * @type {HTMLElement}
         */
        this.$element = document.createElement(self.options.elementName);


        /**
         *
         * @type {KaToolsV1.Template}
         */
        this.$tpl = null;

        this._globalClickEventHandler = null;

        let shadow = this.$element;
        if (self.options.shadowDom) {
            shadow = this.$element.attachShadow(self.options.shadowDomOptions);
        }

        this.readyPromise = new Promise(async (resolve, reject) => {
            let tpl = await self.getTemplate();
            if (typeof tpl === "string")
                tpl = KaToolsV1.html(tpl);

            if (tpl !== null) {
                let t = KaToolsV1.templatify(tpl);
                shadow.append(t);
                this.$tpl = new KaToolsV1.Template(t);
            }
            await this.__init(...await KaToolsV1.provider.arguments(this.__init, {$tpl: this.$tpl}));
            resolve();
        });


        if (autoAppendToElement !== null) {
            autoAppendToElement.append(this.$element);
        }

        this._globalClickEventHandler = (e) => {
            if(KaToolsV1.getParentElement(this.$element, e.target) === null) {
                // Outside click
                this.destroy();
            }
        }


    }



    /**
     * @abstract
     * @interface
     * @return {{shadowDom: {boolean}, elementName: {string}, shadowDomOptions: {mode: 'open'}}}
     */
    static get options () {
        return {shadowDom: false, elementName: "ka-widget", shadowDomOptions: {mode: 'open'}};
    }


    /**
     *  Await the ready instance
     *
     * @static
     * @public
     * @return {Promise<this>}
     */
    static async Load() {
        let i = new this.prototype.constructor();
        await i.ready();
        return i;
    }


    /**
     * Called after initialization is complete (Template loaded etc)
     *
     * @abstract
     * @return {Promise<void>}
     */
    async __init() {
        await KaToolsV1.sleep(100);
        document.addEventListener("click", this._globalClickEventHandler);
    }

    async ready() {
        return await this.readyPromise;
    }


    async destroy() {
        if (this._globalClickEventHandler !== null)
            document.removeEventListener("click", this._globalClickEventHandler);
        this.$element.remove();

    }

    /**
     * Return the HTMLTemplate
     *
     * @abstract
     * @return {HTMLTemplateElement}
     */
    static async getTemplate() {}


}
