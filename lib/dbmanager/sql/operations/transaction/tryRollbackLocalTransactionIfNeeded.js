"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function tryRollbackLocalTransactionIfNeeded(isInTransaction, dbManager) {
    if (isInTransaction) {
        await dbManager.tryRollbackTransaction();
    }
}
exports.default = tryRollbackLocalTransactionIfNeeded;
//# sourceMappingURL=tryRollbackLocalTransactionIfNeeded.js.map