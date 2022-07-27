



class Facet {


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
            if (a.isValid(element))
                ret[a.indicatorRow] = a;
        }
        return ret;
    }


    /**
     * Return true if this element is editable (has at least one data-ed attribute
     *
     * @param element {HTMLElement}
     * @returns {boolean}
     */
    isEditableElement(element) {
        return element.getAttributeNames().some(r => r.startsWith("data-ed"))
    }


    getActionsForElement(element, requireKey = null) {
        let actions = Object.keys(KaIndicatorActions)
            .filter((key) => KaIndicatorActions[key].isValid(element));


        if (requireKey !== null)
            actions = actions.filter((key) => typeof KaIndicatorActions[key][requireKey] !== "undefined")

        let ret =  actions.reduce((cur, key) => Object.assign(cur, {[key]: KaIndicatorActions[key]}), {})
        return ret;
    }

    /**
     *
     * @param element
     * @param requireKey
     * @return *[]
     */
    getActionsArrayForElement (element, requireKey = null) {
        let actions = this.getActionsForElement(element, requireKey);

        return Object.keys(actions).map((key) => actions[key]);
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


    /**
     * Returns all Templates that can be inserted as child to this node
     *
     * @param curTarget {HTMLElement}
     * @returns {HTMLTemplateElement[]}
     */
    getAllowedChildTemplates (curTarget) {
        if ( ! curTarget.hasAttribute("data-ed-allow-child"))
            return [];
        let selectIds = curTarget.getAttribute("data-ed-allow-child").split(" ");

        let tpls = document.querySelectorAll("template[data-ed-id]");
        let ret = [];
        for(let selectId of selectIds) {
            if (selectId.trim() === "")
                continue;
            for(let curTpl of tpls) {
                let regex = `^${selectId}$`.replace("*", ".*");
                if (curTpl.getAttribute("data-ed-id").match(new RegExp(regex))) {
                    ret.push(curTpl);
                }
            }
        }
        return ret;
    }

    /**
     * Initialize a newly or copied element
     *
     * Will execute data-ed-oninit="javascirpt" code
     * @param element {HTMLElement}
     */
    initElement(element) {
        if (typeof element.hasAttribute !== "undefined" && element.hasAttribute("data-ed-oninit")) {
            console.log (element);
            KaToolsV1.eval(element.getAttribute("data-ed-oninit"), {}, element, {});
        }
        Array.from(element.children).forEach((e) => this.initElement(e));
    }


    async showActions(element, positionElementOrEvent) {
        //let m = new KaToolsV1.ContextMenu();
        //await m.ready();

        let actions = this.getActionsArrayForElement(element, "action").map((c) =>
            new KaToolsV1.ContextMenuAction(c.name, c.name, null, async() => await c.action(element))
        );

        // Load the ContextMenu and Wait for click
        let action = await (await KaToolsV1.ContextMenu.Load()).show(positionElementOrEvent, actions);


        await KaToolsV1.sleep(50);

        console.log("update");
        (await KaToolsV1.provider.get("$eventDispatcher")).triggerEvent("update");

    }

}
