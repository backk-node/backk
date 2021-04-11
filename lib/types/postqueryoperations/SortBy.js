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
const MaxLengthAndMatches_1 = __importDefault(require("../../decorators/typeproperty/MaxLengthAndMatches"));
const constants_1 = require("../../constants/constants");
class SortBy {
    constructor(subEntityPath, fieldName, sortDirection) {
        this.subEntityPath = '';
        this.subEntityPath = subEntityPath;
        this.fieldName = fieldName;
        this.sortDirection = sortDirection;
    }
}
__decorate([
    class_validator_1.IsOptional(),
    MaxLengthAndMatches_1.default(constants_1.Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], SortBy.prototype, "subEntityPath", void 0);
__decorate([
    MaxLengthAndMatches_1.default(constants_1.Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_.]*$/),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], SortBy.prototype, "fieldName", void 0);
__decorate([
    class_validator_1.IsIn(['ASC', 'DESC']),
    __metadata("design:type", String)
], SortBy.prototype, "sortDirection", void 0);
exports.default = SortBy;
//# sourceMappingURL=SortBy.js.map