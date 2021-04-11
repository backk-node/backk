"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendToRemoteService_1 = __importDefault(require("../sendToRemoteService"));
async function sendToKafka(broker, topic, key, message) {
    const remoteServiceUrl = 'kafka://' + broker + '/' + topic + '/' + key;
    return await sendToRemoteService_1.default(remoteServiceUrl, message);
}
exports.default = sendToKafka;
//# sourceMappingURL=sendToKafka.js.map