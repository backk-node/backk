export interface ResponseCacheConfigService {
  shouldCacheServiceFunctionCallResponse(
    serviceFunctionName: string,
    serviceFunctionArgument: object
  ): boolean;
  getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
