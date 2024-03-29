//import {PropInfoExt2} from './types';
import 'be-linked/be-linked.js';
import { getIPsInScope } from 'be-linked/getIPsInScope.js';
import { getItemPropVal } from 'be-linked/getItemPropVal.js';
// const defaultProp:PropInfoExt2 = {
//     type: 'String'
// }
export async function itemize(container) {
    const returnObj = {};
    //TODO: use @scoped css selector when available
    const itemscopes = Array.from(container.querySelectorAll('[itemscope]'));
    for (const itemscope of itemscopes) {
        const { parentElement } = itemscope;
        if (parentElement !== null && parentElement.closest('[itemscope]') !== null)
            continue;
        const ips = getIPsInScope(itemscope);
        if (ips.length === 0)
            continue;
        const attrName = itemscope.localName.includes('-') ? 'enh-by-be-linked' : 'be-linked';
        if (!itemscope.hasAttribute(attrName)) {
            itemscope.setAttribute(attrName, 'Share * from $1.');
        }
        for (const ip of ips) {
            const { names, el } = ip;
            let defaultVal = await getItemPropVal(el);
            if (defaultVal === undefined) {
                defaultVal = el.textContent;
            }
            for (const name of names) {
                if (returnObj[name])
                    continue;
                returnObj[name] = defaultVal;
            }
        }
    }
    return returnObj;
}
