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
const _IdAndCaptcha_1 = __importDefault(require("../id/_IdAndCaptcha"));
const Unique_1 = require("../../decorators/typeproperty/Unique");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants/constants");
const IsAnyString_1 = __importDefault(require("../../decorators/typeproperty/IsAnyString"));
const IsStrongPassword_1 = __importDefault(require("../../decorators/typeproperty/IsStrongPassword"));
const Private_1 = require("../../decorators/typeproperty/Private");
const IsUndefined_1 = __importDefault(require("../../decorators/typeproperty/IsUndefined"));
class BaseUserAccount extends _IdAndCaptcha_1.default {
}
__decorate([
    IsUndefined_1.default({ groups: ['__backk_update__'] }),
    Unique_1.Unique(),
    class_validator_1.IsString(),
    class_validator_1.MaxLength(320),
    class_validator_1.IsEmail(),
    Private_1.Private(),
    __metadata("design:type", String)
], BaseUserAccount.prototype, "userName", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(constants_1.Lengths._512),
    IsAnyString_1.default(),
    __metadata("design:type", String)
], BaseUserAccount.prototype, "displayName", void 0);
__decorate([
    IsUndefined_1.default({ groups: ['__backk_update__'] }),
    class_validator_1.IsString(),
    IsStrongPassword_1.default(),
    Private_1.Private(),
    __metadata("design:type", String)
], BaseUserAccount.prototype, "password", void 0);
exports.default = BaseUserAccount;
//# sourceMappingURL=BaseUserAccount.js.map