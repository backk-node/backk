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
exports.Name = void 0;
const class_validator_1 = require("class-validator");
const IsAnyString_1 = __importDefault(require("../decorators/typeproperty/IsAnyString"));
const constants_1 = require("../constants/constants");
class Name {
}
__decorate([
    class_validator_1.MaxLength(constants_1.Lengths._1K),
    IsAnyString_1.default(),
    __metadata("design:type", String)
], Name.prototype, "name", void 0);
exports.Name = Name;
//# sourceMappingURL=Name.js.map