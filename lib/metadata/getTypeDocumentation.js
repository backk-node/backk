"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
function getTypeDocumentation(typeMetadata, TypeClass) {
    return Object.keys(typeMetadata !== null && typeMetadata !== void 0 ? typeMetadata : {}).reduce((accumulatedTypeDocs, propertyName) => {
        const typePropertyDocumentation = typePropertyAnnotationContainer_1.default.getDocumentationForTypeProperty(TypeClass, propertyName);
        return typePropertyDocumentation
            ? {
                ...accumulatedTypeDocs,
                [propertyName]: typePropertyDocumentation
            }
            : accumulatedTypeDocs;
    }, {});
}
exports.default = getTypeDocumentation;
//# sourceMappingURL=getTypeDocumentation.js.map