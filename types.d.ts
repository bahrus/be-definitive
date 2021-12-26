import {DefineArgs} from 'xtal-element/src/types';
import { PropSettings } from '../trans-render/lib/types';
export interface BeDefinitiveVirtualProps<Props = any, Actions = Props> extends DefineArgs<Props, Actions>{
    scriptRef?: string;
}

export interface BeDefinitiveProps<Props = any, Actions = Props> extends BeDefinitiveVirtualProps<Props, Actions>{
    proxy: Element & BeDefinitiveVirtualProps;
}

export interface BeDefinitiveActions{
    
}