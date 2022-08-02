import {KaMessage} from "kasimir-embed/src/default/Message";


export class SelectMessage extends KaMessage {

    constructor(element, origin=null) {
        super();
        this.element = element;

        /**
         *
         * @type {string}   sidebar|null
         */
        this.origin = origin;
    }
}
