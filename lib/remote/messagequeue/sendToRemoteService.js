"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOneOrMore = void 0;
const cls_hooked_1 = require("cls-hooked");
const sendOneOrMoreToKafka_1 = __importDefault(require("./kafka/sendOneOrMoreToKafka"));
const sendOneOrMoreToRedis_1 = __importDefault(require("./redis/sendOneOrMoreToRedis"));
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("../utils/parseRemoteServiceFunctionCallUrlParts"));
const validateServiceFunctionArguments_1 = require("../utils/validateServiceFunctionArguments");
async function sendOneOrMore(sends, isTransactional) {
    const clsNamespace = cls_hooked_1.getNamespace('serviceFunctionExecution');
    if (clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.get('isInsidePostHook')) {
        clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.set('postHookRemoteServiceCallCount', (clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.get('postHookRemoteServiceCallCount')) + 1);
    }
    else {
        clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.set('remoteServiceCallCount', (clsNamespace === null || clsNamespace === void 0 ? void 0 : clsNamespace.get('remoteServiceCallCount')) + 1);
    }
    if (process.env.NODE_ENV === 'development') {
        await validateServiceFunctionArguments_1.validateServiceFunctionArguments(sends);
    }
    const { scheme } = parseRemoteServiceFunctionCallUrlParts_1.default(sends[0].remoteServiceFunctionUrl);
    if (scheme === 'kafka') {
        return sendOneOrMoreToKafka_1.default(sends, isTransactional);
    }
    else if (scheme === 'redis') {
        return sendOneOrMoreToRedis_1.default(sends, isTransactional);
    }
    else {
        throw new Error('Only URL schemes kafka:// and redis:// are supported');
    }
}
exports.sendOneOrMore = sendOneOrMore;
async function sendToRemoteService(remoteServiceFunctionUrl, serviceFunctionArgument, responseUrl, options) {
    return sendOneOrMore([
        {
            remoteServiceFunctionUrl,
            serviceFunctionArgument,
            responseUrl,
            options
        }
    ], false);
}
exports.default = sendToRemoteService;
//# sourceMappingURL=sendToRemoteService.js.map