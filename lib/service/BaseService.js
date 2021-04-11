"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseService {
    constructor(errors, dbManager) {
        this.errors = errors;
        this.dbManager = dbManager;
        this.Types = {};
        this.PublicTypes = {};
        if (dbManager) {
            dbManager.addService(this);
        }
        const hasUniqueErrors = Object.values(errors).reduce((hasUniqueErrors, errorDef) => {
            const errorsWithErrorCodeLength = Object.values(errors).filter((otherErrorDef) => errorDef.errorCode === otherErrorDef.errorCode).length;
            const errorsWithErrorMessageLength = Object.values(errors).filter((otherErrorDef) => errorDef.message === otherErrorDef.message).length;
            return hasUniqueErrors && errorsWithErrorCodeLength === 1 && errorsWithErrorMessageLength === 1;
        }, true);
        if (!hasUniqueErrors) {
            throw new Error(this.constructor.name +
                ': not all errors definitions given in constructor are unique in error code and message');
        }
    }
    getDbManager() {
        return this.dbManager;
    }
    isUsersService() {
        return false;
    }
}
exports.default = BaseService;
//# sourceMappingURL=BaseService.js.map