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
exports.SendAcknowledgementType = void 0;
const kafkajs_1 = require("kafkajs");
const cls_hooked_1 = require("cls-hooked");
const tracerProvider_1 = __importDefault(require("../../../observability/distributedtracinig/tracerProvider"));
const forEachAsyncSequential_1 = __importDefault(require("../../../utils/forEachAsyncSequential"));
const log_1 = __importStar(require("../../../observability/logging/log"));
const api_1 = require("@opentelemetry/api");
const createBackkErrorFromError_1 = __importDefault(require("../../../errors/createBackkErrorFromError"));
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("../../utils/parseRemoteServiceFunctionCallUrlParts"));
const minimumLoggingSeverityToKafkaLoggingLevelMap_1 = __importDefault(require("./minimumLoggingSeverityToKafkaLoggingLevelMap"));
const logCreator_1 = __importDefault(require("./logCreator"));
const defaultServiceMetrics_1 = __importDefault(require("../../../observability/metrics/defaultServiceMetrics"));
const getServiceNamespace_1 = __importDefault(require("../../../utils/getServiceNamespace"));
const kafkaServerToKafkaClientMap = {};
var SendAcknowledgementType;
(function (SendAcknowledgementType) {
    SendAcknowledgementType[SendAcknowledgementType["NONE"] = 0] = "NONE";
    SendAcknowledgementType[SendAcknowledgementType["LEADER_ONLY"] = 1] = "LEADER_ONLY";
    SendAcknowledgementType[SendAcknowledgementType["ALL_REPLICAS"] = -1] = "ALL_REPLICAS";
})(SendAcknowledgementType = exports.SendAcknowledgementType || (exports.SendAcknowledgementType = {}));
async function sendOneOrMoreToKafka(sends, isTransactional) {
    var _a, _b;
    const { server, topic } = parseRemoteServiceFunctionCallUrlParts_1.default(sends[0].remoteServiceFunctionUrl);
    if (!kafkaServerToKafkaClientMap[server]) {
        kafkaServerToKafkaClientMap[server] = new kafkajs_1.Kafka({
            clientId: getServiceNamespace_1.default(),
            logLevel: minimumLoggingSeverityToKafkaLoggingLevelMap_1.default[(_a = process.env.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'INFO'],
            brokers: [server],
            logCreator: logCreator_1.default
        });
    }
    const authHeader = (_b = cls_hooked_1.getNamespace('serviceFunctionExecution')) === null || _b === void 0 ? void 0 : _b.get('authHeader');
    const kafkaClient = kafkaServerToKafkaClientMap[server];
    const producer = kafkaClient.producer(isTransactional ? { maxInFlightRequests: 1, idempotent: true } : {});
    let transaction;
    const producerConnectSpan = tracerProvider_1.default.getTracer('default').startSpan('kafkajs.producer.connect');
    let transactionSpan;
    try {
        producerConnectSpan.setAttribute('component', 'kafkajs');
        producerConnectSpan.setAttribute('span.kind', 'CLIENT');
        producerConnectSpan.setAttribute('peer.address', server);
        await producer.connect();
        let producerOrTransaction;
        if (isTransactional) {
            transaction = await producer.transaction();
            producerOrTransaction = transaction;
            transactionSpan = tracerProvider_1.default.getTracer('default').startSpan('kafkajs.producer.transaction');
            transactionSpan.setAttribute('component', 'kafkajs');
            transactionSpan.setAttribute('span.kind', 'CLIENT');
            transactionSpan.setAttribute('peer.address', server);
        }
        else {
            producerOrTransaction = producer;
        }
        await forEachAsyncSequential_1.default(sends, async ({ responseUrl, remoteServiceFunctionUrl, options, serviceFunctionArgument }) => {
            var _a, _b;
            const { serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceFunctionUrl);
            log_1.default(log_1.Severity.DEBUG, 'Kafka producer debug: produce message', '', {
                remoteServiceFunctionUrl,
                serviceFunctionName
            });
            const span = tracerProvider_1.default
                .getTracer('default')
                .startSpan(isTransactional ? 'kafkajs.transaction.send' : 'kafkajs.producer.send');
            span.setAttribute('component', 'kafkajs');
            span.setAttribute('span.kind', 'CLIENT');
            span.setAttribute('peer.address', server);
            span.setAttribute('kafka.topic', topic);
            span.setAttribute('kafka.producer.message.key', serviceFunctionName);
            defaultServiceMetrics_1.default.incrementRemoteServiceCallCountByOne(remoteServiceFunctionUrl);
            try {
                await producerOrTransaction.send({
                    topic,
                    compression: (_a = options === null || options === void 0 ? void 0 : options.compressionType) !== null && _a !== void 0 ? _a : kafkajs_1.CompressionTypes.None,
                    acks: isTransactional
                        ? SendAcknowledgementType.ALL_REPLICAS
                        : (_b = options === null || options === void 0 ? void 0 : options.sendAcknowledgementType) !== null && _b !== void 0 ? _b : SendAcknowledgementType.ALL_REPLICAS,
                    messages: [
                        {
                            key: serviceFunctionName,
                            value: JSON.stringify(serviceFunctionArgument),
                            headers: { Authorization: authHeader, responseUrl: responseUrl !== null && responseUrl !== void 0 ? responseUrl : '' }
                        }
                    ]
                });
                span.setStatus({
                    code: api_1.CanonicalCode.OK
                });
            }
            catch (error) {
                log_1.default(log_1.Severity.ERROR, 'Kafka producer error: ' + error.message, error.stack, {
                    serviceFunctionCallUrl: remoteServiceFunctionUrl,
                    serviceFunction: serviceFunctionName
                });
                defaultServiceMetrics_1.default.incrementRemoteServiceCallErrorCountByOne(remoteServiceFunctionUrl);
                span.setStatus({
                    code: api_1.CanonicalCode.UNKNOWN,
                    message: error.message
                });
                throw error;
            }
            finally {
                span.end();
            }
        });
        await (transaction === null || transaction === void 0 ? void 0 : transaction.commit());
        transactionSpan === null || transactionSpan === void 0 ? void 0 : transactionSpan.setStatus({
            code: api_1.CanonicalCode.OK
        });
        producerConnectSpan === null || producerConnectSpan === void 0 ? void 0 : producerConnectSpan.setStatus({
            code: api_1.CanonicalCode.OK
        });
        return [null, null];
    }
    catch (error) {
        await (transaction === null || transaction === void 0 ? void 0 : transaction.abort());
        transactionSpan === null || transactionSpan === void 0 ? void 0 : transactionSpan.setStatus({
            code: api_1.CanonicalCode.UNKNOWN,
            message: error.message
        });
        producerConnectSpan === null || producerConnectSpan === void 0 ? void 0 : producerConnectSpan.setStatus({
            code: api_1.CanonicalCode.UNKNOWN,
            message: error.message
        });
        return [null, createBackkErrorFromError_1.default(error)];
    }
    finally {
        try {
            await producer.disconnect();
        }
        catch (error) {
        }
        transactionSpan === null || transactionSpan === void 0 ? void 0 : transactionSpan.end();
        producerConnectSpan.end();
    }
}
exports.default = sendOneOrMoreToKafka;
//# sourceMappingURL=sendOneOrMoreToKafka.js.map