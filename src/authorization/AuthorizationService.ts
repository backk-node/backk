import BaseService from "../services/BaseService";
import { ErrorNameToErrorDefinitionMap } from "../types/ErrorDefinition";
import { DataStore } from "../datastore/DataStore";
import NullDataStore from "../datastore/NullDataStore";

export default abstract class AuthorizationService extends BaseService {
  protected constructor(
    errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap = {},
    dataStore: DataStore = new NullDataStore()
  ) {
    super(errorNameToErrorDefinitionMap, dataStore);
  }

  abstract hasUserRoleIn(roles: string[], authHeader: string | string[] | undefined): Promise<boolean>;
  abstract getSubjectAndIssuer(
    authHeader: string | string[] | undefined
  ): Promise<[string | undefined, string | undefined]>;
}
