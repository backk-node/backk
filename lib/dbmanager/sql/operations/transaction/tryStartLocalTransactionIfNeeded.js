"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cls_hooked_1 = require("cls-hooked");
async function tryStartLocalTransactionIfNeeded(dbManager) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!((_a = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _a === void 0 ? void 0 : _a.get('globalTransaction')) &&
        !((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) &&
        !((_c = dbManager.getClsNamespace()) === null || _c === void 0 ? void 0 : _c.get('localTransaction'))) {
        await dbManager.tryBeginTransaction();
        (_d = dbManager.getClsNamespace()) === null || _d === void 0 ? void 0 : _d.set('localTransaction', true);
        (_e = dbManager.getClsNamespace()) === null || _e === void 0 ? void 0 : _e.set('session', (_f = dbManager.getClient()) === null || _f === void 0 ? void 0 : _f.startSession());
        (_g = dbManager
            .getClsNamespace()) === null || _g === void 0 ? void 0 : _g.set('dbLocalTransactionCount', ((_h = dbManager.getClsNamespace()) === null || _h === void 0 ? void 0 : _h.get('dbLocalTransactionCount')) + 1);
        return true;
    }
    return false;
}
exports.default = tryStartLocalTransactionIfNeeded;
//# sourceMappingURL=tryStartLocalTransactionIfNeeded.js.map