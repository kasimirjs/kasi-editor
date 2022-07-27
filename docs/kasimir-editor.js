/* KasimirJS EMBED - documentation: https://kasimirjs.infracamp.org - Author: Matthias Leuffen <m@tth.es>*/

/* from rfc/ka-position-element-next-to.js */
/**
 * Set the position of the floating (inner) Element to a event or
 * a target Element
 *
 * @param element {HTMLElement}          The Element to apply the position to
 * @param nextTo {PointerEvent|HTMLElement}     The PointerEvent or other Element to
 */
KaToolsV1.positionElementNextTo = (element, nextTo) => {
        let x,y = null;
        let elemRect = element.getBoundingClientRect();
        if (nextTo instanceof Event) {
            x = nextTo.clientX; y = nextTo.clientY;
            if (y + elemRect.height > window.innerHeight)
                y = y - elemRect.height + "px";
            if (x + elemRect.width > window.innerWidth)
                y = x - elemRect.width + "px";
        } else if (nextTo instanceof HTMLElement) {
            let bb = nextTo.getBoundingClientRect();
            y = bb.top + bb.height; x = bb.left;

            // If right side of the screen
            if (bb.left > window.innerHeight / 2) {
                x = bb.left + bb.width - elemRect.width;
            }
            if (y + bb.height > window.innerHeight)
                y = bb.top - elemRect.height;
        } else {
            throw "Invalid paramter 1. Expected HTMLElement or PointerEvent"
        }
        element.style.top = y + "px";
        element.style.left = x + "px";
}

/* from rfc/ka-create-element.js */
/**
 * Create a new Element
 *
 * @param tagName {string}      The Tag Name
 * @param attributes {string<string>}   Attributes to set initially
 * @param appendToElement {HTMLElement}
 * @param children {HTMLElement[]}
 * @return HTMLElement
 */
KaToolsV1.createElement = (tagName, attributes = null,  children = null, appendToElement = null) => {
    let e = document.createElement(tagName);
    if (attributes === null)
        attributes = {}

    for(let attName in attributes) {
        e.setAttribute(attName, attributes[attName]);
    }

    if (Array.isArray(children)) {
        for(let ce of children)
            e.appendChild(ce);
    }

    if (appendToElement !== null) {
        appendToElement.appendChild(e);
    }
    return e;
}

/* from rfc/ka-get-parent-element.js */
/**
 * Find and return the parent Element of element in parameter 2
 * matching the selector or element in parameter 1
 *
 * return null if not found
 *
 * @param selector {HTMLElement|string}    The Element or a css selector
 * @param element {HTMLElement}
 * @return {HTMLElement|null}
 */
KaToolsV1.getParentElement = (selector, element) => {
    if (selector instanceof HTMLElement) {
        if (selector === element) {
            return element;
        }
    } else {
        if (element.matches(selector))
            return element;
    }
    if (element.parentElement === null)
        return null;
    return KaToolsV1.getParentElement(selector, element.parentElement);
}

/* from rfc/ka-widget.js */
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

/* from rfc-elem/ka-context-menu.js */
/**
 * @class
 * @type {KaToolsV1.ContextMenu}
 */
KaToolsV1.ContextMenu = class extends KaToolsV1.Widget {
    static _open_menu = null;

    /**
     * show the context menu
     *
     * @public
     * @param nextToElement {HTMLElement|Event}
     * @param actions       {KaToolsV1.ContextMenuAction[]}
     * @return {Promise<KaToolsV1.ContextMenuAction>}
     */
    async show(nextToElement, actions = []) {


        // Close other context menus
        if (KaToolsV1.ContextMenu._open_menu !== null)
            KaToolsV1.ContextMenu._open_menu.destroy();
        KaToolsV1.ContextMenu._open_menu = this;

        await this.ready();

        let resolve2 = null;
        let promise = new Promise((resolve) => resolve2 = resolve)

        let scope = {
            actions: actions,
            $fn: {
                click: async (action, $event) => {
                    $event.preventDefault();
                    if (action.fn !== null) {
                        await action.fn(action);
                    }
                    resolve2(action);
                    this.destroy();
                }
            }
        }
        this.$tpl.render(scope);
        KaToolsV1.positionElementNextTo(scope.$ref.layer, nextToElement);
        return promise;
    }


    async __init() {
        super.__init()
    }

    static async getTemplate() {
        // language=html
        return KaToolsV1.html`
            <ul ka.ref="'layer'" class="shadow dropdown-menu end-0 show" style="position:fixed; z-index: 99999; width:200px">
                <li ka.for="let action of actions"><a class="dropdown-item" ka.on.click="$fn.click(action, $event)" href="javascript:void(0);">[[ action.title ]]</a></li>
            </ul>
        `
    }
}

