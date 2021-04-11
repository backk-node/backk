"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotHashed = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function NotHashed() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsNotHashed(object.constructor, propertyName);
    };
}
exports.NotHashed = NotHashed;
//# sourceMappingURL=NotHashed.js.map