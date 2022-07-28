
class KaEditorElementIndicator extends KaEditorElement {

    constructor() {
        super();

        this.scope = {
            element: null,
            showBtn: false,

            facet: new Facet(),

            $fn: {
                btnClick: async (event) => {
                    event.preventDefault();
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

        this.scope.showBtn = this.scope.facet.getActionsForElement(element, true).length > 0

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
        <button  ka.on.click="$fn.btnClick($event)" ka.ref="'button1'" class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
