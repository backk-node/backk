import BaseService from "../services/BaseService";
import { ErrorNameToErrorDefinitionMap } from "../types/ErrorDefinition";
import { DataStore } from "../datastore/DataStore";
import NullDataStore from "../datastore/NullDataStore";

export default abstract class CaptchaVerificationService extends BaseService {
  protected constructor(
    errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap = {},
    dataStore: DataStore = new NullDataStore()
  ) {
    super(errorNameToErrorDefinitionMap, dataStore);
  }

  abstract verifyCaptcha(captchaToken: string): Promise<boolean>;
}
