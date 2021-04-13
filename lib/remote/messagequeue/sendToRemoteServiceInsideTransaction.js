"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const sendToRemoteService_1 = require("./sendToRemoteService");
const parseRemoteServiceFunctionCallUrlParts_1 = __importDefault(require("../utils/parseRemoteServiceFunctionCallUrlParts"));
async function sendToRemoteServiceInsideTransaction(sends) {
    const uniqueSendTosByBroker = lodash_1.default.uniqBy(sends, ({ remoteServiceFunctionUrl }) => parseRemoteServiceFunctionCallUrlParts_1.default(remoteServiceFunctionUrl).server);
    if (uniqueSendTosByBroker.length !== 1) {
        throw new Error('All sendTos must be to same Kafka server');
    }
    return sendToRemoteService_1.sendOneOrMore(sends, true);
}
exports.default = sendToRemoteServiceInsideTransaction;
//# sourceMappingURL=sendToRemoteServiceInsideTransaction.js.map