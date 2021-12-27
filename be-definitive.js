import { define } from 'be-decorated/be-decorated.js';
import { XE } from 'xtal-element/src/XE.js';
import { tm } from 'trans-render/lib/mixins/TemplMgmtWithPEST.js';
import { toTempl } from 'xodus/toTempl.js';
import { register } from 'be-hive/register.js';
export class BeDefinitiveController {
    async intro(self, target, beDecorProps) {
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
        if (params.scriptRef !== undefined) {
            const script = self.getRootNode().querySelector('#' + params.scriptRef);
            if (script.dataset.loaded !== undefined) {
                this.setParamsFromScript(self, script, params);
            }
            else {
                script.addEventListener('load', () => {
                    this.setParamsFromScript(self, script, params);
                }, { once: true });
            }
        }
        else {
            this.register(self, params);
        }
    }
    setParamsFromScript(self, { _modExport }, params) {
        const { complexPropDefaults, mixins, superclass } = params;
        if (complexPropDefaults !== undefined) {
            for (const key in complexPropDefaults) {
                const val = complexPropDefaults[key];
                complexPropDefaults[key] = _modExport[val];
            }
        }
        if (mixins !== undefined) {
            for (let i = 0, ii = mixins.length; i < ii; i++) {
                const mixin = mixins[i];
                mixins[i] = _modExport[mixin];
            }
        }
        if (superclass !== undefined) {
            params.superclass = _modExport[superclass];
        }
        this.register(self, params);
    }
    register(self, params) {
        params.complexPropDefaults = { ...params.complexPropDefaults, mainTemplate: toTempl(self, self.localName === params.config.tagName && self.shadowRoot !== null) };
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
            forceVisible: ['template'],
            intro: 'intro',
        }
    },
    complexPropDefaults: {
        controller: BeDefinitiveController
    }
});
register(ifWantsToBe, upgrade, tagName);
