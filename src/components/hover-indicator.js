import {EditorContainer} from "../core/editor-container";
import {HoverMessage} from "../core/messages/hover-message";
import {KaCustomElement} from "kasimir-embed/src/ce/custom-element";
import {ka_ce_define} from "kasimir-embed/src/ce/ka-ce-define";
import {ka_html} from "kasimir-embed/src/ce/html";

class HoverIndicator extends KaCustomElement {


    constructor() {
        super();
        this.scope = {
            config: null,
            element: null,
        }
    }

    /**
     *
     * @param element {HTMLElement}
     */
    setElement(element) {
        if (element === this.element)
            return;
        if (element === null) {
            this.hidden = true;
            this.$tpl.render();
            return
        }

        this.hidden = false;
        this.scope.element = element;

        this.$tpl.render(this.scope);
        if (this.$tpl.isFirstRender()) {
            window.setInterval(()=> {
                if (this.scope.element !== null)
                    this.$tpl.render()
            }, 200);
        }
    }

    async connected() {
        let container = EditorContainer.getInstance();
        let bus = await container.getBus();

        this.scope.config = await container.getConfig();


        bus.on(HoverMessage, (msg) => {
            this.setElement(msg.element);
        })
    }
}

// language=html
ka_ce_define("ka-editor-components-hover-indicator",  HoverIndicator , ka_html`
    <link ka.for="let style of config.cssStyles" ka.attr.href="style" rel="stylesheet">
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
<div  ka.style.z-index="config.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.width="element.getBoundingClientRect().width" class="indicator" style="height:2px;"></div>
<div ka.style.z-index="config.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.z-index="config.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + window.scrollY" ka.style.left="element.getBoundingClientRect().left + element.getBoundingClientRect().width" ka.style.height="element.getBoundingClientRect().height" class="indicator" style="width:2px"></div>
<div ka.style.z-index="config.zindex.indicatorHover" ka.style.top="element.getBoundingClientRect().top + element.getBoundingClientRect().height + window.scrollY" ka.style.width="element.getBoundingClientRect().width" ka.style.left="element.getBoundingClientRect().left" class="indicator" style="height: 2px"></div>


`, {shadowDom: true});
