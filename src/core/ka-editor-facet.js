



class KaEditorFacet {


    /**
     * Return a list of HtmlAttributes that define a Editable Element
     *
     * @returns {string[]}
     */
    getAllPropNames() {
        let ret = [];
        for(let en in KaIndicatorActions)
            ret.push(...KaIndicatorActions[en].on);
        return ret;
    }


    /**
     *
     * @param element {HTMLElement}
     * @param curTreeElem
     * @return {*}
     */
    getElementTree(element, curTreeElem={elem: null, children: []}) {
        for(let child of element.children) {
            if (this.isEditableElement(child)) {
                let newElem = {elem: child, children: []};
                curTreeElem.children.push(newElem);
                this.getElementTree(child, newElem);
                continue;
            }
            this.getElementTree(child, curTreeElem);
        }
        return curTreeElem;
    }


    /**
     * Return the Indicator Actions for
     * @param element
     * @param numActions
     * @returns {*}
     */
    getIndicatorActions(element, numActions=3) {
        let ret = [null, null, null];
        for (let an in KaIndicatorActions) {
            let a = KaIndicatorActions[an];
            if (typeof a.getIndicator === "undefined" || typeof a.indicatorRow === "undefined")
                continue;
            if (a.on.some((name) => element.hasAttribute(name)))
                ret[a.indicatorRow] = a;
        }
        return ret;
    }


    /**
     * Return true if this element is editable
     *
     * @param element {HTMLElement}
     * @returns {boolean}
     */
    isEditableElement(element) {
        let listOfDataNames = this.getAllPropNames();
        return listOfDataNames.some(r => element.getAttributeNames().includes(r))
    }

    /**
     * Find the first editable parent
     *
     * @param curTarget {HTMLElement}
     * @returns {HTMLElement|null}
     */
    getEditableParentElement(curTarget) {
        if (curTarget === null)
            return null;

        if (this.isEditableElement(curTarget))
            return curTarget;
        if (curTarget.parentElement === this)
            return null;
        return this.getEditableParentElement(curTarget.parentElement);
    }


}
