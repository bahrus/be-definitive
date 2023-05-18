import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig, EnhancementInfo} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';
import { WCConfig } from 'trans-render/lib/types';
import {Action, TemplMgmt, TemplMgmtActions, TemplMgmtProps, beTransformed} from 'trans-render/lib/mixins/TemplMgmt.js';

export class BeDefinitive extends BE<AP, Actions> implements Actions {
    static override get beConfig(): BEConfig<any> {
        return {
            parse: false,
        } as BEConfig
    }

    override async attach(enhancedElement: Element, enhancementInfo: EnhancementInfo): Promise<void> {
        await super.attach(enhancedElement, enhancementInfo);
        const {enh} = enhancementInfo;
        let params: any= undefined;
        const attrVal = enhancedElement.getAttribute(enh)!.trim();
        if(attrVal[0] !== '{' && attrVal[0] !== '['){
            params = {
                config: {
                    tagName: attrVal,
                    propDefaults:{
                        noshadow: enhancedElement.shadowRoot === null,
                    }
                }
            };
        }else{
            try{
                params = JSON.parse(attrVal!);
            }catch(e: any){
                console.error({enh, attrVal, e});
                this.rejected = true;
                return;
            }
        }

        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params!.config = params!.config || {};
        const config = params!.config as WCConfig;
        let tagName = config.tagName || enhancedElement.localName;
        if(tagName.indexOf('-') === -1) tagName = enhancedElement.id;
        config.tagName = tagName;
        if(customElements.get(config.tagName)) return;
        config.propDefaults = config.propDefaults || {};
        const {propDefaults} = config;
        propDefaults.transform = propDefaults.transform || {};
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        };
        config.propInfo = {
            ...(config.propInfo || {})
        };
        if(params!.scriptRef !== undefined){
            throw 'NI';
            // let exports: any;
            // //TODO, this has changed
            // exports = (<any>enhancedElement.shadowRoot?.querySelector('#' + params!.scriptRef!))?._modExport;
            // if(exports === undefined){
            //     const {importFromScriptRef} = await import('be-exportable/importFromScriptRef.js');
            //     exports = await importFromScriptRef(target, params!.scriptRef!);
            // }
            // this.setParamsFromScript(proxy, exports, params!);
        }else{
            await this.register(enhancedElement, params!);
        }
        this.resolved = true;
    }

    async register(self: Element, params:any){
        const tagName = (params.config as WCConfig).tagName;
        const mainTemplate = await toTempl(self, self.localName === tagName && self.shadowRoot !== null, tagName!);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[adopt]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        const beGone = mainTemplate.content.querySelectorAll('[be-gone],[data-be-gone]').forEach(g => g.remove());
        params.complexPropDefaults = {...params.complexPropDefaults, mainTemplate, styles};
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const {XE} = await import('xtal-element/XE.js');
        const ce = new XE<any, any>(params);
        
    }


}

export async function toTempl(templ: Element, fromShadow: boolean, tagName: string){
    let templateToClone = templ as HTMLTemplateElement;
    const {beatify} = await import('be-hive/beatify.js');
    if(!(templateToClone instanceof HTMLTemplateElement)){
        templateToClone = document.createElement('template');
        if(fromShadow){
            templateToClone.innerHTML = templ.shadowRoot!.innerHTML;
            const content = templateToClone.content;
            const beHive = content.querySelector('be-hive');
            if(beHive !== null){
                beatify(content, beHive);
            }
        }else{

            templateToClone.innerHTML = templ.innerHTML;
            const beHive = (templ.getRootNode() as DocumentFragment).querySelector('be-hive');
            beatify(templateToClone.content, beHive!);
            if(tagName === templ.localName){
                templ.innerHTML = '';
            }
        }
        
                
    }
    return templateToClone;
}

export interface BeDefinitive extends AllProps{}

const tagName = 'be-definitive';
const ifWantsToBe = 'definitive';
const upgrade = '*';

const xe = new XE<AP, Actions>({
    config: {
        tagName,
        propDefaults: {
            ...propDefaults,
        }, 
        propInfo: {
            ...propInfo
        },
        actions: {

        }
    },
    superclass: BeDefinitive
});

register(ifWantsToBe, upgrade, tagName);