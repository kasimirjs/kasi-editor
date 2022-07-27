
const KaIndicatorActions = {
    name: {
        name: "Name",
        isValid: (element) => element.hasAttribute("data-ed-name"),

    },
    text: {
        isValid: (element) => element.hasAttribute("data-ed-text"),
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
        isValid: (element) => element.hasAttribute("data-ed-repeat"),



        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            let clone = element.cloneNode(true);
            element.parentElement.insertBefore(clone, element.nextElementSibling);
            (new KaEditorFacet).initElement(clone);
        }
    },
    delete: {
        name: "Delete",
        isValid: (element) => element.hasAttribute("data-ed-repeat"),
        /**
         *
         * @param element {HTMLElement}
         */
        action: (element) => {
            element.remove();
        }
    },

    insert: {
        name: "Append Element...",

        getIndicator: () => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
            '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
            '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
            '</svg>',

        indicatorRow: 1,

        isValid: (element) => element.hasAttribute("data-ed-allow-child"),
        /**
         *
         * @param element {HTMLElement}
         */
        action: async (element) => {
            let tpl = await KaToolsV1.modal.show("ka-insert-modal", {element: element});

            let node = tpl.content.firstElementChild.cloneNode(true);
            element.appendChild(node);
            (new KaEditorFacet).initElement(node);
        }
    }
}


