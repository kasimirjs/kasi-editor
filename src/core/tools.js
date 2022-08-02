
let ka_last_id = 0;

/**
 * Generate a unique id and return it
 * @returns {string}
 */
export function ka_ed_generate_id() {
    ka_last_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    return ka_last_id;
}

/**
 * Get the last generated id
 *
 * @returns {number}
 */
export function ka_ed_get_last_id() {
    return ka_last_id;
}
