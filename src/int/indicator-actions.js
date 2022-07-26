
const KaIndicatorActions = {
    name: {
        name: "Name",
        on: ["data-ed-name"],

    },
    text: {
        on: ["data-ed-text"],
        /**
         *
         * @param element {HTMLElement}
         */
        onSelect: (element) => {
            element.contentEditable = true
            element.focus();
        },
        onDeSelect: (element) => {
            if (element.textContent === "")
                element.innerHTML = "";
            element.contentEditable = false
        }

    },
    duplicate: {
        name: "Duplicate",
        on: ["data-ed-repeat"],

        getIndicator: () => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
            '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
            '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
            '</svg>',

        indicatorRow: 1,

        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            let clone = element.cloneNode(true);
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


