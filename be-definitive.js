import { define } from 'be-decorated/DE.js';
import { TemplMgmt, beTransformed } from 'trans-render/lib/mixins/TemplMgmt.js';
import { register } from 'be-hive/register.js';
export class BeDefinitiveController extends EventTarget {
    async intro(proxy, target, beDecorProps) {
        let params = undefined;
        const attr = 'is-' + beDecorProps.ifWantsToBe;
        if (!proxy.hasAttribute(attr)) {
            params = proxy.beDecorated.definitiveProps;
        }
        else {
            const attrVal = proxy.getAttribute(attr).trim();
            if (attrVal[0] !== '{' && attrVal[0] !== '[') {
                params = {
                    config: {
                        tagName: attrVal,
                        propDefaults: {
                            noshadow: target.shadowRoot === null,
                        }
                    }
                };
            }
            else {
                try {
                    params = JSON.parse(attrVal);
                }
                catch (e) {
                    console.error({ attr, attrVal, e });
                    proxy.rejected = e.message;
                    return;
                }
            }
        }
        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params.config = params.config || {};
        const config = params.config;
        let tagName = config.tagName || target.localName;
        if (tagName.indexOf('-') === -1)
            tagName = target.id;
        config.tagName = tagName;
        if (customElements.get(config.tagName))
            return;
        config.propDefaults = config.propDefaults || {};
        const { propDefaults } = config;
        propDefaults.transform = propDefaults.transform || {};
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        };
        if (params.scriptRef !== undefined) {
            let exports;
            exports = target.shadowRoot?.querySelector('#' + params.scriptRef)?._modExport;
            if (exports === undefined) {
                const { importFromScriptRef } = await import('be-exportable/importFromScriptRef.js');
                exports = await importFromScriptRef(target, params.scriptRef);
            }
            this.setParamsFromScript(proxy, exports, params);
        }
        else {
            this.register(proxy, params);
        }
        proxy.resolved = true;
    }
    setParamsFromScript(self, exports, params) {
        const { complexPropDefaults, mixins, superclass } = params;
        if (complexPropDefaults !== undefined) {
            for (const key in complexPropDefaults) {
                const val = complexPropDefaults[key];
                complexPropDefaults[key] = exports[val];
            }
        }
        if (mixins !== undefined) {
            for (let i = 0, ii = mixins.length; i < ii; i++) {
                const mixin = mixins[i];
                mixins[i] = exports[mixin];
            }
        }
        if (superclass !== undefined) {
            params.superclass = exports[superclass];
        }
        this.register(self, params);
    }
    async register(self, params) {
        const tagName = params.config.tagName;
        const mainTemplate = await toTempl(self, self.localName === tagName && self.shadowRoot !== null, tagName);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[adopt]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        const beGone = mainTemplate.content.querySelectorAll('[be-gone],[data-be-gone]').forEach(g => g.remove());
        params.complexPropDefaults = { ...params.complexPropDefaults, mainTemplate, styles };
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const { XE } = await import('xtal-element/XE.js');
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
export async function toTempl(templ, fromShadow, tagName) {
    let templateToClone = templ;
    const { beatify } = await import('be-hive/beatify.js');
    if (!(templateToClone instanceof HTMLTemplateElement)) {
        templateToClone = document.createElement('template');
        if (fromShadow) {
            templateToClone.innerHTML = templ.shadowRoot.innerHTML;
            const content = templateToClone.content;
            const beHive = content.querySelector('be-hive');
            if (beHive !== null) {
                beatify(content, beHive);
            }
        }
        else {
            templateToClone.innerHTML = templ.innerHTML;
            const beHive = templ.getRootNode().querySelector('be-hive');
            beatify(templateToClone.content, beHive);
            if (tagName === templ.localName) {
                templ.innerHTML = '';
            }
        }
    }
    return templateToClone;
}
