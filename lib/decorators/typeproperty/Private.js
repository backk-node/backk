"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Private = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function Private() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsPrivate(object.constructor, propertyName);
    };
}
exports.Private = Private;
//# sourceMappingURL=Private.js.map