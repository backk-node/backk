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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const AbstractDbManager_1 = __importDefault(require("../../dbmanager/AbstractDbManager"));
const StartupCheckService_1 = __importDefault(require("./StartupCheckService"));
const createBackkErrorFromErrorMessageAndStatusCode_1 = __importDefault(require("../../errors/createBackkErrorFromErrorMessageAndStatusCode"));
const initializeDatabase_1 = __importStar(require("../../dbmanager/sql/operations/ddl/initializeDatabase"));
const constants_1 = require("../../constants/constants");
const AllowForClusterInternalUse_1 = require("../../decorators/service/function/AllowForClusterInternalUse");
const scheduleJobsForExecution_1 = __importStar(require("../../scheduling/scheduleJobsForExecution"));
let StartupCheckServiceImpl = class StartupCheckServiceImpl extends StartupCheckService_1.default {
    constructor(dbManager) {
        super({}, dbManager);
    }
    async isServiceStarted() {
        if (!(await initializeDatabase_1.isDbInitialized(this.dbManager)) &&
            !(await initializeDatabase_1.default(StartupCheckService_1.default.controller, this.dbManager))) {
            return [
                null,
                createBackkErrorFromErrorMessageAndStatusCode_1.default('Service not initialized (database)', constants_1.HttpStatusCodes.SERVICE_UNAVAILABLE)
            ];
        }
        else if (!scheduleJobsForExecution_1.scheduledJobs &&
            !(await scheduleJobsForExecution_1.default(StartupCheckService_1.default.controller, this.dbManager))) {
            return [
                null,
                createBackkErrorFromErrorMessageAndStatusCode_1.default('Service not initialized (jobs)', constants_1.HttpStatusCodes.SERVICE_UNAVAILABLE)
            ];
        }
        return [null, null];
    }
};
__decorate([
    AllowForClusterInternalUse_1.AllowForClusterInternalUse(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], StartupCheckServiceImpl.prototype, "isServiceStarted", null);
StartupCheckServiceImpl = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [AbstractDbManager_1.default])
], StartupCheckServiceImpl);
exports.default = StartupCheckServiceImpl;
//# sourceMappingURL=StartupCheckServiceImpl.js.map