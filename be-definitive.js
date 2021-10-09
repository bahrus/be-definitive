import { XtalDecor } from 'xtal-decor/xtal-decor.js';
import { CE } from 'trans-render/lib/CE.js';
import { tm } from 'trans-render/lib/mixins/TemplMgmtWithPEST.js';
import { toTempl } from 'xodus/toTempl.js';
const ce = new CE({
    config: {
        tagName: 'be-definitive',
        propDefaults: {
            upgrade: '*',
            ifWantsToBe: 'definitive',
            noParse: true,
            forceVisible: true,
        }
    },
    complexPropDefaults: {
        actions: [],
        on: {},
        init: (self, decor) => {
            let params = undefined;
            const attr = 'is-' + decor.ifWantsToBe;
            const attrVal = self.getAttribute(attr);
            try {
                params = JSON.parse(attrVal);
            }
            catch (e) {
                console.error({ attr, attrVal, e });
                return;
            }
            const doUpdateTransformProps = Object.keys(params.config.propDefaults || {});
            params.config = params.config || {};
            params.config.tagName = params.config.tagName || self.localName;
            params.actions = {
                ...(params.config.actions || {}),
                ...tm.doInitTransform,
                doUpdateTransform: {
                    ifKeyIn: doUpdateTransformProps,
                }
            };
            params.complexPropDefaults = {
                ...(params.complexPropDefaults || {}),
                mainTemplate: toTempl(self, self.localName === params.config.tag && self.shadowRoot !== null),
            };
            const ce = new CE(params);
        },
        finale: (self, target) => {
        }
    },
    superclass: XtalDecor
});
document.head.appendChild(document.createElement('be-definitive'));
