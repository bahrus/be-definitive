import {XtalDecor, XtalDecorCore} from 'xtal-decor/xtal-decor.js';
import { XtalDecorProps } from 'xtal-decor/types';
import {CE} from 'trans-render/lib/CE.js';
import {TemplMgmtActions, TemplMgmtProps, tm} from 'trans-render/lib/mixins/TemplMgmtWithPEST.js';
import {DefineArgs} from 'trans-render/lib/types';
import {toTempl} from 'xodus/toTempl.js';

const ce = new CE<XtalDecorCore<Element>>({
    config:{
        tagName: 'be-definitive',
        propDefaults:{
            upgrade: '*',
            ifWantsToBe: 'definitive',
            noParse: true,
            forceVisible: true,
        }
    },
    complexPropDefaults:{
        actions:[],
        on:{},
        init: (self: Element, decor: XtalDecorProps<Element>) => {
            let params: any = undefined;
            const attr = 'is-' + decor.ifWantsToBe!
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
            const ce = new CE<any, any>(params);
        },
        finale: (self: Element, target: Element) => {

        }
    },
    superclass: XtalDecor
});
document.head.appendChild(document.createElement('be-definitive'));
