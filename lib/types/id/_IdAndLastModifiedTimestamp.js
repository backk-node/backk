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
const _Id_1 = __importDefault(require("./_Id"));
const IsUndefined_1 = __importDefault(require("../../decorators/typeproperty/IsUndefined"));
const class_validator_1 = require("class-validator");
class _IdAndLastModifiedTimestamp extends _Id_1.default {
}
__decorate([
    IsUndefined_1.default({ groups: ['__backk_create__'] }),
    class_validator_1.IsDate({ groups: ['__backk_none__'] }),
    __metadata("design:type", Date)
], _IdAndLastModifiedTimestamp.prototype, "lastModifiedTimestamp", void 0);
exports.default = _IdAndLastModifiedTimestamp;
//# sourceMappingURL=_IdAndLastModifiedTimestamp.js.map