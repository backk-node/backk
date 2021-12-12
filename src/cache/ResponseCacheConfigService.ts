import { ErrorNameToErrorDefinitionMap } from "../types/ErrorDefinition";
import { DataStore } from "../datastore/DataStore";
import NullDataStore from "../datastore/NullDataStore";
import BaseService from "../services/BaseService";

export default abstract class ResponseCacheConfigService extends BaseService{
  protected constructor(
    errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap = {},
    dataStore: DataStore = new NullDataStore()
  ) {
    super(errorNameToErrorDefinitionMap, dataStore);
  }

  abstract shouldCacheServiceFunctionCallResponse(
    serviceFunctionName: string,
    serviceFunctionArgument: object
  ): boolean;

  abstract getCachingDurationInSecs(serviceFunctionName: string, serviceFunctionArgument: object): number;
}
