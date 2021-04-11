"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cls_hooked_1 = require("cls-hooked");
const createErrorMessageWithStatusCode_1 = __importDefault(require("../../errors/createErrorMessageWithStatusCode"));
const constants_1 = require("../../constants/constants");
async function tryExecutePostHook(postHook, entity) {
    var _a, _b;
    const clsNamespace = cls_hooked_1.getNamespace('serviceFunctionExecution');
    clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.set('isInsidePostHook', true);
    const postHookFunc = typeof postHook === 'function' ? postHook : postHook.shouldSucceedOrBeTrue;
    let hookCallResult;
    try {
        if (typeof postHook === 'object' && postHook.executePostHookIf) {
            if (postHook.executePostHookIf(entity !== null && entity !== void 0 ? entity : null)) {
                hookCallResult = await postHookFunc(entity !== null && entity !== void 0 ? entity : null);
            }
        }
        else {
            hookCallResult = await postHookFunc(entity !== null && entity !== void 0 ? entity : null);
        }
    }
    catch (error) {
        throw new Error(createErrorMessageWithStatusCode_1.default(error.errorMessage, constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR));
    }
    clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.set('isInsidePostHook', false);
    if (Array.isArray(hookCallResult) && hookCallResult[1]) {
        throw hookCallResult[1];
    }
    if (hookCallResult === false) {
        let errorMessage = 'Post-hook evaluated to false without specific error message';
        let statusCode = constants_1.HttpStatusCodes.BAD_REQUEST;
        if (typeof postHook === 'object' && postHook.error) {
            errorMessage = 'Error code ' + postHook.error.errorCode + ':' + postHook.error.message;
            statusCode = (_b = (_a = postHook.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== null && _b !== void 0 ? _b : constants_1.HttpStatusCodes.BAD_REQUEST;
        }
        throw new Error(createErrorMessageWithStatusCode_1.default(errorMessage, statusCode));
    }
}
exports.default = tryExecutePostHook;
//# sourceMappingURL=tryExecutePostHook.js.map