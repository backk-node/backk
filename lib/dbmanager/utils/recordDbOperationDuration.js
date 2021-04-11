"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultServiceMetrics_1 = __importDefault(require("../../observability/metrics/defaultServiceMetrics"));
function recordDbOperationDuration(dbManager, startTimeInMillis) {
    const dbOperationProcessingTimeInMillis = Date.now() - startTimeInMillis;
    defaultServiceMetrics_1.default.incrementDbOperationProcessingTimeInSecsBucketCounterByOne(dbManager.getDbManagerType(), dbManager.getDbHost(), dbOperationProcessingTimeInMillis / 1000);
}
exports.default = recordDbOperationDuration;
//# sourceMappingURL=recordDbOperationDuration.js.map