/* KasimirJS EMBED - documentation: https://kasimirjs.infracamp.org - Author: Matthias Leuffen <m@tth.es>*/

/* from core/ka-editor-element.js */

class KaEditorElement extends KaToolsV1.CustomElement {

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

    constructor() {
        super();
    }

    #getAllPropNames() {
        let ret = [];
        for(let en in KaIndicatiorActions)
            ret.push(...KaIndicatiorActions[en].on);
        return ret;
    }

    #getEditableElement(curTarget) {
        let listOfDataNames = this.#getAllPropNames();

        if (listOfDataNames.some(r => curTarget.getAttributeNames().includes(r)))
            return curTarget;
        if (curTarget.parentElement === this)
            return null;
        return this.#getEditableElement(curTarget.parentElement);
    }

    async connected() {
        this.#floater = document.createElement("ka-editor-int-floater");
        this.parentElement.appendChild(this.#floater);
        this.#indicator = document.createElement("ka-editor-int-indicator");
        this.parentElement.appendChild(this.#indicator);

        this.addEventListener("mouseover", (e) => {
            let target = e.target;

            target = this.#getEditableElement(target);
            if (target === null)
                return;

            this.#indicator.setElement(target);
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

class KaEditorElementFloater extends KaEditorElement {

    async connected() {
        let scope = {
            position: {
                top: 200,
                left: 200,
                height: 100,
                width: 100
            }
        }
        this.$tpl.render(scope);

    }
}


KaToolsV1.ce_define("ka-editor-int-floater",  KaEditorElementFloater , KaToolsV1.html`
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
<link href="/ka-editor-shadow.css" rel="stylesheet">
<style>
.floater {

    position: absolute;
    z-index: 999999;

}

.floater .backdrop {
    border: 1px solid black;
    background-color: #0a58ca;
    opacity: 0.1;
    position: absolute;
    width: inherit;
    height: inherit;

}

</style>
<div ka.style="position" class="floater">
    <div class="backdrop"></div>
    <div>Im floating</div>
</div>


`, {shadowDom: true});

/* from int/ka-editor-int-indicator.js */

class KaEditorElementIndicator extends KaEditorElement {

    #scope = {
        element: null,
        popupOpen: false,
        actions: KaIndicatiorActions,

        $fn: {
            toggle: () => {
                this.#scope.popupOpen = !this.#scope.popupOpen
                this.$tpl.render();
            },
            runAction: (aName) => {
                KaIndicatiorActions[aName].action(this.#scope.element);
                this.#scope.popupOpen = false;
                this.$tpl.render();
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
        this.#scope.element = element;
        this.#scope.popupOpen = false;

        // Filter Actions according to on: requriements
        this.#scope.actions = Object.keys(KaIndicatiorActions)
            .filter((key) => KaIndicatiorActions[key].on.some(key => element.hasAttribute(key)))
            .reduce((cur, key) => Object.assign(cur, {[key]: KaIndicatiorActions[key]}), {})

        console.log(this.#scope.actions);

        this.$tpl.render(this.#scope);

    }

    async connected() {
        this.addEventListener("mouseleave", () => {
            this.#scope.popupOpen = false;
            this.$tpl.render(this.#scope);
        })
    }
}


KaToolsV1.ce_define("ka-editor-int-indicator",  KaEditorElementIndicator , KaToolsV1.html`
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">



<link href="/ka-editor-shadow.css" rel="stylesheet">
<style>

.indicator {
    border-top: 1px solid #0b5ed7;
    position: absolute;
    z-index: 999;
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

</style>
<div ka.style.top="element.getBoundingClientRect().top" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator">
    <div class="btn-group float-end">
      <button ka.on.click="$fn.toggle()" ka.ref="'button1'" class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
            </svg>
        </i>
      </button>
      <ul class="dropdown-menu" ka.classlist.show="popupOpen" style="z-index: 9999">
        <li ka.for="let aName in actions"><a class="dropdown-item" ka.on.click="$fn.runAction(aName)" href="javascript:void(0);">[[ actions[aName].name ]]</a></li>

      </ul>

    </div>

</div>
<div class="indicator" ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left"></div>


`, {shadowDom: true});

/* from int/indicator-actions.js */

const KaIndicatiorActions = {

    duplicate: {
        name: "Duplicate",
        on: ["data-ed-repeat"],
        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            let clone = element.cloneNode(true);
            console.log(element);
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


