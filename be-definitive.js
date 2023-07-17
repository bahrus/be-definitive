import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { TemplMgmt, beTransformed } from 'trans-render/lib/mixins/TemplMgmt.js';
import { toTempl } from 'be-hive/toTempl.js';
export class BeDefinitive extends BE {
    static get beConfig() {
        return {
            parse: false,
        };
    }
    async attach(enhancedElement, enhancementInfo) {
        let wcElement = enhancedElement, attrElement = enhancedElement, isLocal = false;
        const { localName } = enhancedElement;
        const isScript = localName === 'script';
        if (localName === 'be-hive' || isScript) {
            const { findRealm } = await import('trans-render/lib/findRealm.js');
            wcElement = await findRealm(enhancedElement, 'hostish');
            attrElement = enhancedElement;
            isLocal = true;
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
            if (isLocal) {
                attrElement.removeAttribute(enh);
            }
        }
        else {
            params = {};
        }
        const { scriptRef } = params;
        if (scriptRef || isScript) {
            const qry = `#${scriptRef}`;
            const scriptElement = (isScript ? enhancedElement :
                attrElement.getRootNode().querySelector(qry) || (wcElement.shadowRoot?.querySelector(qry)));
            if (!scriptElement) {
                throw { qry, message: '404' };
            }
            import('be-exportable/be-exportable.js');
            const beExpAP = await scriptElement.beEnhanced.whenResolved('be-exportable');
            await this.setParamsFromScript(enhancedElement, beExpAP.exports, params);
        }
        params.config = params.config || {};
        const config = params.config;
        let tagName = config.tagName || wcElement.localName;
        if (tagName.indexOf('-') === -1)
            tagName = wcElement.id;
        config.tagName = tagName;
        if (customElements.get(config.tagName))
            return;
        config.propDefaults = config.propDefaults || {};
        //const {propDefaults} = config;
        //propDefaults.transform = propDefaults.transform;
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        };
        config.propInfo = {
            ...(config.propInfo || {})
        };
        await this.register(wcElement, params);
        this.resolved = true;
    }
    async setParamsFromScript(self, exports, params) {
        const { complexPropDefaults, mixins, superclass, complexConfig } = params;
        if (complexConfig !== undefined) {
            const obj = exports[complexConfig];
            const config = params.config || {};
            Object.assign(config, obj);
            params.config = config;
        }
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
        //await this.register(self, params);
    }
    async register(self, params) {
        const { config } = params;
        const { propDefaults } = config;
        const tagName = config.tagName;
        const selfDefining = self.localName === tagName;
        const fromShadow = selfDefining && self.shadowRoot !== null;
        if (fromShadow) {
            propDefaults['shadowRootMode'] = self.shadowRoot.mode;
        }
        const content = fromShadow ? self.shadowRoot : self;
        if (selfDefining && content.querySelector('[itemscope]') !== null) {
            const { itemize } = await import('./itemize.js');
            const props = await itemize(content);
            for (const propName in props) {
                if (propName in propDefaults)
                    continue;
                propDefaults[propName] = props[propName];
            }
            //console.log({props});
        }
        const mainTemplate = await toTempl(self, fromShadow, self);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[adopt]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        mainTemplate.content.querySelectorAll('[be-gone],[data-be-gone]').forEach(g => g.remove());
        params.complexPropDefaults = { ...params.complexPropDefaults, mainTemplate, styles };
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const { XE } = await import('xtal-element/XE.js');
        const ce = new XE(params);
    }
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
