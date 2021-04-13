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
const _Id_1 = __importDefault(require("../../types/id/_Id"));
const CrudEntityService_1 = __importDefault(require("../crudentity/CrudEntityService"));
const AllowForServiceInternalUse_1 = __importDefault(require("../../decorators/service/function/AllowForServiceInternalUse"));
class UserAccountBaseService extends CrudEntityService_1.default {
    isUsersService() {
        return true;
    }
    getUserNameById(id) {
        throw new Error('Not implemented');
    }
}
__decorate([
    AllowForServiceInternalUse_1.default(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [_Id_1.default]),
    __metadata("design:returntype", Object)
], UserAccountBaseService.prototype, "getUserNameById", null);
exports.default = UserAccountBaseService;
//# sourceMappingURL=UserAccountBaseService.js.map