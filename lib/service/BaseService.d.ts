import { Service } from './Service';
import AbstractDbManager from '../dbmanager/AbstractDbManager';
import { ErrorDefinitions } from '../types/ErrorDefinition';
export default class BaseService implements Service {
    private readonly errors;
    protected readonly dbManager: AbstractDbManager;
    readonly Types: object;
    readonly PublicTypes: object;
    constructor(errors: ErrorDefinitions, dbManager: AbstractDbManager);
    getDbManager(): AbstractDbManager;
    isUsersService(): boolean;
}
