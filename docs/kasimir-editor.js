/* KasimirJS EMBED - documentation: https://kasimirjs.infracamp.org - Author: Matthias Leuffen <m@tth.es>*/

/* from core/ka-editor-element.js */

class KaEditorElement extends KaToolsV1.CustomElement {

}

/* from core/ka-editor-facet.js */




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


    getActionsForElement(element, requireKey = null) {
        let actions = Object.keys(KaIndicatorActions)
            .filter((key) => KaIndicatorActions[key].on.some(key => element.hasAttribute(key)));

        if (requireKey !== null)
            actions = actions.filter((key) => typeof KaIndicatorActions[key][requireKey] !== "undefined")

        let ret =  actions.reduce((cur, key) => Object.assign(cur, {[key]: KaIndicatorActions[key]}), {})
        return ret;
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

/* from el/ka-editor.js */


KaToolsV1.ce_define("ka-editor", class extends KaEditorElement {

    /**
     * @type {KaEditorElementFloater}
     */
    #floater;

    /**
     * @type {KaEditorElementIndicator}
     */
    #indicator;
    /**
     * @type {KaEditorHoverIndicator}
     */
    #hoverIndicator;
    constructor() {
        super();
    }


    async connected() {
        let facet = new KaEditorFacet();

        this.#floater = document.createElement("ka-editor-int-floater");
        this.parentElement.appendChild(this.#floater);
        this.#indicator = document.createElement("ka-editor-int-indicator");
        this.parentElement.appendChild(this.#indicator);
        this.#hoverIndicator = document.createElement("ka-editor-int-hover-indicator");
        this.parentElement.appendChild(this.#hoverIndicator);

        if (this.hasAttribute("data-ed-template")) {
            this.parentElement.appendChild((await KaToolsV1.loadHtml(this.getAttribute("data-ed-template"))).content);

        }
        let curSelectedElement = null;

        // Manage the selected Element and apply actions
        this.$eventDispatcher.addEventListener("selectElement", (e) => {
            if (curSelectedElement !== null && curSelectedElement !== e.element) {
                Object.values((new KaEditorFacet()).getActionsForElement(curSelectedElement, "onDeSelect")).forEach((action) => action.onDeSelect(curSelectedElement))
                curSelectedElement = null;
            }
            if (e.element !== null && e.element !== curSelectedElement) {
                Object.values((new KaEditorFacet()).getActionsForElement(e.element, "onSelect")).forEach((action) => action.onSelect(e.element))
                curSelectedElement = e.element
            }

        })

        this.addEventListener("mouseover", (e) => {
            let target = e.target;

            target = facet.getEditableParentElement(target);
            if (target === null)
                return;

            this.$eventDispatcher.triggerEvent("hoverElement", {element: target});

        })
        document.addEventListener("click", (e) => {
            let target = e.target;
            target = facet.getEditableParentElement(target);
            this.$eventDispatcher.triggerEvent("selectElement", {element: target});

        })
    }
});

/* from el/ka-editor-container.js */

KaToolsV1.ce_define("ka-editor-container", class extends KaEditorElement {

    async connected() {

    }
} , KaToolsV1.html`

<div>
</div>


`);

/* from modal/ka-insert-modal.js */


KaToolsV1.modal.define("ka-insert-modal", function($tpl, $args, $resolve, $reject){

    let scope = {

    }
    $tpl.render(scope);

}, KaToolsV1.html`

<div class="modal-header">
    <h5 class="modal-title">Element einfügen</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div ka.if="content !== null" class="modal-content" ka.htmlcontent="content">

</div>
<div class="modal-footer">
    <button class="btn"  >Einfügen</button>
</div>

`)

/* from int/ka-editor-int-floater.js */

/* from int/ka-editor-int-indicator.js */

class KaEditorElementIndicator extends KaEditorElement {

    #scope = {
        element: null,
        popupOpen: false,
        actions: KaIndicatorActions,

        $fn: {
            toggle: () => {
                console.log("toggle");
                this.#scope.popupOpen = !this.#scope.popupOpen
                this.$tpl.render();
            },
            runAction: (aName) => {
                KaIndicatorActions[aName].action(this.#scope.element);
                this.#scope.popupOpen = false;
                this.$tpl.render();
                this.$eventDispatcher.triggerEvent("update");
            }
        }
    }

    /**
     *
     * @param element {HTMLElement}
     */
    setElement(element) {
        if (element === this.#scope.element)
            return;
        if (element === null) {
            this.hidden = true;
            this.#scope.element = null;
            return
        }

        this.hidden = false;
        this.#scope.element = element;
        this.#scope.popupOpen = false;

        // Filter Actions according to on: requriements
        this.#scope.actions = (new KaEditorFacet()).getActionsForElement(element, "action")

        this.$tpl.render(this.#scope);
        if (this.$tpl.isFirstRender()) {

            window.setInterval(()=> {
                if (this.#scope.element !== null)
                    this.$tpl.render()
            }, 200);
            this.#scope.$ref.btn1.addEventListener("click", (e) => e.stopPropagation());
        }



    }

    async connected() {
        this.$eventDispatcher.addEventListener("selectElement", (payload) => {
            this.setElement(payload.element);
        })



        this.addEventListener("click", () => {
            this.#scope.popupOpen = false;
            this.$tpl.render(this.#scope);
        })
    }
}

// language=html
KaToolsV1.ce_define("ka-editor-int-indicator",  KaEditorElementIndicator , KaToolsV1.html`
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">



<link href="/ka-editor-shadow.css" rel="stylesheet">
<style>

.indicator {
    background-color: #0b5ed7;

    position: absolute;
    z-index: 9998;
    height: 0;
}

button {
    opacity: 0.2;
    transition: opacity 400ms;
    position: relative;
    top: -30px;
    height: 32px;;
}
button:hover {
    opacity: 1;
}

    .indicator-menu {
        height: 10px;
        position: absolute;
        z-index: 9999;
    }

</style>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator-menu">
    <div ka.ref="'btn1'" class="btn-group float-end" >
        <button ka.on.click="$fn.toggle()" ka.ref="'button1'" class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            </i>
        </button>
        <ul class="dropdown-menu position-absolute end-0" ka.classlist.show="popupOpen" style="position:absolute; z-index: 999999">

            <li ka.for="let aName in actions"><a class="dropdown-item" ka.on.click="$fn.runAction(aName)" href="javascript:void(0);">[[ actions[aName].name ]]</a></li>

        </ul>

    </div>
</div>


<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator" style="height: 3px">
</div>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:3px"></div>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left + element.getBoundingClientRect().width" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:3px"></div>
<div ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height + window.scrollY" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left" class="indicator" style="height: 3px"></div>


`, {shadowDom: true});

/* from int/ka-editor-int-hover-indicator.js */

class KaEditorHoverIndicator extends KaEditorElement {

    #scope = {
        element: null,
        popupOpen: false,
        actions: KaIndicatorActions,

        $fn: {
            toggle: () => {
                this.#scope.popupOpen = !this.#scope.popupOpen
                this.$tpl.render();
            },
            runAction: (aName) => {
                KaIndicatorActions[aName].action(this.#scope.element);
                this.#scope.popupOpen = false;
                this.$tpl.render();
                this.$eventDispatcher.triggerEvent("update");
            }
        }
    }

    /**
     *
     * @param element {HTMLElement}
     */
    setElement(element) {
        if (element === this.#scope.element)
            return;
        if (element === null) {
            this.hidden = true;
            this.$tpl.render();
            return
        }

        this.hidden = false;
        this.#scope.element = element;
        this.#scope.popupOpen = false;

        // Filter Actions according to on: requriements
        this.#scope.actions = Object.keys(KaIndicatorActions)
            .filter((key) => KaIndicatorActions[key].on.some(key => element.hasAttribute(key)))
            .reduce((cur, key) => Object.assign(cur, {[key]: KaIndicatorActions[key]}), {})


        this.$tpl.render(this.#scope);
        if (this.$tpl.isFirstRender()) {
            window.setInterval(()=> {
                if (this.#scope.element !== null)
                    this.$tpl.render()
            }, 200);
        }
    }

    async connected() {
        this.$eventDispatcher.addEventListener("hoverElement", (payload) => {
            this.setElement(payload.element);
        })
    }
}

// language=html
KaToolsV1.ce_define("ka-editor-int-hover-indicator",  KaEditorHoverIndicator , KaToolsV1.html`
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">



<link href="/ka-editor-shadow.css" rel="stylesheet">
<style>

.indicator {
    background-color: #0f5132;

    opacity: 0.2;
    position: absolute;
    z-index: 9997;

}

button {
    opacity: 0.2;
    transition: opacity 400ms;
    position: relative;
    top: -30px;
    height: 32px;;
}
button:hover {
    opacity: 1;
}

</style>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator" style="height:2px;"></div>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left + element.getBoundingClientRect().width" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height + window.scrollY" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left" class="indicator" style="height: 2px"></div>


`, {shadowDom: true});

/* from int/ka-editor-sidebar.js */



KaToolsV1.ce_define("ka-editor-sidebar",

    async ($tpl, $eventDispatcher) => {
        let facet = new KaEditorFacet();
        let scope = {
            isOpen: true,
            elementTree: facet.getElementTree(document.querySelector("ka-editor")),
            $fn: {
                toggle: () => { scope.isOpen = !scope.isOpen;  $tpl.render() }
            }
        }
        $tpl.render(scope);

        $eventDispatcher.addEventListener("update", () => {
            scope.elementTree = facet.getElementTree(document.querySelector("ka-editor"));
            $tpl.render();
        })
        $eventDispatcher.addEventListener("scrollSideBarIntoView", (e) => {
            scope.$ref.scroll1.scrollTop = e.element.getBoundingClientRect().top;
            console.log("offset top", e.element.getBoundingClientRect())
        })



        scope.$ref.sidebar.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
    },
    // language=html
    KaToolsV1.html`
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="/ka-editor-shadow.css" rel="stylesheet">

        <style>
            .sidebar {
                position: fixed; left: -300px; width: 300px; top:0;bottom: 0;border-right: 1px solid gray;background-color: whitesmoke; z-index: 999999;
                transition: left 300ms ease-in-out;
            }
            .sidebar.open {
                left: 0;
            }
            .sidebar .indicator {
                position: relative;
                left: 300px;
                top: 33%;
                width: 28px;
                height: 28px;
                background-color: black;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                box-shadow: black ;
            }
        </style>

        <div ka.ref="'sidebar'" class="sidebar" ka.classlist.open="isOpen">

            <div ka.ref="'scroll1'" style="position: absolute; top:80px;bottom:80px;left:2px;right:2px;overflow-y: scroll;background-color: white">
                <ka-editor-sidebar-item ka.for="let e of elementTree.children" ka.prop.element="e"></ka-editor-sidebar-item>
            </div>

            <div class="indicator text-light ps-1" ka.on.click="$fn.toggle()" style="cursor: pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            </div>
        </div>
    `,
    {shadowDom: true}

)

/* from int/ka-editor-sidebar-item.js */


KaToolsV1.ce_define("ka-editor-sidebar-item", class extends KaToolsV1.CustomElement {

        constructor() {
            super();


            this.scope = {
                element: null,
                hovered : false,
                selected: false,
                $fn: {
                    runAction: (action) => {
                        action.action(this.scope.element.elem);
                        this.$eventDispatcher.triggerEvent("update");
                    }
                }
            }
        }

        set element (val) {
            this.scope.element = val;
            if (this.$tpl !== null)
                this.$tpl.render(this.scope);
        }

        disconnectedCallback() {

        }

        async connected() {
            this.$tpl.render(this.scope);

            this.$eventDispatcher.addEventListener("hoverElement", (payload) => {


                this.scope.hovered = false;

                if (payload.element === null) {
                    return;
                }

                if (this.scope.selected)
                    return;
                if (payload.element === this.scope.element.elem)
                    this.scope.hovered = true;
                this.$tpl.render();
            })
            this.$eventDispatcher.addEventListener("selectElement", (payload) => {
                this.scope.selected = false;

                if (payload.element === null) {
                    this.$tpl.render();
                    return;
                }

                if (payload.element === this.scope.element.elem) {
                    this.scope.selected = true;
                }
                this.$tpl.render();
                if (payload.origin !== "sidebar" && payload.element === this.scope.element.elem)
                    this.$eventDispatcher.triggerEvent("scrollSideBarIntoView", {element: this});

            })
            this.scope.$ref.div1.addEventListener("pointerenter", (e) => {
                this.$eventDispatcher.triggerEvent("hoverElement", {element: this.scope.element.elem});
            })
            this.scope.$ref.div1.addEventListener("click", (e) => {
                this.$eventDispatcher.triggerEvent("selectElement", {element: this.scope.element.elem, origin: 'sidebar'});
            })
        }
    },
// language=html
KaToolsV1.html`

<div>
    <div class="position-absolute end-0" style="z-index: 2" ka.if="selected">
        <div class="d-inline-block" ka.for="let action of (new KaEditorFacet()).getIndicatorActions(element.elem)" style="width: 25px; height: 25px; overflow:hidden">
            <i ka.if="action !== null" class="bi" style="cursor: pointer" ka.htmlContent="action.getIndicator(element.elem)" ka.on.click="$fn.runAction(action)"></i>
        </div>

    </div>
    <div ka.ref="'div1'" class="position-relative"  ka.classlist.bg-light="hovered" style="cursor: pointer">
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
            </svg>
        </i>
        <span class="d-inline-block" ka.classlist.fw-bold="selected" ka.classlist.border="selected" ka.classlist.border-primary="selected">[[element.elem.hasAttribute('data-ed-name') ? element.elem.getAttribute('data-ed-name') : element.elem.tagName]]</span>
    </div>

    <div class="ps-4 ">
        <ka-editor-sidebar-item ka.for="let e of element.children" ka.prop.element="e"></ka-editor-sidebar-item>
    </div>
</div>

`);

/* from int/indicator-actions.js */

const KaIndicatorActions = {
    name: {
        name: "Name",
        on: ["data-ed-name"],

    },
    text: {
        on: ["data-ed-text"],
        /**
         *
         * @param element {HTMLElement}
         */
        onSelect: (element) => {
            element.contentEditable = true
            element.focus();
        },
        onDeSelect: (element) => {
            if (element.textContent === "")
                element.innerHTML = "";
            element.contentEditable = false
        }

    },
    duplicate: {
        name: "Duplicate",
        on: ["data-ed-repeat"],

        getIndicator: () => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
            '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
            '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
            '</svg>',

        indicatorRow: 1,

        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            let clone = element.cloneNode(true);
            element.parentElement.insertBefore(clone, element.nextElementSibling);

        }
    },
    delete: {
        name: "Delete",
        on: ["data-ed-repeat"],
        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            element.remove();
        }
    },

    insert: {
        name: "Insert Element...",
        on: ["data-ed-insert"],
        /**
         *
         * @param element {HTMLElement}
         */
        action: async (element) => {
            let ret = await KaToolsV1.modal.show("ka-insert-modal");
        }
    }
}


