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
const logEnvironment_1 = __importDefault(require("../observability/logging/logEnvironment"));
const defaultSystemAndNodeJsMetrics_1 = __importDefault(require("../observability/metrics/defaultSystemAndNodeJsMetrics"));
const initializeDatabase_1 = __importDefault(require("../dbmanager/sql/operations/ddl/initializeDatabase"));
const reloadLoggingConfigOnChange_1 = __importDefault(require("../configuration/reloadLoggingConfigOnChange"));
const log_1 = __importStar(require("../observability/logging/log"));
const scheduleCronJobsForExecution_1 = __importDefault(require("../scheduling/scheduleCronJobsForExecution"));
const scheduleJobsForExecution_1 = __importDefault(require("../scheduling/scheduleJobsForExecution"));
const StartupCheckService_1 = __importDefault(require("../service/startup/StartupCheckService"));
const initializeCls_1 = __importDefault(require("../continuationlocalstorage/initializeCls"));
async function initializeBackk(controller, dbManager) {
    initializeCls_1.default();
    StartupCheckService_1.default.controller = controller;
    logEnvironment_1.default();
    defaultSystemAndNodeJsMetrics_1.default.startCollectingMetrics();
    await initializeDatabase_1.default(controller, dbManager);
    scheduleCronJobsForExecution_1.default(controller, dbManager);
    await scheduleJobsForExecution_1.default(controller, dbManager);
    reloadLoggingConfigOnChange_1.default();
    log_1.default(log_1.Severity.INFO, 'Service started', '');
}
exports.default = initializeBackk;
//# sourceMappingURL=initializeBackk.js.map