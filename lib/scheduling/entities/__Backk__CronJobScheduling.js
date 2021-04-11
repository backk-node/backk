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
const Unique_1 = require("../../decorators/typeproperty/Unique");
const constants_1 = require("../../constants/constants");
let __Backk__CronJobScheduling = class __Backk__CronJobScheduling extends _Id_1.default {
};
__decorate([
    Unique_1.Unique(),
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._512),
    __metadata("design:type", String)
], __Backk__CronJobScheduling.prototype, "serviceFunctionName", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], __Backk__CronJobScheduling.prototype, "lastScheduledTimestamp", void 0);
__decorate([
    class_validator_1.IsDate(),
    __metadata("design:type", Date)
], __Backk__CronJobScheduling.prototype, "nextScheduledTimestamp", void 0);
__Backk__CronJobScheduling = __decorate([
    Entity_1.default()
], __Backk__CronJobScheduling);
exports.default = __Backk__CronJobScheduling;
//# sourceMappingURL=__Backk__CronJobScheduling.js.map