import { Service } from './Service';
import { DataStore } from '../datastore/DataStore';
import { ErrorNameToErrorDefinitionMap } from '../types/ErrorDefinition';
import NullDataStore from "../datastore/NullDataStore";

export default class BaseService implements Service {
  /** @internal */
  readonly Types: object;

  /** @internal */
  constructor(
    private readonly errorNameToErrorDefinitionMap: ErrorNameToErrorDefinitionMap,
    protected readonly dataStore: DataStore = new NullDataStore()
  ) {
    this.Types = {};

    if (dataStore) {
      dataStore.addService(this);
    }

    const hasUniqueErrors = Object.values(errorNameToErrorDefinitionMap).reduce(
      (hasUniqueErrors, errorDef) => {
        const errorsWithErrorCodeLength = Object.values(errorNameToErrorDefinitionMap).filter(
          (otherErrorDef) => errorDef.errorCode === otherErrorDef.errorCode
        ).length;

        const errorsWithErrorMessageLength = Object.values(errorNameToErrorDefinitionMap).filter(
          (otherErrorDef) => errorDef.message === otherErrorDef.message
        ).length;

        return hasUniqueErrors && errorsWithErrorCodeLength === 1 && errorsWithErrorMessageLength === 1;
      },
      true
    );

    if (!hasUniqueErrors) {
      throw new Error(
        this.constructor.name +
          ': not all errors definitions given in constructor are unique in error code and message'
      );
    }
  }

  getServiceType(): string {
    return '';
  }

  /** @internal */
  getDataStore(): DataStore {
    return this.dataStore;
  }

  /** @internal */
  isUserService(): boolean {
    return false;
  }
}
