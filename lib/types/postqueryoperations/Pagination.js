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
const MaxLengthAndMatches_1 = __importDefault(require("../../decorators/typeproperty/MaxLengthAndMatches"));
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants/constants");
class Pagination {
    constructor(subEntityPath, pageNumber, pageSize) {
        this.subEntityPath = '';
        this.subEntityPath = subEntityPath;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }
}
__decorate([
    class_validator_1.IsOptional(),
    MaxLengthAndMatches_1.default(constants_1.Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], Pagination.prototype, "subEntityPath", void 0);
__decorate([
    class_validator_1.IsInt(),
    class_validator_1.Min(1),
    class_validator_1.Max(100),
    __metadata("design:type", Number)
], Pagination.prototype, "pageNumber", void 0);
__decorate([
    class_validator_1.IsInt(),
    class_validator_1.Min(1),
    class_validator_1.Max(100),
    __metadata("design:type", Number)
], Pagination.prototype, "pageSize", void 0);
exports.default = Pagination;
//# sourceMappingURL=Pagination.js.map