import {DefineArgs} from 'xtal-element/src/types';
import {MinimalProxy} from 'be-decorated/types';

export interface EndUserProps<Props = any, Actions = Props> extends DefineArgs<Props, Actions>{
    scriptRef?: string;
    scriptPath?: string;
    transformPlugins?: {[key: string]: string};
}

export interface VirtualProps<Props = any, Actions = Props> extends EndUserProps<Props, Actions>, MinimalProxy{

}

export type Proxy<Props = any, Actions = Props> = Element & VirtualProps<Props, Actions>;

export interface ProxyProps<Props = any, Actions = Props> extends  VirtualProps<Props, Actions>{
    proxy: Proxy<Props, Actions>
}


export interface Actions{
    
}