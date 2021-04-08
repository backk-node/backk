import { Service } from './Service';
import AbstractDbManager from '../dbmanager/AbstractDbManager';
import { ErrorDefinitions } from '../types/ErrorDefinition';

export default class BaseService implements Service {
  readonly Types: object;
  readonly PublicTypes: object;

  constructor(private readonly errors: ErrorDefinitions, protected readonly dbManager: AbstractDbManager) {
    this.Types = {};
    this.PublicTypes = {};

    if (dbManager) {
      dbManager.addService(this);
    }

    const hasUniqueErrors = Object.values(errors).reduce((hasUniqueErrors, errorDef) => {
      const errorsWithErrorCodeLength = Object.values(errors).filter(
        (otherErrorDef) => errorDef.errorCode === otherErrorDef.errorCode
      ).length;

      const errorsWithErrorMessageLength = Object.values(errors).filter(
        (otherErrorDef) => errorDef.message === otherErrorDef.message
      ).length;

      return hasUniqueErrors && errorsWithErrorCodeLength === 1 && errorsWithErrorMessageLength === 1;
    }, true);

    if (!hasUniqueErrors) {
      throw new Error(
        this.constructor.name +
          ': not all errors definitions given in constructor are unique in error code and message'
      );
    }
  }

  getDbManager(): AbstractDbManager {
    return this.dbManager;
  }

  isUsersService(): boolean {
    return false;
  }
}
