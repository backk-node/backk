"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cleanupLocalTransactionIfNeeded(isInsideTransaction, dbManager) {
    var _a;
    if (isInsideTransaction) {
        (_a = dbManager.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.set('localTransaction', false);
        dbManager.cleanupTransaction();
    }
}
exports.default = cleanupLocalTransactionIfNeeded;
//# sourceMappingURL=cleanupLocalTransactionIfNeeded.js.map