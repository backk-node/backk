"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachAsyncSequential_1 = __importDefault(require("../../utils/forEachAsyncSequential"));
const createErrorMessageWithStatusCode_1 = __importDefault(require("../../errors/createErrorMessageWithStatusCode"));
const constants_1 = require("../../constants/constants");
async function tryExecuteEntityPreHooks(preHooks, entity) {
    await forEachAsyncSequential_1.default(Array.isArray(preHooks) ? preHooks : [preHooks], async (preHook) => {
        var _a, _b;
        const hookFunc = typeof preHook === 'function' ? preHook : preHook.shouldSucceedOrBeTrue;
        let hookCallResult;
        try {
            if (typeof preHook === 'object' && preHook.executePreHookIf) {
                const shouldExecuteResult = await preHook.executePreHookIf(entity);
                if (typeof shouldExecuteResult === 'object' && shouldExecuteResult[1]) {
                    throw shouldExecuteResult[1];
                }
                if (shouldExecuteResult === true ||
                    (typeof shouldExecuteResult === 'object' && shouldExecuteResult[0])) {
                    hookCallResult = await hookFunc(entity);
                }
            }
            else {
                hookCallResult = await hookFunc(entity);
            }
        }
        catch (error) {
            throw new Error(createErrorMessageWithStatusCode_1.default(error.errorMessage, constants_1.HttpStatusCodes.INTERNAL_SERVER_ERROR));
        }
        if ((Array.isArray(hookCallResult) && hookCallResult[1]) ||
            hookCallResult === false ||
            (typeof hookCallResult === 'object' && !Array.isArray(hookCallResult) && hookCallResult !== null)) {
            let errorMessage = 'Pre-hook evaluated to false without specific error message';
            if (typeof preHook === 'object' && preHook.error) {
                errorMessage = 'Error code ' + preHook.error.errorCode + ':' + preHook.error.message;
            }
            throw new Error(createErrorMessageWithStatusCode_1.default(errorMessage, typeof preHook === 'object'
                ? (_b = (_a = preHook.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== null && _b !== void 0 ? _b : constants_1.HttpStatusCodes.BAD_REQUEST : constants_1.HttpStatusCodes.BAD_REQUEST));
        }
    });
}
exports.default = tryExecuteEntityPreHooks;
//# sourceMappingURL=tryExecuteEntityPreHooks.js.map