import { define } from 'be-decorated/be-decorated.js';
import { XE } from 'xtal-element/src/XE.js';
import { tm } from 'trans-render/lib/mixins/TemplMgmtWithPEST.js';
import { toTempl } from 'xodus/toTempl.js';
import { register } from 'be-hive/register.js';
export class BeDefinitiveController {
    intro(self, target, beDecorProps) {
        let params = undefined;
        const attr = 'is-' + beDecorProps.ifWantsToBe;
        const attrVal = self.getAttribute(attr).trim();
        if (attrVal[0] !== '{' && attrVal[0] !== '[') {
            params = {
                config: {
                    tagName: attrVal
                }
            };
        }
        else {
            try {
                params = JSON.parse(attrVal);
            }
            catch (e) {
                console.error({ attr, attrVal, e });
                return;
            }
        }
        const doUpdateTransformProps = Object.keys(params.config.propDefaults || {});
        params.config = params.config || {};
        params.config.tagName = params.config.tagName || self.localName;
        params.config.actions = {
            ...(params.config.actions || {}),
            ...tm.doInitTransform,
            doUpdateTransform: {
                ifKeyIn: doUpdateTransformProps,
            }
        };
        params.complexPropDefaults = {
            ...(params.complexPropDefaults || {}),
            mainTemplate: toTempl(self, self.localName === params.config.tagName && self.shadowRoot !== null),
        };
        params.mixins = [...(params.mixins || []), tm.TemplMgmtMixin];
        const ce = new XE(params);
    }
}
const tagName = 'be-definitive';
const ifWantsToBe = 'definitive';
const upgrade = '*';
define({
    config: {
        tagName,
        propDefaults: {
            upgrade,
            ifWantsToBe,
            noParse: true,
            forceVisible: true,
            intro: 'intro',
        }
    },
    complexPropDefaults: {
        controller: BeDefinitiveController
    }
});
register(ifWantsToBe, upgrade, tagName);
