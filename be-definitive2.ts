import {define, BeDecoratedProps} from 'be-decorated/be-decorated.js';
import {BeDefinitiveProps, BeDefinitiveActions} from './types';
import {XE} from 'xtal-element/src/XE.js';
import {TemplMgmtActions, TemplMgmtProps, tm} from 'trans-render/lib/mixins/TemplMgmtWithPEST.js';
import {toTempl} from 'xodus/toTempl.js';

export class BeDefinitiveController{
    intro(self: Element, target: Element, beDecorProps: BeDecoratedProps) {
        let params: any = undefined;
        const attr = 'is-' + beDecorProps.ifWantsToBe!;
        const attrVal = self.getAttribute(attr);
        try{
            params = JSON.parse(attrVal!);
        }catch(e){
            console.error({attr, attrVal, e});
            return;
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
        }
        params.complexPropDefaults = {
            ...(params.complexPropDefaults || {}),
            mainTemplate: toTempl(self, self.localName === params.config.tag && self.shadowRoot !== null),
        }
        params.mixins = [...(params.mixins || []), tm.TemplMgmtMixin];
        const ce = new XE<any, any>(params);
    }
}
export interface BeDefinitiveController extends BeDefinitiveProps{}

const tagName = 'be-definitive';

define<BeDefinitiveProps & BeDecoratedProps, BeDefinitiveActions>({
    config:{
        tagName,
        propDefaults:{
            upgrade: '*',
            ifWantsToBe: 'definitive',
            noParse: true,
            forceVisible: true,
            intro: 'intro',
        }
    },
    complexPropDefaults:{
        controller: BeDefinitiveController
    }
});
document.head.appendChild(document.createElement(tagName));