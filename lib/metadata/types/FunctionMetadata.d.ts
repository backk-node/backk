import { ErrorDef } from "../../dbmanager/hooks/PreHook";
export declare type FunctionMetadata = {
    functionName: string;
    argType: string;
    returnValueType: string;
    errors: ErrorDef[];
};
