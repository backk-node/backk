import { ErrorDef } from "../../dbmanager/hooks/PreHook";

export type FunctionMetadata = {
  functionName: string;
  argType: string;
  returnValueType: string;
  errors: ErrorDef[];
};
