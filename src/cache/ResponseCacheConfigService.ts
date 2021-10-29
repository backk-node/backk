import BaseService from "../services/BaseService";

export default abstract class ResponseCacheConfigService extends BaseService {
  abstract shouldCacheServiceFunctionCallResponse(serviceFunctionName: string, serviceFunctionArgument: object): boolean
  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
