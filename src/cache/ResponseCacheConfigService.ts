export default abstract class ResponseCacheConfigService {
  abstract shouldCacheServiceFunctionCallResponse(
    serviceFunctionName: string,
    serviceFunctionArgument: object
  ): boolean;
  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
