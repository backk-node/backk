"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsExternalId = void 0;
const typePropertyAnnotationContainer_1 = __importDefault(require("./typePropertyAnnotationContainer"));
function IsExternalId() {
    return function (object, propertyName) {
        typePropertyAnnotationContainer_1.default.setTypePropertyAsExternalId(object.constructor, propertyName);
    };
}
exports.IsExternalId = IsExternalId;
//# sourceMappingURL=IsExternalId.js.map