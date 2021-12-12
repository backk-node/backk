import { ErrorDefinition } from "../../types/ErrorDefinition";

export type FunctionMetadata = {
  functionName: string;
  documentation?: string;
  argType: string;
  returnValueType: string;
  errors: ErrorDefinition[];
};
