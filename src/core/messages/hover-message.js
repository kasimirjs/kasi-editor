import {KaMessage} from "kasimir-embed/src/default/Message";


export class HoverMessage extends KaMessage {

    constructor(element) {
        super();
        this.element = element;
    }
}
