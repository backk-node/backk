"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("../../utils/parseRemoteServiceFunctionCallUrlParts"));
const cls_hooked_1 = require("cls-hooked");
const forEachAsyncSequential_1 = __importDefault(require("../../../utils/forEachAsyncSequential"));
const log_1 = __importStar(require("../../../observability/logging/log"));
const createBackkErrorFromError_1 = __importDefault(require("../../../errors/createBackkErrorFromError"));
const defaultServiceMetrics_1 = __importDefault(require("../../../observability/metrics/defaultServiceMetrics"));
async function sendOneOrMoreToRedis(sends, isTransactional) {
    var _a;
    const remoteServiceUrl = sends[0].remoteServiceFunctionUrl;
    const { server, topic } = parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceUrl);
    const redis = new ioredis_1.default(server);
    const authHeader = (_a = cls_hooked_1.getNamespace('serviceFunctionExecution')) === null || _a === void 0 ? void 0 : _a.get('authHeader');
    try {
        if (isTransactional) {
            redis.multi();
        }
        await forEachAsyncSequential_1.default(sends, async ({ responseUrl, remoteServiceFunctionUrl, serviceFunctionArgument }) => {
            const { serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceFunctionUrl);
            log_1.default(log_1.Severity.DEBUG, 'CallOrSendToSpec to remote service for execution', '', {
                serviceFunctionCallUrl: remoteServiceFunctionUrl,
                serviceFunction: serviceFunctionName
            });
            defaultServiceMetrics_1.default.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);
            await redis.rpush(topic, JSON.stringify({
                serviceFunctionName,
                serviceFunctionArgument,
                headers: {
                    Authorization: authHeader,
                    responseUrl
                }
            }));
        });
        if (isTransactional) {
            await redis.exec();
        }
        return [null, null];
    }
    catch (error) {
        defaultServiceMetrics_1.default.incrementRemoteServiceCallErrorCountByOne(remoteServiceUrl);
        return [null, createBackkErrorFromError_1.default(error)];
    }
}
exports.default = sendOneOrMoreToRedis;
//# sourceMappingURL=sendOneOrMoreToRedis.js.map