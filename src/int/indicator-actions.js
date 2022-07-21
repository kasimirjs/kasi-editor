
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


