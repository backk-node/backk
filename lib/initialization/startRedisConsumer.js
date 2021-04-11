"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consumeFromRedis_1 = __importDefault(require("../remote/messagequeue/redis/consumeFromRedis"));
async function startRedisConsumer(appController) {
    await consumeFromRedis_1.default(appController, process.env.REDIS_SERVER, 'notification-service.vitja');
}
exports.default = startRedisConsumer;
//# sourceMappingURL=startRedisConsumer.js.map