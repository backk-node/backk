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
const Entity_1 = __importDefault(require("../../decorators/entity/Entity"));
const _Id_1 = __importDefault(require("../../types/id/_Id"));
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants/constants");
let __Backk__JobScheduling = class __Backk__JobScheduling extends _Id_1.default {
};
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._512),
    __metadata("design:type", String)
], __Backk__JobScheduling.prototype, "serviceFunctionName", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._8K),
    __metadata("design:type", String)
], __Backk__JobScheduling.prototype, "serviceFunctionArgument", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], __Backk__JobScheduling.prototype, "scheduledExecutionTimestamp", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._512),
    __metadata("design:type", String)
], __Backk__JobScheduling.prototype, "retryIntervalsInSecs", void 0);
__Backk__JobScheduling = __decorate([
    Entity_1.default()
], __Backk__JobScheduling);
exports.default = __Backk__JobScheduling;
//# sourceMappingURL=__Backk__JobScheduling.js.map