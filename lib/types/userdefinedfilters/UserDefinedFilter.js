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
const OrFilter_1 = __importDefault(require("./OrFilter"));
const constants_1 = require("../../constants/constants");
class UserDefinedFilter {
    constructor() {
        this.subEntityPath = '';
    }
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    MaxLengthAndMatches_1.default(constants_1.Lengths._2K, /^([a-zA-Z_][a-zA-Z0-9_.]*|\*|)$/),
    __metadata("design:type", String)
], UserDefinedFilter.prototype, "subEntityPath", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    MaxLengthAndMatches_1.default(constants_1.Lengths._512, /^[a-zA-Z_][a-zA-Z0-9_.]*$/),
    __metadata("design:type", String)
], UserDefinedFilter.prototype, "fieldName", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsIn([
        'ABS',
        'CEILING',
        'FLOOR',
        'ROUND',
        'LENGTH',
        'LOWER',
        'LTRIM',
        'RTRIM',
        'TRIM',
        'UPPER',
        'DAY',
        'HOUR',
        'MINUTE',
        'MONTH',
        'QUARTER',
        'SECOND',
        'WEEK',
        'WEEKDAY',
        'YEAR'
    ]),
    __metadata("design:type", String)
], UserDefinedFilter.prototype, "fieldFunction", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsIn(['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'LIKE', 'NOT LIKE', 'IS NULL', 'IS NOT NULL', 'OR']),
    __metadata("design:type", String)
], UserDefinedFilter.prototype, "operator", void 0);
__decorate([
    class_validator_1.Allow(),
    __metadata("design:type", Object)
], UserDefinedFilter.prototype, "value", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsInstance(OrFilter_1.default, { each: true }),
    class_validator_1.ValidateNested({ each: true }),
    class_validator_1.IsArray(),
    class_validator_1.ArrayMinSize(2),
    class_validator_1.ArrayMaxSize(10),
    __metadata("design:type", Array)
], UserDefinedFilter.prototype, "orFilters", void 0);
exports.default = UserDefinedFilter;
//# sourceMappingURL=UserDefinedFilter.js.map