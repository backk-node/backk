"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consumeFromKafka_1 = __importDefault(require("../remote/messagequeue/kafka/consumeFromKafka"));
async function startKafkaConsumer(appController, defaultTopicConfig, additionalTopics) {
    await consumeFromKafka_1.default(appController, process.env.KAFKA_SERVER, 'notification-service.vitja', defaultTopicConfig, additionalTopics);
}
exports.default = startKafkaConsumer;
//# sourceMappingURL=startKafkaConsumer.js.map