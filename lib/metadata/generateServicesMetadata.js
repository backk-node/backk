"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../decorators/service/function/serviceFunctionAnnotationContainer"));
const BaseService_1 = __importDefault(require("../service/BaseService"));
const getClassPropertyNameToPropertyTypeNameMap_1 = __importDefault(require("./getClassPropertyNameToPropertyTypeNameMap"));
const getValidationMetadata_1 = __importDefault(require("./getValidationMetadata"));
const getTypeDocumentation_1 = __importDefault(require("./getTypeDocumentation"));
const getTypePropertyModifiers_1 = __importDefault(require("./getTypePropertyModifiers"));
const CrudEntityService_1 = __importDefault(require("../service/crudentity/CrudEntityService"));
const assertFunctionNamesAreValidForCrudEntityService_1 = __importDefault(require("../service/crudentity/assertFunctionNamesAreValidForCrudEntityService"));
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
const isCreateFunction_1 = __importDefault(require("../service/crudentity/utils/isCreateFunction"));
function generateServicesMetadata(controller, dbManager, remoteServiceRootDir = '') {
    return Object.entries(controller)
        .filter(([serviceName, service]) => service instanceof BaseService_1.default || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__')))
        .map(([serviceName, service]) => {
        var _a, _b, _c, _d, _e, _f;
        const ServiceClass = service.constructor;
        const functionNames = Object.keys(controller[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap);
        if (service instanceof CrudEntityService_1.default) {
            assertFunctionNamesAreValidForCrudEntityService_1.default(ServiceClass, functionNames);
        }
        const typesMetadata = Object.entries((_a = controller[serviceName].Types) !== null && _a !== void 0 ? _a : {}).reduce((accumulatedTypes, [typeName, Class]) => {
            const typeObject = getClassPropertyNameToPropertyTypeNameMap_1.default(Class, dbManager, true);
            return { ...accumulatedTypes, [typeName]: typeObject };
        }, {});
        const publicTypesMetadata = Object.entries((_b = controller[serviceName].PublicTypes) !== null && _b !== void 0 ? _b : {}).reduce((accumulatedTypes, [typeName, typeClass]) => {
            const typeObject = getClassPropertyNameToPropertyTypeNameMap_1.default(typeClass);
            return { ...accumulatedTypes, [typeName]: typeObject };
        }, {});
        const functions = functionNames
            .filter((functionName) => !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForServiceInternalUse(controller[serviceName].constructor, functionName))
            .map((functionName) => {
            var _a;
            if (!remoteServiceRootDir &&
                !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForSelf(ServiceClass, functionName) &&
                !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForClusterInternalUse(ServiceClass, functionName) &&
                !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForEveryUser(ServiceClass, functionName) &&
                serviceFunctionAnnotationContainer_1.default.getAllowedUserRoles(ServiceClass, functionName).length === 0 &&
                !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForServiceInternalUse(ServiceClass, functionName) &&
                !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForTests(ServiceClass, functionName) &&
                !serviceFunctionAnnotationContainer_1.default.hasOnStartUp(ServiceClass, functionName)) {
                throw new Error(serviceName + '.' + functionName + ': is missing authorization annotation');
            }
            const functionArgumentTypeName = controller[`${serviceName}__BackkTypes__`]
                .functionNameToParamTypeNameMap[functionName];
            if (isCreateFunction_1.default(service.constructor, functionName) &&
                functionArgumentTypeName &&
                !typesMetadata[functionArgumentTypeName].captchaToken &&
                !serviceFunctionAnnotationContainer_1.default.hasNoCaptchaAnnotationForServiceFunction(service.constructor, functionName)) {
                throw new Error(serviceName +
                    '.' +
                    functionName +
                    ': argument type must implement Captcha or service function must be annotated with @NoCaptcha() annotation');
            }
            const returnValueTypeName = controller[`${serviceName}__BackkTypes__`]
                .functionNameToReturnTypeNameMap[functionName];
            const functionStr = service[functionName].toString();
            const errors = Object.entries((_a = service.errors) !== null && _a !== void 0 ? _a : [])
                .filter(([errorName]) => functionStr.includes(errorName))
                .map(([, errorDefinition]) => errorDefinition);
            return {
                functionName,
                functionDocumentation: controller[`${serviceName}__BackkTypes__`]
                    .functionNameToDocumentationMap[functionName],
                argType: functionArgumentTypeName,
                returnValueType: returnValueTypeName,
                errors
            };
        });
        const validationMetadatas = Object.entries((_c = controller[serviceName].PublicTypes) !== null && _c !== void 0 ? _c : {}).reduce((accumulatedTypes, [typeName, typeClass]) => {
            const validationMetadata = getValidationMetadata_1.default(typeClass);
            if (Object.keys(validationMetadata).length > 0) {
                return { ...accumulatedTypes, [typeName]: validationMetadata };
            }
            return accumulatedTypes;
        }, {});
        const propertyModifiers = Object.entries((_d = controller[serviceName].PublicTypes) !== null && _d !== void 0 ? _d : {}).reduce((accumulatedPropertyModifiers, [typeName, typeClass]) => {
            const propertyModifiers = getTypePropertyModifiers_1.default(typesMetadata[typeName], typeClass);
            return Object.keys(propertyModifiers).length > 0
                ? { ...accumulatedPropertyModifiers, [typeName]: propertyModifiers }
                : accumulatedPropertyModifiers;
        }, {});
        const typesDocumentation = Object.entries((_e = controller[serviceName].PublicTypes) !== null && _e !== void 0 ? _e : {}).reduce((accumulatedTypesDocumentation, [typeName, typeClass]) => {
            const typeDocumentation = getTypeDocumentation_1.default(typesMetadata[typeName], typeClass);
            return Object.keys(typeDocumentation).length > 0
                ? { ...accumulatedTypesDocumentation, [typeName]: typeDocumentation }
                : accumulatedTypesDocumentation;
        }, {});
        const typeReferences = Object.entries((_f = controller[serviceName].PublicTypes) !== null && _f !== void 0 ? _f : {}).reduce((accumulatedTypeReferences, [typeName, typeClass]) => {
            if (entityAnnotationContainer_1.default.isEntity(typeClass) &&
                entityAnnotationContainer_1.default.entityNameToTableNameMap[typeName]) {
                return {
                    ...accumulatedTypeReferences,
                    [typeName]: entityAnnotationContainer_1.default.entityNameToTableNameMap[typeName]
                };
            }
            return accumulatedTypeReferences;
        }, {});
        return {
            serviceName,
            serviceDocumentation: controller[`${serviceName}__BackkTypes__`].serviceDocumentation,
            functions,
            publicTypes: {
                ...publicTypesMetadata,
                ErrorResponse: {
                    statusCode: 'integer',
                    errorCode: '?string',
                    errorMessage: 'string',
                    stackTrace: '?string'
                }
            },
            types: {
                ...typesMetadata,
                BackkError: {
                    statusCode: 'integer',
                    errorCode: '?string',
                    message: 'string',
                    stackTrace: '?string'
                }
            },
            propertyModifiers,
            typesDocumentation,
            typeReferences,
            validations: validationMetadatas
        };
    });
}
exports.default = generateServicesMetadata;
//# sourceMappingURL=generateServicesMetadata.js.map