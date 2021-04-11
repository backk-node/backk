"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function tryCommitLocalTransactionIfNeeded(isInTransaction, dbManager) {
    if (isInTransaction) {
        await dbManager.tryCommitTransaction();
    }
}
exports.default = tryCommitLocalTransactionIfNeeded;
//# sourceMappingURL=tryCommitLocalTransactionIfNeeded.js.map