import {DefineArgs} from 'xtal-element/src/types';
import {MinimalProxy} from 'be-decorated/types';

export interface BeDefinitiveEndUserProps<Props = any, Actions = Props> extends DefineArgs<Props, Actions>{
    scriptRef?: string;
    scriptPath?: string;
    transformPlugins?: {[key: string]: string};
}

export interface BeDefinitiveVirtualProps<Props = any, Actions = Props> extends BeDefinitiveEndUserProps<Props, Actions>, MinimalProxy{

}

export type Proxy<Props = any, Actions = Props> = Element & BeDefinitiveVirtualProps<Props, Actions>;

export interface ProxyProps<Props = any, Actions = Props> extends  BeDefinitiveVirtualProps<Props, Actions>{
    proxy: Proxy<Props, Actions>
}


export interface BeDefinitiveActions{
    
}