/* from rfc-elem/ka-context-menu-action.js */

KaToolsV1.ContextMenuAction = class {

    constructor(name, title, icon=null, fn=null) {
        this.name = name;
        this.title = title;
        this.icon = icon;
        this.fn = fn;
    }
}

/* from core/init.js */
const KaEditorConfig = {
    cssStyles: [
        "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
    ],
    sidebarTopHtml: '<img src="https://leuffen.de/assets/leuffen-logo-big.svg" height="48" style="margin-left: -10px">',


    zindex: {
        sidebar: 1030,
        indicatorHover: 1031,
        indicatorSelect: 1031,
    }
}

/* from core/ka-editor-element.js */

class KaEditorElement extends KaToolsV1.CustomElement {

}

/* from core/facet.js */




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

/* from core/ka-editor-ui-facet.js */

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

/* from core/tools.js */

let ka_last_id = 0;

/**
 * Generate a unique id and return it
 * @returns {string}
 */
function ka_ed_generate_id() {
    ka_last_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    return ka_last_id;
}

/**
 * Get the last generated id
 *
 * @returns {number}
 */
function ka_ed_get_last_id() {
    return ka_last_id;
}

/* from el/ka-editor.js */


KaToolsV1.ce_define("ka-editor", class extends KaEditorElement {


    constructor() {
        super();
        this.elements = {
            floater: null,
            indicator: null,
            hoverIndicator: null,
            sidebar: null,

        }
    }


    async connected() {
        let facet = new Facet();

        this.elements.floater = KaToolsV1.createElement("ka-editor-int-floater", null, null, document.body);
        this.elements.indicator = KaToolsV1.createElement("ka-editor-int-indicator", null, null, document.body);
        this.elements.hoverIndicator = KaToolsV1.createElement("ka-editor-int-hover-indicator", null, null, document.body);
        this.elements.sidebar = KaToolsV1.createElement("ka-editor-sidebar", null, null, document.body);


        // Import the templates
        if (this.hasAttribute("data-ed-template")) {
            for (let url of this.getAttribute("data-ed-template").split(" ")) {
                let tpl = document.createElement("ka-ed-imported-templates");
                tpl.hidden = true;
                document.body.appendChild(tpl);
                tpl.append((await KaToolsV1.loadHtml(url)).content)
                KaToolsV1.execImportedScriptTags(tpl, url);
            }
        }

        let curSelectedElement = null;

        // Manage the selected Element and apply actions
        this.$eventDispatcher.addEventListener("selectElement", (e) => {
            if (curSelectedElement !== null && curSelectedElement !== e.element) {
                Object.values((new Facet()).getActionsForElement(curSelectedElement, "onDeSelect")).forEach((action) => action.onDeSelect(curSelectedElement))
                curSelectedElement = null;
            }
            if (e.element !== null && e.element !== curSelectedElement) {
                Object.values((new Facet()).getActionsForElement(e.element, "onSelect")).forEach((action) => action.onSelect(e.element))
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

            if (e.defaultPrevented === true)
                return;

            // Deselect the element
            if (KaToolsV1.getParentElement(this, target) === null)
                this.$eventDispatcher.triggerEvent("selectElement", {element: null});
            target = facet.getEditableParentElement(target);
            this.$eventDispatcher.triggerEvent("selectElement", {element: target});

        })

        // Finally - if everything is loaded: Trigger one update
        document.addEventListener("DOMContentLoaded", () => this.$eventDispatcher.triggerEvent("update"));
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

/* from el/ka-context-menu.js */

/* from modal/ka-insert-modal.js */


KaToolsV1.modal.define("ka-insert-modal", function($tpl, $args, $resolve, $reject){
    let f = new Facet();

    let scope = {
        element: $args.element,
        templates: f.getAllowedChildTemplates($args.element),
        $resolve
    }
    $tpl.render(scope);

    // language=html
}, KaToolsV1.html`

<div class="modal-header">
    <h5 class="modal-title">Element einfügen</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div class="modal-content">
    <ul class="list-group">
        <li class="list-group-item" ka.for="let curTpl of templates" ><a href="javascript:void(0)" ka.on.click="$resolve(curTpl)" ka.htmlContent="(new KaEditorUiFacet(curTpl.content.firstElementChild)).getNaviNameHtml()"></a></li>
    </ul>

</div>
<div class="modal-footer">
    <button class="btn"  >Einfügen</button>
</div>

`)

/* from int/ka-editor-int-floater.js */

/* from int/ka-editor-int-indicator.js */

class KaEditorElementIndicator extends KaEditorElement {

    constructor() {
        super();

        this.scope = {
            element: null,
            showBtn: false,

            facet: new Facet(),

            $fn: {
                btnClick: async () => {
                    console.log ("click");
                    await this.scope.facet.showActions(this.scope.element, this.scope.$ref.btn1);
                },
            }
        }
    }


    /**
     *
     * @param element {HTMLElement}
     */
    setElement(element) {
        if (element === this.scope.element)
            return;
        if (element === null) {
            this.hidden = true;
            this.scope.element = null;
            return
        }

        this.hidden = false;
        this.scope.element = element;
        this.scope.popupOpen = false;

        this.scope.showBtn = this.scope.facet.getActionsArrayForElement(element, "action").length > 0

        this.$tpl.render(this.scope);
        if (this.$tpl.isFirstRender()) {

            window.setInterval(()=> {
                if (this.scope.element !== null)
                    this.$tpl.render()
            }, 100);
            //this.scope.$ref.btn1.addEventListener("click", (e) => e.stopPropagation());
        }
    }

    async connected() {
        this.$eventDispatcher.addEventListener("selectElement", (payload) => {
            this.setElement(payload.element);
        })


    }
}

// language=html
KaToolsV1.ce_define("ka-editor-int-indicator",  KaEditorElementIndicator , KaToolsV1.html`
    <link ka.for="let style of KaEditorConfig.cssStyles" ka.attr.href="style" rel="stylesheet">




<style>

.indicator {
    background-color: #0b5ed7;

    position: absolute;
    height: 0;
}

.offset-button {
    opacity: 0.2;
    transition: opacity 400ms;
    position: relative;
    top: -30px;
    height: 32px;;
}
.offset-button:hover {
    opacity: 1;
}

    .indicator-menu {
        height: 10px;
        position: absolute;
    }

</style>
<div ka.attr.hidden=" ! showBtn" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator-menu">
    <div ka.ref="'btn1'"  class="btn-group float-end offset-button" >
        <button  ka.on.click="$fn.btnClick()" ka.ref="'button1'" class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            </i>
        </button>
    </div>
</div>


<div ka.style.z-index="KaEditorConfig.zindex.indicatorSelect" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator" style="height: 3px">
</div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorSelect" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:3px"></div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorSelect" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left + element.getBoundingClientRect().width" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:3px"></div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorSelect" ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height + window.scrollY" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left" class="indicator" style="height: 3px"></div>


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
    <link ka.for="let style of KaEditorConfig.cssStyles" ka.attr.href="style" rel="stylesheet">
<style>
.indicator {
    background-color: black;

    opacity: 0.2;
    position: absolute;
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
<div  ka.style.z-index="KaEditorConfig.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator" style="height:2px;"></div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left + element.getBoundingClientRect().width" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.z-index="KaEditorConfig.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height + window.scrollY" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left" class="indicator" style="height: 2px"></div>


`, {shadowDom: true});

/* from int/ka-editor-sidebar.js */



KaToolsV1.ce_define("ka-editor-sidebar",

    async ($tpl, $eventDispatcher) => {
        let facet = new Facet();
        let scope = {
            isOpen: true,
            elementTree: facet.getElementTree(document.querySelector("ka-editor")),
            $fn: {
                toggle: () => { scope.isOpen = !scope.isOpen;  $tpl.render() }
            }
        }
        $tpl.render(scope);

        $eventDispatcher.addEventListener("update", async () => {
            scope.elementTree = facet.getElementTree(document.querySelector("ka-editor"));
            $tpl.render();
        })
        $eventDispatcher.addEventListener("scrollSideBarIntoView", (e) => {
            let boundingRect = e.element.getBoundingClientRect();
            if (boundingRect.top < 100 || boundingRect.top > window.innerHeight - 100)
                scope.$ref.scroll1.scrollTop = e.element.getBoundingClientRect().top + scope.$ref.scroll1.scrollTop - 300;

        })



        scope.$ref.sidebar.addEventListener("click", (e) => {
            // Prevent the event on sidebar to affect the global document
            e.preventDefault();
        });
    },
    // language=html
    KaToolsV1.html`
        <link ka.for="let style of KaEditorConfig.cssStyles" ka.attr.href="style" rel="stylesheet">


        <style>
            .sidebar {
                position: fixed; left: -290px; width: 290px; top:0;bottom: 0;border-right: 1px solid gray;background-color: whitesmoke;
                transition: left 300ms ease-in-out;
            }
            .sidebar.open {
                left: 0;
            }
            .sidebar .indicator {
                position: relative;
                left: 290px;
                top: 33%;
                width: 32px;
                height: 32px;
                background-color: black;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                box-shadow: black ;
                padding-top: 2px;
            }
        </style>

        <div ka.ref="'sidebar'" ka.style.z-index="KaEditorConfig.zindex.sidebar" class="sidebar" ka.classlist.open="isOpen">
            <div style="position: absolute; top:0px;height:80px;left:2px;right:2px;overflow: hidden;" ka.htmlcontent="KaEditorConfig.sidebarTopHtml"></div>

            <div ka.ref="'scroll1'" style="position: absolute; top:80px;bottom:80px;left:2px;right:2px;overflow-y: scroll;background-color: white">
                <ka-editor-sidebar-item ka.for="let e of elementTree.children" ka.prop.element="e"></ka-editor-sidebar-item>
            </div>

            <div class="indicator text-light ps-1" ka.on.click="$fn.toggle()" style="cursor: pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
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
                    runAction: async (action) => {
                        await action.action(this.scope.element.elem);
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
            let facet = new Facet();

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
                    this.$eventDispatcher.triggerEvent("scrollSideBarIntoView", {element: this.scope.$ref.div1});

            })
            this.scope.$ref.div1.addEventListener("pointerenter", (e) => {
                this.$eventDispatcher.triggerEvent("hoverElement", {element: this.scope.element.elem});
            })
            this.scope.$ref.div1.addEventListener("click", (e) => {
                this.$eventDispatcher.triggerEvent("selectElement", {element: this.scope.element.elem, origin: 'sidebar'});
            })
            this.scope.$ref.div1.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.$eventDispatcher.triggerEvent("selectElement", {element: this.scope.element.elem, origin: 'sidebar'});
                // Open Context Menu
                if (facet.getActionsArrayForElement(this.scope.element.elem, "action").length > 0)
                    facet.showActions(this.scope.element.elem, e.target);
            })
        }
    },
// language=html
KaToolsV1.html`

    <style>
        .selected {
            background-color: #0c63e4;
            border: 1px solid black;
            color: white;
            font-weight: bold;
            padding-left: 4px;
            padding-right: 4px;
            border-radius: 8px;
        }

        .iconbar{

            background: white;
        }
        .iconbar > i {
            opacity: 0.5;
        }
        .hovered.iconbar > i{
            opacity: 1;
        }
    </style>


<div>
    <!--div class="position-absolute end-0 iconbar" ka.classlist.hovered="hovered" style="z-index: 2">
        <div class="d-inline-block" ka.for="let action of (new KaEditorFacet()).getIndicatorActions(element.elem)" style="width: 25px; height: 25px; overflow:hidden">
            <i ka.if="action !== null" class="bi" style="cursor: pointer" ka.htmlContent="action.getIndicator(element.elem)" ka.on.click="$fn.runAction(action)"></i>
        </div>

    </div-->
    <div ka.ref="'div1'" class="position-relative text-nowrap "  ka.classlist.bg-light="hovered" style="cursor: pointer; text-overflow: ellipsis;left:0; right:20px">
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
            </svg>
        </i>
        <span class="d-inline-block " ka.classlist.selected="selected">
            <span ka.if="element.elem.hasAttribute('data-ed-name')">[[ element.elem.getAttribute('data-ed-name')  ]] <span class="text-muted small">[[ element.elem.getAttribute('class') ]]</span></span>
            <span ka.if=" ! element.elem.hasAttribute('data-ed-name')" class="font-monospace">[[ element.elem.tagName ]] <span class="text-muted small">[[ element.elem.getAttribute('class') ]]</span></span>
        </span>
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
        isValid: (element) => element.hasAttribute("data-ed-name"),

    },
    text: {
        isValid: (element) => element.hasAttribute("data-ed-text"),
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
        isValid: (element) => element.hasAttribute("data-ed-repeat"),



        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            let clone = element.cloneNode(true);
            element.parentElement.insertBefore(clone, element.nextElementSibling);
            (new Facet).initElement(clone);
        }
    },
    delete: {
        name: "Delete",
        isValid: (element) => element.hasAttribute("data-ed-repeat"),
        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            element.remove();
        }
    },

    insert: {
        name: "Append Element...",

        getIndicator: () => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
            '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
            '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
            '</svg>',

        indicatorRow: 1,

        isValid: (element) => element.hasAttribute("data-ed-allow-child"),
        /**
         *
         * @param element {HTMLElement}
         */
        action: async (element) => {
            let tpl = await KaToolsV1.modal.show("ka-insert-modal", {element: element});

            let node = tpl.content.firstElementChild.cloneNode(true);
            element.appendChild(node);
            (new Facet).initElement(node);
        }
    }
}


