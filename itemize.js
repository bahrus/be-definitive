import 'be-linked/be-linked.js';
import { getIPsInScope } from 'be-linked/getIPsInScope.js';
const defaultProp = {
    parse: false,
    type: 'Object'
};
export function itemize(container) {
    const returnObj = {};
    //TODO: use @scoped css selector when available
    const itemscopes = Array.from(container.querySelectorAll('[itemscope]'));
    for (const itemscope of itemscopes) {
        const { parentElement } = itemscope;
        if (parentElement !== null && parentElement.closest('[itemscope]') !== null)
            continue;
        const ips = getIPsInScope(itemscope);
        for (const ip of ips) {
            const { names } = ip;
            for (const name of names) {
                if (returnObj[name])
                    continue;
                returnObj[name] = { ...defaultProp };
            }
        }
    }
    return returnObj;
}
