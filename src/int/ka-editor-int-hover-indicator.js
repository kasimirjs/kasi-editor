
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
