export default abstract class ResponseCacheConfigServic {
  abstract shouldCacheServiceFunctionCallResponse(
    serviceFunctionName: string,
    serviceFunctionArgument: object
  ): boolean;
  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
