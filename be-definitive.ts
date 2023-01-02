import {define, BeDecoratedProps} from 'be-decorated/DE.js';
import {Actions, VirtualProps, Proxy} from './types';
import {Action, TemplMgmt, TemplMgmtActions, TemplMgmtProps, beTransformed} from 'trans-render/lib/mixins/TemplMgmt.js';
import {register} from 'be-hive/register.js';
import { WCConfig } from 'trans-render/lib/types';

export class BeDefinitiveController extends EventTarget{
    async intro(proxy: Proxy, target: Element, beDecorProps: BeDecoratedProps) {
        let params: VirtualProps | undefined = undefined;
        const attr = 'is-' + beDecorProps.ifWantsToBe!;
        if(!proxy.hasAttribute(attr)) {
            params = (<any>proxy).beDecorated.definitiveProps;

        }else{
            const attrVal = proxy.getAttribute(attr)!.trim();
            if(attrVal[0] !== '{' && attrVal[0] !== '['){
                params = {
                    config: {
                        tagName: attrVal,
                        propDefaults:{
                            noshadow: target.shadowRoot === null,
                        }
                    }
                } as Partial<VirtualProps> as VirtualProps;
            }else{
                try{
                    params = JSON.parse(attrVal!);
                }catch(e: any){
                    console.error({attr, attrVal, e});
                    proxy.rejected = e.message;
                    return;
                }
            }
        }

        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params!.config = params!.config || {};
        const config = params!.config as WCConfig;
        config.tagName = config.tagName || proxy.localName;
        if(customElements.get(config.tagName)) return;
        config.propDefaults = config.propDefaults || {};
        const {propDefaults} = config;
        propDefaults.transform = propDefaults.transform || {};
        config.actions = {
            ...(config.actions || {}),
            ...beTransformed,
        }
        if(params!.scriptRef !== undefined){
            let exports: any;
            exports = (<any>target.shadowRoot?.querySelector('#' + params!.scriptRef!))?._modExport;
            if(exports === undefined){
                const {importFromScriptRef} = await import('be-exportable/importFromScriptRef.js');
                exports = await importFromScriptRef(target, params!.scriptRef!);
            }
            this.setParamsFromScript(proxy, exports, params!);
        }else{
            this.register(proxy, params!);
        }
        proxy.resolved = true;
    }

    setParamsFromScript(self: Element, exports: any, params : VirtualProps){
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
        this.register(self, params);
    }

    async register(self: Element, params: VirtualProps){
        const tagName = (params.config as WCConfig).tagName;
        const mainTemplate = await toTempl(self, self.localName === tagName && self.shadowRoot !== null, tagName!);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[adopt]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        params.complexPropDefaults = {...params.complexPropDefaults, mainTemplate, styles};
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const {XE} = await import('xtal-element/XE.js');
        const ce = new XE<any, any>(params);
        
    }
}

const tagName = 'be-definitive';
const ifWantsToBe = 'definitive';
const upgrade = '*';
define<VirtualProps & BeDecoratedProps, Actions>({
    config:{
        tagName,
        propDefaults:{
            upgrade,
            ifWantsToBe,
            noParse: true,
            forceVisible: ['template'],
            intro: 'intro',
        }
    },
    complexPropDefaults:{
        controller: BeDefinitiveController
    }
});
register(ifWantsToBe, upgrade, tagName);

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