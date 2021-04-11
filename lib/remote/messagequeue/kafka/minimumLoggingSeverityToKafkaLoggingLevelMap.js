"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const minimumLoggingSeverityToKafkaLoggingLevelMap = {
    DEBUG: kafkajs_1.logLevel.DEBUG,
    INFO: kafkajs_1.logLevel.INFO,
    WARN: kafkajs_1.logLevel.WARN,
    ERROR: kafkajs_1.logLevel.ERROR
};
exports.default = minimumLoggingSeverityToKafkaLoggingLevelMap;
//# sourceMappingURL=minimumLoggingSeverityToKafkaLoggingLevelMap.js.map