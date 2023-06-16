import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { TemplMgmt, beTransformed } from 'trans-render/lib/mixins/TemplMgmt.js';
//import {} from 'be-hive/types';
export class BeDefinitive extends BE {
    static get beConfig() {
        return {
            parse: false,
        };
    }
    async attach(enhancedElement, enhancementInfo) {
        let wcElement = enhancedElement, attrElement = enhancedElement;
        if (enhancedElement.localName === 'be-hive' || enhancedElement.localName === 'script') {
            const { findRealm } = await import('trans-render/lib/findRealm.js');
            wcElement = await findRealm(enhancedElement, 'hostish');
            attrElement = enhancedElement;
        }
        wcElement.skipTemplateClone = true;
        await super.attach(attrElement, enhancementInfo);
        const { enh } = enhancementInfo;
        let params = undefined;
        if (attrElement.hasAttribute(enh)) {
            const attrVal = attrElement.getAttribute(enh).trim();
            if (attrVal[0] !== '{' && attrVal[0] !== '[') {
                params = {
                    config: {
                        tagName: attrVal,
                        propDefaults: {
                            noshadow: wcElement.shadowRoot === null,
                        }
                    }
                };
            }
            else {
                try {
                    params = JSON.parse(attrVal);
                }
                catch (e) {
                    console.error({ enh, attrVal, e });
                    this.rejected = true;
                    return;
                }
            }
        }
        else {
            params = {};
        }
        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params.config = params.config || {};
        const config = params.config;
        let tagName = config.tagName || wcElement.localName;
        if (tagName.indexOf('-') === -1)
            tagName = wcElement.id;
        config.tagName = tagName;
        if (customElements.get(config.tagName))
            return;
        config.propDefaults = config.propDefaults || {};
        const { propDefaults } = config;
        propDefaults.transform = propDefaults.transform;
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        };
        config.propInfo = {
            ...(config.propInfo || {})
        };
        if (params.scriptRef !== undefined) {
            const qry = '#' + params.scriptRef;
            const scriptElement = attrElement.getRootNode().querySelector(qry) || (wcElement.shadowRoot?.querySelector(qry));
            if (scriptElement !== undefined) {
                import('be-exportable/be-exportable.js');
                await scriptElement.beEnhanced.whenResolved('be-exportable');
                const exports = scriptElement.exports;
                await this.setParamsFromScript(enhancedElement, exports, params);
            }
            else {
                console.error({ qry, message: '404' });
            }
        }
        else {
            await this.register(wcElement, params);
        }
        this.resolved = true;
    }
    async setParamsFromScript(self, exports, params) {
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
        await this.register(self, params);
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
export async function toTempl(templ, fromShadow, tagName) {
    let templateToClone = templ;
    if (!(templateToClone instanceof HTMLTemplateElement)) {
        templateToClone = document.createElement('template');
        if (fromShadow) {
            const beHive = (templ.shadowRoot).querySelector('be-hive');
            if (beHive) {
                const div = document.createElement('div');
                div.innerHTML = templ.shadowRoot.innerHTML;
                const beatified = await beHive.beatify(div);
                templateToClone.innerHTML = div.innerHTML;
            }
            else {
                templateToClone.innerHTML = templ.shadowRoot.innerHTML;
            }
            //const content = templateToClone.content;
        }
        else {
            const beHive = templ.getRootNode().querySelector('be-hive');
            const beatified = await beHive.beatify(templ);
            templateToClone.innerHTML = beatified.innerHTML;
            //console.log({innerHTML: beatified.innerHTML});
            // if(tagName === templ.localName){
            //     templ.innerHTML = '';
            // }
        }
    }
    return templateToClone;
}
const tagName = 'be-definitive';
const ifWantsToBe = 'definitive';
const upgrade = '*';
const xe = new XE({
    config: {
        tagName,
        propDefaults: {
            ...propDefaults,
        },
        propInfo: {
            ...propInfo
        },
        actions: {}
    },
    superclass: BeDefinitive
});
register(ifWantsToBe, upgrade, tagName);
