"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceAnnotationContainer_1 = __importDefault(require("./serviceAnnotationContainer"));
function AllowServiceForUserRoles(roles) {
    return function (serviceClass) {
        serviceAnnotationContainer_1.default.addAllowedUserRolesForService(serviceClass, roles);
    };
}
exports.default = AllowServiceForUserRoles;
//# sourceMappingURL=AllowServiceForUserRoles.js.map