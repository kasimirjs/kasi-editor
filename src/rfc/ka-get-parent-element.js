/**
 * Find and return the parent Element of element in parameter 2
 * matching the selector or element in parameter 1
 *
 * return null if not found
 *
 * @param selector {HTMLElement|string}    The Element or a css selector
 * @param element {HTMLElement}
 * @return {HTMLElement|null}
 */
KaToolsV1.getParentElement = (selector, element) => {
    if (selector instanceof HTMLElement) {
        if (selector === element) {
            return element;
        }
    } else {
        if (element.matches(selector))
            return element;
    }
    if (element.parentElement === null)
        return null;
    return KaToolsV1.getParentElement(selector, element.parentElement);
}
