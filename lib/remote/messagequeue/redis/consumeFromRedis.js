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
const tryExecuteServiceMethod_1 = __importDefault(require("../../../execution/tryExecuteServiceMethod"));
const constants_1 = require("../../../constants/constants");
const sendToRemoteService_1 = __importDefault(require("../sendToRemoteService"));
const log_1 = __importStar(require("../../../observability/logging/log"));
const defaultServiceMetrics_1 = __importDefault(require("../../../observability/metrics/defaultServiceMetrics"));
const getServiceNamespace_1 = __importDefault(require("../../../utils/getServiceNamespace"));
const BackkResponse_1 = __importDefault(require("../../../execution/BackkResponse"));
const wait_1 = __importDefault(require("../../../utils/wait"));
async function consumeFromRedis(controller, server, topic = getServiceNamespace_1.default()) {
    if (!server) {
        throw new Error('Redis server not defined');
    }
    const redis = new ioredis_1.default(`redis://${server}`);
    let lastQueueLengthUpdateTimestamp = 0;
    while (true) {
        try {
            const request = await redis.lpop(topic);
            if (!request) {
                await wait_1.default(100);
                continue;
            }
            log_1.default(log_1.Severity.DEBUG, 'Redis: consume request from queue', '', { broker: server, topic });
            const { serviceFunctionName, serviceFunctionArgument, headers } = JSON.parse(request);
            const response = new BackkResponse_1.default();
            await tryExecuteServiceMethod_1.default(controller, serviceFunctionName, serviceFunctionArgument, headers !== null && headers !== void 0 ? headers : {}, response);
            if (response.getStatusCode() >= constants_1.HttpStatusCodes.INTERNAL_ERRORS_START) {
                await wait_1.default(10000);
                await sendToRemoteService_1.default('redis://' + server + '/' + topic + '/' + serviceFunctionName, serviceFunctionArgument);
            }
            else if (response.getStatusCode() >= constants_1.HttpStatusCodes.CLIENT_ERRORS_START) {
                throw new Error(JSON.stringify(response.getResponse()));
            }
            else if ((headers === null || headers === void 0 ? void 0 : headers.responseUrl) && response.getResponse()) {
                await sendToRemoteService_1.default(headers.responseUrl, response);
            }
            const now = Date.now();
            if (now - lastQueueLengthUpdateTimestamp >= 5000) {
                const queueLength = await redis.llen(topic);
                defaultServiceMetrics_1.default.recordRedisConsumerQueueLength(queueLength);
                lastQueueLengthUpdateTimestamp = now;
            }
        }
        catch (error) {
            log_1.default(log_1.Severity.ERROR, 'Redis consumer error: ' + error.message, error.stack, {
                consumerType: 'redis',
                server,
                topic
            });
            defaultServiceMetrics_1.default.incrementRedisConsumerErrorCountByOne();
        }
    }
}
exports.default = consumeFromRedis;
//# sourceMappingURL=consumeFromRedis.js.map