import { ErrorDef } from "../../datastore/hooks/PreHook";

export type FunctionMetadata = {
  functionName: string;
  argType: string;
  returnValueType: string;
  errors: ErrorDef[];
};
