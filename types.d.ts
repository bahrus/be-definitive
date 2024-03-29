import {XEArgs, Config, PropInfoExt} from 'xtal-element/types';
import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE} from 'be-enhanced/types';

export interface EndUserProps<Props = any, Actions = Props> extends IBE, XEArgs<Props, Actions>{
    scriptRef?: string;
    scriptPath?: string;
    complexConfig?: string;
    //config?: Config
}

// export interface PropInfoExt2 extends PropInfoExt{
//     defaultVal?: any,
// }

export interface AllProps extends EndUserProps {}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];


export interface Actions{
    
}