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
const IsStringOrObjectId_1 = __importDefault(require("../../decorators/typeproperty/IsStringOrObjectId"));
const MaxLengthAndMatches_1 = __importDefault(require("../../decorators/typeproperty/MaxLengthAndMatches"));
const _IdAndVersion_1 = __importDefault(require("./_IdAndVersion"));
class _IdAndVersionAndUserAccountId extends _IdAndVersion_1.default {
}
__decorate([
    IsStringOrObjectId_1.default(),
    MaxLengthAndMatches_1.default(24, /^[a-f\d]{1,24}$/),
    __metadata("design:type", String)
], _IdAndVersionAndUserAccountId.prototype, "userAccountId", void 0);
exports.default = _IdAndVersionAndUserAccountId;
//# sourceMappingURL=_IdAndVersionAndUserAccountId.js.map