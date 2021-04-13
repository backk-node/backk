"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function NotEncrypted() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsNotEncrypted(object.constructor, propertyName);
    };
}
exports.default = NotEncrypted;
//# sourceMappingURL=NotEncrypted.js.map