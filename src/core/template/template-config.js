

export class TemplateConfig {

    /**
     *
     * @param tid {string}  Template Id (as specified in data-ed-tid)
     * @param config {*}
     */
    constructor(tid, config = {}) {
        this.tid = tid;
        Object.assign(this, config);
    }

    getName(element) {
        return this.tid
    }

    /**
     *
     * @param parentTemplateConfig {TemplateConfig}
     * @return {boolean}
     */
    isAllowedChild(parentTemplateConfig) {
        return true;
    }

    isTextEditable() {
        return false;
    }

    isRepeatable() {
        return true;
    }

    /**
     * Initialize the Node (after clone or insert)
     * only the single node!
     *
     * @param element
     */
    initElement(element) {

    }

    /**
     * Clones one instance of the original Template
     *
     * @return {HTMLElement|null}
     */
    getInstance() {
        let tpl =  Array.from(document.querySelectorAll("template"))
            .filter((el) => el.content.firstElementChild.getAttribute("data-ed-tid") === this.tid);
        if (tpl.length === 0)
            throw "<template> for tid: " + this.tid + "missing.";
        return tpl[0].content.firstElementChild.cloneNode(true);
    }

}
