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
const SortBy_1 = __importDefault(require("./SortBy"));
const class_validator_1 = require("class-validator");
const constants_1 = require("../../constants/constants");
class DefaultSorting {
    constructor() {
        this.sortBys = [new SortBy_1.default('*', '_id', 'ASC'), new SortBy_1.default('*', 'id', 'ASC')];
    }
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsInstance(SortBy_1.default, { each: true }),
    class_validator_1.ValidateNested({ each: true }),
    class_validator_1.IsArray(),
    class_validator_1.ArrayMinSize(0),
    class_validator_1.ArrayMaxSize(constants_1.Values._25),
    __metadata("design:type", Array)
], DefaultSorting.prototype, "sortBys", void 0);
exports.default = DefaultSorting;
//# sourceMappingURL=DefaultSorting.js.map