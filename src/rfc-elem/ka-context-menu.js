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
