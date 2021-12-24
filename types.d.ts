import {DefineArgs} from 'xtal-element/src/types';
export interface BeDefinitiveVirtualProps extends DefineArgs{

}

export interface BeDefinitiveProps extends BeDefinitiveVirtualProps{
    proxy: Element & BeDefinitiveVirtualProps;
}

export interface BeDefinitiveActions{
    
}