"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cls_hooked_1 = require("cls-hooked");
function updateDbLocalTransactionCount(dbManager) {
    var _a, _b, _c, _d, _e;
    if (!((_a = dbManager.getClsNamespace()) === null || _a === void 0 ? void 0 : _a.get('localTransaction')) &&
        !((_b = dbManager.getClsNamespace()) === null || _b === void 0 ? void 0 : _b.get('globalTransaction')) &&
        !((_c = cls_hooked_1.getNamespace('multipleServiceFunctionExecutions')) === null || _c === void 0 ? void 0 : _c.get('globalTransaction'))) {
        (_d = dbManager
            .getClsNamespace()) === null || _d === void 0 ? void 0 : _d.set('dbLocalTransactionCount', ((_e = dbManager.getClsNamespace()) === null || _e === void 0 ? void 0 : _e.get('dbLocalTransactionCount')) + 1);
    }
}
exports.default = updateDbLocalTransactionCount;
//# sourceMappingURL=updateDbLocalTransactionCount.js.map