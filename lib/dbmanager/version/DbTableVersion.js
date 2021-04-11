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
const MaxLengthAndMatches_1 = __importDefault(require("../../decorators/typeproperty/MaxLengthAndMatches"));
const _IdAndVersion_1 = __importDefault(require("../../types/id/_IdAndVersion"));
const Unique_1 = require("../../decorators/typeproperty/Unique");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants/constants");
let DbTableVersion = class DbTableVersion extends _IdAndVersion_1.default {
};
__decorate([
    Unique_1.Unique(),
    class_validator_1.IsString(),
    MaxLengthAndMatches_1.default(constants_1.Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_]*$/),
    __metadata("design:type", String)
], DbTableVersion.prototype, "entityName", void 0);
DbTableVersion = __decorate([
    Entity_1.default()
], DbTableVersion);
exports.default = DbTableVersion;
//# sourceMappingURL=DbTableVersion.js.map