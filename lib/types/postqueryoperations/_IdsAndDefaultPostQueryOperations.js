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
const class_validator_1 = require("class-validator");
const DefaultPostQueryOperations_1 = __importDefault(require("./DefaultPostQueryOperations"));
const IsStringOrObjectId_1 = __importDefault(require("../../decorators/typeproperty/IsStringOrObjectId"));
const MaxLengthAndMatches_1 = __importDefault(require("../../decorators/typeproperty/MaxLengthAndMatches"));
class _IdsAndDefaultPostQueryOperations extends DefaultPostQueryOperations_1.default {
}
__decorate([
    IsStringOrObjectId_1.default({ each: true }),
    MaxLengthAndMatches_1.default(24, /^[a-f\d]{1,24}$/, { each: true }),
    class_validator_1.IsArray(),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.ArrayMaxSize(1000),
    __metadata("design:type", Array)
], _IdsAndDefaultPostQueryOperations.prototype, "_ids", void 0);
exports.default = _IdsAndDefaultPostQueryOperations;
//# sourceMappingURL=_IdsAndDefaultPostQueryOperations.js.map