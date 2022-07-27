/**
 * Create a new Element
 *
 * @param tagName {string}      The Tag Name
 * @param attributes {string<string>}   Attributes to set initially
 * @param appendToElement {HTMLElement}
 * @param children {HTMLElement[]}
 * @return HTMLElement
 */
KaToolsV1.createElement = (tagName, attributes = null,  children = null, appendToElement = null) => {
    let e = document.createElement(tagName);
    if (attributes === null)
        attributes = {}

    for(let attName in attributes) {
        e.setAttribute(attName, attributes[attName]);
    }

    if (Array.isArray(children)) {
        for(let ce of children)
            e.appendChild(ce);
    }

    if (appendToElement !== null) {
        appendToElement.appendChild(e);
    }
    return e;
}
