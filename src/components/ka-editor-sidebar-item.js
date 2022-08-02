import {ka_ce_define} from "kasimir-embed/src/ce/ka-ce-define";
import {KaCustomElement} from "kasimir-embed/src/ce/custom-element";
import {EditorContainer} from "../core/editor-container";
import {HoverMessage} from "../core/messages/hover-message";
import {SelectMessage} from "../core/messages/select-message";
import {ka_html} from "kasimir-embed/src/ce/html";


ka_ce_define("ka-editor-sidebar-item", class extends KaCustomElement {

        constructor() {
            super();

            this.bus = null;
            this.scope = {
                element: null,
                hovered : false,
                selected: false,
                $fn: {
                    runAction: async (action) => {
                        await action.action(this.scope.element.elem);
                        this.bus.trigger(new UpdateMessage());

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
            let container = EditorContainer.getInstance();
            let bus = await container.getBus();
            this.bus = bus;

            let facet = await container.getFacet();

            this.$tpl.render(this.scope);

            bus.on(HoverMessage, (msg) => {


                this.scope.hovered = false;

                if (msg.element === null) {
                    return;
                }

                if (this.scope.selected)
                    return;
                if (msg.element === this.scope.element.elem)
                    this.scope.hovered = true;
                this.$tpl.render();
            })
            bus.on(SelectMessage,(payload) => {
                this.scope.selected = false;
                if (payload.element === null) {
                    this.$tpl.render();
                    return;
                }

                if (payload.element === this.scope.element.elem) {
                    this.scope.selected = true;
                }
                this.$tpl.render();
                //if (payload.origin !== "sidebar" && payload.element === this.scope.element.elem)
                    //this.$eventDispatcher.triggerEvent("scrollSideBarIntoView", {element: this.scope.$ref.div1});

            })
            this.scope.$ref.div1.addEventListener("pointerenter", (e) => {
                bus.trigger(new HoverMessage(this.scope.element.elem));
            })
            this.scope.$ref.div1.addEventListener("click", (e) => {
                bus.trigger(new SelectMessage(this.scope.element.elem, 'sidebar'));
            })

            // ContextMenü
            this.scope.$ref.div1.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                bus.trigger(new SelectMessage(this.scope.element.elem, 'sidebar'));
                // Open Context Menu
                if (facet.getActionsForElement(this.scope.element.elem, true).length > 0)
                    facet.showActions(this.scope.element.elem, e.target);
            })
        }
    },
// language=html
ka_html`

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
