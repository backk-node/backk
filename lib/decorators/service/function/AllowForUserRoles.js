"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowForUserRoles = void 0;
const serviceFunctionAnnotationContainer_1 = __importDefault(require("./serviceFunctionAnnotationContainer"));
function AllowForUserRoles(roles) {
    return function (object, functionName) {
        serviceFunctionAnnotationContainer_1.default.addAllowedUserRoles(object.constructor, functionName, roles);
    };
}
exports.AllowForUserRoles = AllowForUserRoles;
//# sourceMappingURL=AllowForUserRoles.js.map