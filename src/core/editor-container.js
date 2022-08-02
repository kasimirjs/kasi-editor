import {KaContainer} from "kasimir-embed/src/app/ka-container";
import {Facet} from "./facet";
import {KaEditorConfig} from "./ka-editor-config";
import {KaMessageBus} from "kasimir-embed/src/default/MessageBus";


export class EditorContainer extends KaContainer {


    constructor(props) {
        super(props);


        this.defineService("config", () => KaEditorConfig)
        this.defineService("bus", () => new KaMessageBus())
        this.defineService("facet", async () => {
            let config = await this.getConfig()
            let bus = await this.getBus();
            return new Facet(config, bus);
        })
    }

    /**
     *
     * @return {EditorContainer}
     */
    static getInstance() {
        return super.getInstance();
    }

    /**
     *
     * @return {Promise<KaMessageBus>}
     */
    async getBus() {
        return await this.get("bus");
    }

    /**
     *
     * @return {Promise<KaEditorConfig>}
     */
    async getConfig() {
        return await this.get("config");
    }

    /**
     *
     * @return {Promise<Facet>}
     */
    async getFacet () {
        return await this.get("facet");
    }
}


EditorContainer.createInstance(new EditorContainer());
