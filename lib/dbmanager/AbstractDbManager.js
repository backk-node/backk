"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cls_hooked_1 = require("cls-hooked");
const common_1 = require("@nestjs/common");
const forEachAsyncParallel_1 = __importDefault(require("../utils/forEachAsyncParallel"));
const __Backk__CronJobScheduling_1 = __importDefault(require("../scheduling/entities/__Backk__CronJobScheduling"));
const __Backk__JobScheduling_1 = __importDefault(require("../scheduling/entities/__Backk__JobScheduling"));
const DbTableVersion_1 = __importDefault(require("./version/DbTableVersion"));
let AbstractDbManager = class AbstractDbManager {
    constructor(schema) {
        this.services = [];
        this.firstDbOperationFailureTimeInMillis = 0;
        this.schema = schema.toLowerCase();
    }
    addService(service) {
        this.services.push(service);
    }
    getTypes() {
        return this.services.reduce((types, service) => ({ ...types, ...service.Types }), {
            __Backk__CronJobScheduling: __Backk__CronJobScheduling_1.default,
            __Backk__JobScheduling: __Backk__JobScheduling_1.default,
            DbTableVersion: DbTableVersion_1.default
        });
    }
    getType(Type) {
        var _a;
        return (_a = this.getTypes()[Type.name]) !== null && _a !== void 0 ? _a : Type;
    }
    getClsNamespace() {
        return cls_hooked_1.getNamespace('serviceFunctionExecution');
    }
    async createEntities(EntityClass, entities, options) {
        return this.executeInsideTransaction(async () => {
            try {
                const createdEntities = await Promise.all(entities.map(async (entity, index) => {
                    const [createdEntity, error] = await this.createEntity(EntityClass, entity, options);
                    if (error) {
                        error.message = 'Entity ' + index + ': ' + error.message;
                        throw error;
                    }
                    return createdEntity;
                }));
                return [createdEntities, null];
            }
            catch (error) {
                return [null, error];
            }
        });
    }
    updateEntities(EntityClass, entityUpdates) {
        return this.executeInsideTransaction(async () => {
            try {
                return await forEachAsyncParallel_1.default(entityUpdates, async (entity, index) => {
                    const [, error] = await this.updateEntity(EntityClass, entity);
                    if (error) {
                        error.message = 'Entity ' + index + ': ' + error.message;
                        throw error;
                    }
                });
            }
            catch (error) {
                return error;
            }
        });
    }
    deleteEntitiesByIds(EntityClass, _ids) {
        return this.executeInsideTransaction(async () => {
            try {
                return await forEachAsyncParallel_1.default(_ids, async (_id, index) => {
                    const [, error] = await this.deleteEntityById(EntityClass, _id);
                    if (error) {
                        error.message = 'Entity ' + index + ': ' + error.message;
                        throw error;
                    }
                });
            }
            catch (error) {
                return error;
            }
        });
    }
};
AbstractDbManager = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [String])
], AbstractDbManager);
exports.default = AbstractDbManager;
//# sourceMappingURL=AbstractDbManager.js.map