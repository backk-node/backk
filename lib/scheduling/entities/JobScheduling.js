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
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../constants/constants");
class JobScheduling {
}
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._256),
    __metadata("design:type", String)
], JobScheduling.prototype, "serviceFunctionName", void 0);
__decorate([
    class_validator_1.IsDate(),
    class_transformer_1.Type(() => Date),
    __metadata("design:type", Date)
], JobScheduling.prototype, "scheduledExecutionTimestamp", void 0);
__decorate([
    class_validator_1.IsInt({ each: true }),
    class_validator_1.IsArray(),
    class_validator_1.ArrayMaxSize(25),
    __metadata("design:type", Array)
], JobScheduling.prototype, "retryIntervalsInSecs", void 0);
exports.default = JobScheduling;
//# sourceMappingURL=JobScheduling.js.map