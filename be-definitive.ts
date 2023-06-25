import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig, EnhancementInfo} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA, EndUserProps} from './types';
import {register} from 'be-hive/register.js';
import { WCConfig } from 'trans-render/lib/types';
import {Action, TemplMgmt, TemplMgmtActions, TemplMgmtProps, beTransformed} from 'trans-render/lib/mixins/TemplMgmt.js';
import {AllProps as BeExportableAP} from 'be-exportable/types';

export class BeDefinitive extends BE<AP, Actions> implements Actions {
    static override get beConfig(): BEConfig<any> {
        return {
            parse: false,
        } as BEConfig
    }

    override async attach(enhancedElement: Element, enhancementInfo: EnhancementInfo): Promise<void> {
        let wcElement = enhancedElement, attrElement = enhancedElement, isLocal = false;
        const {localName} = enhancedElement;
        const isScript = localName === 'script';
        if(localName === 'be-hive' || isScript){ 
            const {findRealm} = await import('trans-render/lib/findRealm.js');
            wcElement = await findRealm(enhancedElement, 'hostish') as Element; 
            attrElement = enhancedElement;
            isLocal = true;
        }
        (wcElement as any as TemplMgmtProps).skipTemplateClone = true;
        await super.attach(attrElement, enhancementInfo);
        const {enh} = enhancementInfo;
        let params: Partial<EndUserProps> | undefined = undefined;
        if(attrElement.hasAttribute(enh!)){
            const attrVal = attrElement.getAttribute(enh!)!.trim();
            if(attrVal[0] !== '{' && attrVal[0] !== '['){
                params = {
                    config: {
                        tagName: attrVal,
                        propDefaults:{
                            noshadow: wcElement.shadowRoot === null,
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
            if(isLocal){
                attrElement.removeAttribute(enh!);
            }
        }else{
            params = {};
        }
        const {scriptRef} = params!;
        if(scriptRef || isScript){
            const qry = `#${scriptRef}`
            const scriptElement = (isScript ? enhancedElement :
                (attrElement.getRootNode() as DocumentFragment).querySelector(qry) || (wcElement.shadowRoot?.querySelector(qry))) as HTMLScriptElement;
            if(!scriptElement){
                throw {qry, message: '404'};
            }
            import('be-exportable/be-exportable.js');
            const beExpAP =  await (<any>scriptElement).beEnhanced.whenResolved('be-exportable') as BeExportableAP;
            await this.setParamsFromScript(enhancedElement, beExpAP.exports, params!);
        }

        params!.config = params!.config || {};
        const config = params!.config as WCConfig;
        let tagName = config.tagName || wcElement.localName;
        if(tagName.indexOf('-') === -1) tagName = wcElement.id;
        config.tagName = tagName;
        if(customElements.get(config.tagName)) return;
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
        await this.register(wcElement, params!);
        this.resolved = true;
    }

    async setParamsFromScript(self: Element, exports: any, params : Partial<EndUserProps>){
        const {complexPropDefaults, mixins, superclass, complexConfig} = params;
        if(complexConfig !== undefined){
            const obj = exports[complexConfig];
            const config = params.config || {};
            Object.assign(config, obj);
            params.config = config;
        }
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
        //await this.register(self, params);
    }

    async register(self: Element, params:any){
        const {config}: {config: WCConfig} = params;
        const tagName = config.tagName;
        const fromShadow = self.localName === tagName && self.shadowRoot !== null;
        const content = fromShadow ? self.shadowRoot : self;
        if(content.querySelector('[itemscope]') !== null){
            const {itemize} = await import('./itemize.js');
            const props = itemize(content);
            console.log({props});
        }
        const mainTemplate = await toTempl(self, fromShadow, tagName!);

        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[adopt]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        mainTemplate.content.querySelectorAll('[be-gone],[data-be-gone]').forEach(g => g.remove());
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
            if(beHive){
                const div = document.createElement('div');
                div.innerHTML = templ.shadowRoot!.innerHTML;
                const beatified = await beHive.beatify(div);
                templateToClone.innerHTML = beatified.innerHTML;
            }else{
                templateToClone.innerHTML = templ.shadowRoot!.innerHTML;
            }
        }else{
            const beHive = (templ.getRootNode() as DocumentFragment).querySelector('be-hive') as any;
            const beatified = await beHive.beatify(templ);
            templateToClone.innerHTML = beatified.innerHTML;
            
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