export default abstract class ResponseCacheConfigService {
  abstract shouldCacheServiceFunctionCallResponse(serviceFunction: string, serviceFunctionArgument: object): boolean
  abstract getCachingDurationInSecs(serviceFunction: string, serviceFunctionArgument: object): number;
}
