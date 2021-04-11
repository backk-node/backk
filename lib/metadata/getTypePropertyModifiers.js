"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const setClassPropertyValidationDecorators_1 = require("../validation/setClassPropertyValidationDecorators");
function getTypePropertyModifiers(typeMetadata, Class) {
    return Object.keys(typeMetadata !== null && typeMetadata !== void 0 ? typeMetadata : {}).reduce((accumulatedTypePropertyModifiers, propertyName) => {
        const isPrivate = typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(Class, propertyName);
        const isReadonly = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isUndefined', '__backk_update__');
        const isTransient = typePropertyAnnotationContainer_1.default.isTypePropertyTransient(Class, propertyName);
        const typePropertyModifiers = (isPrivate ? 'private' : 'public') +
            (isTransient ? ' transient' : '') +
            (isReadonly ? ' readonly' : '');
        return {
            ...accumulatedTypePropertyModifiers,
            [propertyName]: typePropertyModifiers
        };
    }, {});
}
exports.default = getTypePropertyModifiers;
//# sourceMappingURL=getTypePropertyModifiers.js.map