import {DefineArgs} from 'xtal-element/src/types';
import {MinimalProxy} from 'be-decorated/types';

export interface BeDefinitiveVirtualProps<Props = any, Actions = Props> extends DefineArgs<Props, Actions>, MinimalProxy{
    scriptRef?: string;
    scriptPath?: string;
    transformPlugins?: {[key: string]: string};
}

export interface BeDefinitiveProps<Props = any, Actions = Props> extends BeDefinitiveVirtualProps<Props, Actions>{
    proxy: Element & BeDefinitiveVirtualProps;
}

export interface BeDefinitiveActions{
    
}