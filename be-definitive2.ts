import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';

export class BeDefinitive extends BE<AP, Actions> implements Actions {
    static override get beConfig(): BEConfig<any> {
        return {
            parse: true,
            primaryProp: 'tagName'
        } as BEConfig
    }


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