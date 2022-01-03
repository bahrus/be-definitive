import {DefineArgs} from 'xtal-element/src/types';
import { PropSettings } from '../trans-render/lib/types';
export interface BeDefinitiveVirtualProps<Props = any, Actions = Props> extends DefineArgs<Props, Actions>{
    scriptRef?: string;

    /**
     * Used for providing hints to server side processing using the HTML what queries should be observed if using HTMLRewriter.
     */
    keyQueries: string[];
}

export interface BeDefinitiveProps<Props = any, Actions = Props> extends BeDefinitiveVirtualProps<Props, Actions>{
    proxy: Element & BeDefinitiveVirtualProps;
}

export interface BeDefinitiveActions{
    
}