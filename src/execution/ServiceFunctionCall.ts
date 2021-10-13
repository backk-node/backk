export interface ServiceFunctionCall {
  serviceFunctionName: string;
  serviceFunctionArgument: any;
  remoteMicroserviceName?: string;
  remoteMicroserviceNamespace?: string;
}
