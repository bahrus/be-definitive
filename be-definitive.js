import { define } from 'be-decorated/be-decorated.js';
import { TemplMgmt, beTransformed } from 'trans-render/lib/mixins/TemplMgmt.js';
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
        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params.config = params.config || {};
        const { config } = params;
        config.tagName = config.tagName || self.localName;
        config.propDefaults = config.propDefaults || {};
        const { propDefaults } = config;
        propDefaults.transform = propDefaults.transform || {};
        params.config.actions = {
            ...(params.config.actions || {}),
            ...beTransformed,
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
        const { complexPropDefaults, mixins, superclass, transformPlugins } = params;
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
        if (transformPlugins !== undefined) {
            for (const key in transformPlugins) {
                const val = transformPlugins[key];
                transformPlugins[key] = _modExport[val];
            }
        }
        this.register(self, params);
    }
    async register(self, params) {
        const mainTemplate = toTempl(self, self.localName === params.config.tagName && self.shadowRoot !== null);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[be-adopted]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        params.complexPropDefaults = { ...params.complexPropDefaults, mainTemplate, styles };
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const { XE } = await import('xtal-element/src/XE.js');
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
export function toTempl(templ, fromShadow) {
    let templateToClone = templ;
    if (!(templateToClone instanceof HTMLTemplateElement)) {
        templateToClone = document.createElement('template');
        if (fromShadow) {
            templateToClone.innerHTML = templ.shadowRoot.innerHTML;
            const content = templateToClone.content;
            const beHive = content.querySelector('be-hive');
            if (beHive !== null) {
                const decoratorElements = Array.from(beHive.children);
                for (const decorEl of decoratorElements) {
                    const ifWantsToBe = decorEl.getAttribute('if-wants-to-be');
                    if (ifWantsToBe === undefined)
                        continue;
                    const isAttr = 'is-' + ifWantsToBe;
                    const beAttr = 'be-' + ifWantsToBe;
                    const converted = Array.from(content.querySelectorAll(`[${isAttr}]`));
                    for (const el of converted) {
                        const attr = el.getAttribute(isAttr);
                        el.removeAttribute(isAttr);
                        el.setAttribute(beAttr, attr);
                    }
                }
            }
        }
        else {
            templateToClone.innerHTML = templ.innerHTML;
        }
    }
    // insertMoustache('x-f', templateToClone);
    // insertMoustache('data-xf', templateToClone);
    return templateToClone;
}
