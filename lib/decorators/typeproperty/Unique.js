"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unique = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function Unique() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsUnique(object.constructor, propertyName);
    };
}
exports.Unique = Unique;
//# sourceMappingURL=Unique.js.map