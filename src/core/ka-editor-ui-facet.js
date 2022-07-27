
class KaEditorUiFacet {

    /**
     *
     * @param element {HTMLElement}
     */
    constructor(element) {
        /**
         *
         * @type {HTMLElement}
         */
        this.element = element;
    }

    /**
     * Return the name of the element how it appears in Sidebar
     * and others
     *
     * @returns {string}
     */
    getNaviNameHtml() {
        if (this.element.hasAttribute("data-ed-name")) {
            return `<span>${this.element.getAttribute("data-ed-name")}</span> <span class="small font-monospace text-muted">${this.element.tagName}</span>`
        } else {
            return `<span class="font-monospace">${this.element.tagName}</span> <span class="small">${Array.from(this.element.classList).join(" ")}</span>`
        }
    }
}
