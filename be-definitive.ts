import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig, EnhancementInfo} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';
import { WCConfig } from 'trans-render/lib/types';
import {Action, TemplMgmt, TemplMgmtActions, TemplMgmtProps, beTransformed} from 'trans-render/lib/mixins/TemplMgmt.js';
//import {} from 'be-hive/types';
export class BeDefinitive extends BE<AP, Actions> implements Actions {
    static override get beConfig(): BEConfig<any> {
        return {
            parse: false,
        } as BEConfig
    }

    override async attach(enhancedElement: Element, enhancementInfo: EnhancementInfo): Promise<void> {

        (enhancedElement as any as TemplMgmtProps).skipTemplateClone = true;
        await super.attach(enhancedElement, enhancementInfo);
        const {enh} = enhancementInfo;
        let params: any = undefined;
        if(enhancedElement.hasAttribute(enh!)){
            const attrVal = enhancedElement.getAttribute(enh!)!.trim();
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
        }else{
            params = {};
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
        propDefaults.transform = propDefaults.transform;
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        };
        config.propInfo = {
            ...(config.propInfo || {})
        };
        if(params!.scriptRef !== undefined){
            const qry = '#' + params!.scriptRef!
            const scriptElement = (enhancedElement.getRootNode() as DocumentFragment).querySelector(qry) || (enhancedElement.shadowRoot?.querySelector(qry)) as any;
            if(scriptElement !== undefined){
                import('be-exportable/be-exportable.js');
                await scriptElement.beEnhanced.whenResolved('be-exportable');
                const exports = scriptElement.exports;
                await this.setParamsFromScript(enhancedElement, exports, params);
            }else{
                console.error({qry, message: '404'});
            }
        }else{
            await this.register(enhancedElement, params!);
        }
        this.resolved = true;
    }

    async setParamsFromScript(self: Element, exports: any, params : any){
        const {complexPropDefaults, mixins, superclass} = params;
        if(complexPropDefaults !== undefined){
            for(const key in complexPropDefaults){
                const val = complexPropDefaults[key] as string;
                complexPropDefaults[key] = exports[val];
            }
        }
        if(mixins !== undefined){
            for(let i = 0, ii = mixins.length; i < ii; i++){
                const mixin = mixins[i];
                mixins[i] = exports[mixin];
            }
        }
        if(superclass !== undefined){
            params.superclass = exports[superclass as any as string];
        }
        await this.register(self, params);
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
    if(!(templateToClone instanceof HTMLTemplateElement)){
        templateToClone = document.createElement('template');
        if(fromShadow){
            const beHive = (templ.shadowRoot!).querySelector('be-hive') as any;
            const div = document.createElement('div');
            div.innerHTML = templ.shadowRoot!.innerHTML;
            const beatified = await beHive.beatify(div);
            templateToClone.innerHTML = div.innerHTML;
            const content = templateToClone.content;
        }else{
            const beHive = (templ.getRootNode() as DocumentFragment).querySelector('be-hive') as any;
            const beatified = await beHive.beatify(templ);
            templateToClone.innerHTML = beatified.innerHTML;
            console.log({innerHTML: beatified.innerHTML});
            // if(tagName === templ.localName){
            //     templ.innerHTML = '';
            // }
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