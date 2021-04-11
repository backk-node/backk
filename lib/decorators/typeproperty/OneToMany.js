"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToMany = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function OneToMany(isReferenceToExternalEntity = false) {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsOneToMany(object.constructor, propertyName, isReferenceToExternalEntity);
    };
}
exports.OneToMany = OneToMany;
//# sourceMappingURL=OneToMany.js.map