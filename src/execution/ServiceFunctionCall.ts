export interface ServiceFunctionCall {
  serviceFunctionName: string;
  serviceFunctionArgument: any;
  microserviceName?: string;
  microserviceNamespace?: string;
}
