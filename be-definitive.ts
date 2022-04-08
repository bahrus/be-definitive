import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeDefinitiveProps, BeDefinitiveActions, BeDefinitiveVirtualProps} from './types';
import {Action, TemplMgmt, TemplMgmtActions, TemplMgmtProps, beTransformed} from 'trans-render/lib/mixins/TemplMgmt.js';
import {register} from 'be-hive/register.js';

export class BeDefinitiveController{
    async intro(self: Element, target: Element, beDecorProps: BeDecoratedProps) {
        let params: BeDefinitiveVirtualProps | undefined = undefined;
        const attr = 'is-' + beDecorProps.ifWantsToBe!;
        const attrVal = self.getAttribute(attr)!.trim();
        if(attrVal[0] !== '{' && attrVal[0] !== '['){
            params = {
                config: {
                    tagName: attrVal
                }
            };
        }else{
            try{
                params = JSON.parse(attrVal!);
            }catch(e){
                console.error({attr, attrVal, e});
                return;
            }
        }
        //const doUpdateTransformProps = Object.keys(params!.config.propDefaults || {});
        params!.config = params!.config || {};
        const {config} = params!;
        config.tagName = config.tagName || self.localName;
        config.propDefaults = config.propDefaults || {};
        const {propDefaults} = config;
        propDefaults.transform = propDefaults.transform || {};
        params!.config.actions = {
            ...(params!.config.actions || {}),
            ...beTransformed,
        }
        if(params!.scriptRef !== undefined){
            const script = (self.getRootNode() as DocumentFragment)!.querySelector('#' + params!.scriptRef) as HTMLScriptElement;
            if(script.dataset.loaded !== undefined){
                this.setParamsFromScript(self, script, params!);
            }else{
                script.addEventListener('load', () => {
                    this.setParamsFromScript(self, script, params!);
                }, {once: true});
            }

        }else{
            this.register(self, params!);
        }
    }

    setParamsFromScript(self: Element, {_modExport}: any, params : BeDefinitiveVirtualProps){
        const {complexPropDefaults, mixins, superclass, transformPlugins} = params;
        if(complexPropDefaults !== undefined){
            for(const key in complexPropDefaults){
                const val = complexPropDefaults[key] as string;
                complexPropDefaults[key] = _modExport[val];
            }
        }
        if(mixins !== undefined){
            for(let i = 0, ii = mixins.length; i < ii; i++){
                const mixin = mixins[i];
                mixins[i] = _modExport[mixin];
            }
        }
        if(superclass !== undefined){
            params.superclass = _modExport[superclass as any as string];
        }
        if(transformPlugins !== undefined){
            for(const key in transformPlugins){
                const val = transformPlugins[key] as string;
                transformPlugins[key] = _modExport[val];
            }
        }
        this.register(self, params);
    }

    async register(self: Element, params: BeDefinitiveVirtualProps){
        const mainTemplate = await toTempl(self, self.localName === params.config.tagName && self.shadowRoot !== null);
        //TODO:  make this a transform plugin?
        const adopted = Array.from(mainTemplate.content.querySelectorAll('style[be-adopted]'));
        const styles = adopted.map(s => {
            const inner = s.innerHTML;
            s.remove();
            return inner;
        }).join('');
        params.complexPropDefaults = {...params.complexPropDefaults, mainTemplate, styles};
        params.mixins = [...(params.mixins || []), TemplMgmt];
        const {XE} = await import('xtal-element/src/XE.js');
        const ce = new XE<any, any>(params);
    }
}
export interface BeDefinitiveController extends BeDefinitiveProps{}

const tagName = 'be-definitive';
const ifWantsToBe = 'definitive';
const upgrade = '*';
define<BeDefinitiveProps & BeDecoratedProps, BeDefinitiveActions>({
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

export async function toTempl(templ: Element, fromShadow: boolean){
    let templateToClone = templ as HTMLTemplateElement;
    if(!(templateToClone instanceof HTMLTemplateElement)){
        templateToClone = document.createElement('template');
        if(fromShadow){
            templateToClone.innerHTML = templ.shadowRoot!.innerHTML;
            const content = templateToClone.content;
            const beHive = content.querySelector('be-hive');
            if(beHive !== null){
                const {freeze} = await import('trans-render/lib/freeze.js');
                freeze(content, beHive);
                // const decoratorElements = Array.from(beHive.children) as any as BeDecoratedProps[];
                // for(const decorEl of decoratorElements){
                //     const ifWantsToBe = (decorEl as any as Element).getAttribute('if-wants-to-be');
                //     if(ifWantsToBe === undefined) continue;
                //     const isAttr = 'is-' + ifWantsToBe;
                //     const beAttr = 'be-' + ifWantsToBe;
                //     const converted = Array.from(content.querySelectorAll(`[${isAttr}]`));
                //     for(const el of converted){
                //         const attr = el.getAttribute(isAttr)!;
                //         el.removeAttribute(isAttr);
                //         el.setAttribute(beAttr, attr);
                //     }
                // }
            }
        }else{
            templateToClone.innerHTML = templ.innerHTML;
        }
                
    }
    // insertMoustache('x-f', templateToClone);
    // insertMoustache('data-xf', templateToClone);
    return templateToClone;
}