"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesClassPropertyContainCustomValidation = exports.getClassPropertyCustomValidationTestValue = exports.getPropertyValidationOfType = void 0;
const core_1 = require("@babel/core");
const class_validator_1 = require("class-validator");
const ValidationMetadata_1 = require("class-validator/metadata/ValidationMetadata");
const fs_1 = require("fs");
const getSrcFilePathNameForTypeName_1 = __importStar(require("../utils/file/getSrcFilePathNameForTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const parseEnumValuesFromSrcFile_1 = __importDefault(require("../typescript/parser/parseEnumValuesFromSrcFile"));
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const entityAnnotationContainer_1 = __importDefault(require("../decorators/entity/entityAnnotationContainer"));
const registerCustomDecorator_1 = require("../decorators/registerCustomDecorator");
const getValidationConstraint_1 = __importDefault(require("./getValidationConstraint"));
function getPropertyValidationOfType(typeClass, propertyName, validationType) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(typeClass, '');
    return validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName && validationMetadata.type === validationType);
}
exports.getPropertyValidationOfType = getPropertyValidationOfType;
function doesPropertyContainValidation(typeClass, propertyName, validationType) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(typeClass, '');
    const foundValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName && validationMetadata.type === validationType);
    return foundValidation !== undefined;
}
function getClassPropertyCustomValidationTestValue(Class, propertyName) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const foundCustomValidationWithTestValue = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        registerCustomDecorator_1.customDecoratorNameToTestValueMap[validationMetadata.constraints[0]]);
    return foundCustomValidationWithTestValue
        ? registerCustomDecorator_1.customDecoratorNameToTestValueMap[foundCustomValidationWithTestValue.constraints[0]]
        : undefined;
}
exports.getClassPropertyCustomValidationTestValue = getClassPropertyCustomValidationTestValue;
function doesClassPropertyContainCustomValidation(Class, propertyName, validationType, disregardFirstGroup, group) {
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const foundValidation = validationMetadatas.find((validationMetadata) => validationMetadata.propertyName === propertyName &&
        validationMetadata.type === 'customValidation' &&
        validationMetadata.constraints[0] === validationType &&
        (!disregardFirstGroup ||
            (disregardFirstGroup && validationMetadata.groups[0] !== disregardFirstGroup)) &&
        (!group || (group && validationMetadata.groups.includes(group))));
    return foundValidation !== undefined;
}
exports.doesClassPropertyContainCustomValidation = doesClassPropertyContainCustomValidation;
function setClassPropertyValidationDecorators(Class, serviceName, Types, remoteServiceRootDir = '') {
    var _a, _b, _c, _d, _e, _f, _g;
    const className = Class.name;
    if (getSrcFilePathNameForTypeName_1.hasBackkSrcFilenameForTypeName(className)) {
        return;
    }
    const fileContentsStr = fs_1.readFileSync(getSrcFilePathNameForTypeName_1.default(className, remoteServiceRootDir), {
        encoding: 'UTF-8'
    });
    const fileRows = fileContentsStr.split('\n');
    const ast = core_1.parseSync(fileContentsStr, {
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-typescript'
        ]
    });
    const nodes = ast.program.body;
    for (const node of nodes) {
        if ((node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id.name === className) {
            for (const classBodyNode of node.declaration.body.body) {
                if (classBodyNode.type === 'ClassProperty') {
                    const propertyName = classBodyNode.key.name;
                    let baseTypeName;
                    let propertyTypeName;
                    let isNullableType = false;
                    let isArrayType = false;
                    const documentation = (_a = classBodyNode.leadingComments) === null || _a === void 0 ? void 0 : _a[0].value;
                    if (documentation) {
                        typePropertyAnnotationContainer_1.default.addDocumentationForTypeProperty(Class, propertyName, documentation);
                    }
                    const isPrivateProperty = classBodyNode.accessibility !== 'public';
                    if (isPrivateProperty &&
                        entityAnnotationContainer_1.default.isEntity(Class) &&
                        !typePropertyAnnotationContainer_1.default.isTypePropertyPrivate(Class, propertyName)) {
                        throw new Error(Class.name +
                            '.' +
                            propertyName +
                            " is a private property and it must be decorated with @Private() annotation. Or if the property should be public, denote it with a 'public' keyword");
                    }
                    if (isPrivateProperty && entityAnnotationContainer_1.default.isEntity(Class)) {
                        const validationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CUSTOM_VALIDATION,
                            target: Class,
                            propertyName,
                            constraints: ['isUndefined'],
                            validationOptions: { each: isArrayType }
                        };
                        const validationMetadata = new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs);
                        validationMetadata.groups = ['__backk_update__'];
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(validationMetadata);
                    }
                    if (classBodyNode.readonly && entityAnnotationContainer_1.default.isEntity(Class)) {
                        const validationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CUSTOM_VALIDATION,
                            target: Class,
                            propertyName,
                            constraints: ['isUndefined'],
                            validationOptions: { each: isArrayType }
                        };
                        const validationMetadata = new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs);
                        if (propertyName === '_id') {
                            validationMetadata.groups = ['__backk_create__'];
                        }
                        else {
                            validationMetadata.groups = ['__backk_create__', '__backk_update__'];
                        }
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(validationMetadata);
                    }
                    if (classBodyNode.typeAnnotation === undefined) {
                        if (typeof ((_b = classBodyNode.value) === null || _b === void 0 ? void 0 : _b.value) === 'number') {
                            propertyTypeName = 'number';
                            baseTypeName = 'number';
                        }
                        else if (typeof ((_c = classBodyNode.value) === null || _c === void 0 ? void 0 : _c.value) === 'boolean') {
                            propertyTypeName = 'boolean';
                            baseTypeName = 'boolean';
                        }
                        else if (typeof ((_d = classBodyNode.value) === null || _d === void 0 ? void 0 : _d.value) === 'string') {
                            propertyTypeName = 'string';
                            baseTypeName = 'string';
                        }
                        else if (typeof ((_e = classBodyNode.value) === null || _e === void 0 ? void 0 : _e.value) === 'object' ||
                            typeof ((_f = classBodyNode.value) === null || _f === void 0 ? void 0 : _f.value) === 'bigint' ||
                            typeof ((_g = classBodyNode.value) === null || _g === void 0 ? void 0 : _g.value) === 'symbol') {
                            throw new Error('Default value must a scalar (number, boolean or string) for property: ' +
                                propertyName +
                                ' in ' +
                                Class.name);
                        }
                        else {
                            throw new Error('Missing type annotation for property: ' + propertyName + ' in ' + Class.name);
                        }
                    }
                    else {
                        const propertyTypeNameStart = classBodyNode.typeAnnotation.loc.start;
                        const propertyTypeNameEnd = classBodyNode.typeAnnotation.loc.end;
                        propertyTypeName = fileRows[propertyTypeNameStart.line - 1].slice(propertyTypeNameStart.column + 2, propertyTypeNameEnd.column);
                        ({ baseTypeName, isArrayType, isNullableType } = getTypeInfoForTypeName_1.default(propertyTypeName));
                    }
                    let validationType;
                    let constraints;
                    const isExternalId = typePropertyAnnotationContainer_1.default.isTypePropertyExternalId(Class, propertyName);
                    if (propertyName === '_id' ||
                        propertyName === 'id' ||
                        (propertyName.endsWith('Id') && !isExternalId) ||
                        (propertyName.endsWith('Ids') && !isExternalId)) {
                        if (!doesClassPropertyContainCustomValidation(Class, propertyName, 'maxLengthAndMatches')) {
                            const validationMetadataArgs = {
                                type: class_validator_1.ValidationTypes.CUSTOM_VALIDATION,
                                target: Class,
                                propertyName,
                                constraints: ['maxLengthAndMatches', 24, /^[a-f\d]{1,24}$/],
                                validationOptions: { each: isArrayType }
                            };
                            class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs));
                        }
                    }
                    if (baseTypeName === 'boolean') {
                        const validationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CUSTOM_VALIDATION,
                            target: Class,
                            propertyName,
                            constraints: ['isBooleanOrTinyInt'],
                            validationOptions: { each: isArrayType }
                        };
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs));
                    }
                    else if (baseTypeName === 'number') {
                        if (isArrayType &&
                            !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.ARRAY_UNIQUE) &&
                            !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                ' must have either @ArrayUnique() or @ArrayNotUnique() annotation');
                        }
                        if (!doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_INT) &&
                            !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_NUMBER) &&
                            !doesClassPropertyContainCustomValidation(Class, propertyName, 'isBigInt')) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                ' must have either @IsInt(), @IsFloat() or @IsBigInt() annotation');
                        }
                    }
                    else if (baseTypeName === 'string') {
                        if (isArrayType &&
                            !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.ARRAY_UNIQUE) &&
                            !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                ' must have either @ArrayUnique() or @ArrayNotUnique() annotation');
                        }
                        let maxLength;
                        if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_BOOLEAN_STRING)) {
                            maxLength = 5;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isBIC')) {
                            maxLength = 11;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isBtcAddress')) {
                            maxLength = 35;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_CREDIT_CARD)) {
                            maxLength = 19;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_DATE_STRING)) {
                            maxLength = 64;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isEAN')) {
                            maxLength = 13;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_EMAIL)) {
                            maxLength = 320;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isEthereumAddress')) {
                            maxLength = 42;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isHSL')) {
                            maxLength = 64;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_HEX_COLOR)) {
                            maxLength = 7;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ISIN)) {
                            maxLength = 12;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isIBAN')) {
                            maxLength = 42;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_IP)) {
                            let ipValidationConstraint = getValidationConstraint_1.default(Class, propertyName, class_validator_1.ValidationTypes.IS_IP);
                            if (typeof ipValidationConstraint === 'string') {
                                ipValidationConstraint = parseInt(ipValidationConstraint, 10);
                            }
                            maxLength = ipValidationConstraint === 4 ? 15 : 39;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ISO31661_ALPHA_2)) {
                            maxLength = 2;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ISO31661_ALPHA_3)) {
                            maxLength = 3;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ISO8601)) {
                            maxLength = 64;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isISRC')) {
                            maxLength = 15;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ISSN)) {
                            maxLength = 9;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_JWT)) {
                            maxLength = 8192;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isLocale')) {
                            maxLength = 5;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_MAC_ADDRESS)) {
                            maxLength = 17;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_MILITARY_TIME)) {
                            maxLength = 5;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isMimeType')) {
                            maxLength = 64;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_PORT)) {
                            maxLength = 5;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isRgbColor')) {
                            maxLength = 32;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isSemVer')) {
                            maxLength = 32;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_UUID)) {
                            maxLength = 36;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isPostalCode')) {
                            maxLength = 32;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isCreditCardExpiration')) {
                            maxLength = 7;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isCardVerificationCode')) {
                            maxLength = 4;
                        }
                        else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isMobileNumber')) {
                            maxLength = 32;
                        }
                        else if (doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_PHONE_NUMBER)) {
                            maxLength = 32;
                        }
                        if (maxLength &&
                            !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.MAX_LENGTH)) {
                            const validationMetadataArgs = {
                                type: class_validator_1.ValidationTypes.MAX_LENGTH,
                                target: Class,
                                propertyName,
                                constraints: [maxLength],
                                validationOptions: { each: isArrayType }
                            };
                            class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs));
                        }
                        if (propertyName === '_id' ||
                            propertyName === 'id' ||
                            propertyName.endsWith('Id') ||
                            propertyName.endsWith('Ids')) {
                            if (!doesClassPropertyContainCustomValidation(Class, propertyName, 'isStringOrObjectId')) {
                                const validationMetadataArgs = {
                                    type: class_validator_1.ValidationTypes.CUSTOM_VALIDATION,
                                    target: Class,
                                    propertyName,
                                    constraints: ['isStringOrObjectId'],
                                    validationOptions: { each: isArrayType }
                                };
                                class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs));
                            }
                        }
                        else {
                            validationType = class_validator_1.ValidationTypes.IS_STRING;
                        }
                    }
                    else if (baseTypeName === 'Date') {
                        validationType = class_validator_1.ValidationTypes.IS_DATE;
                    }
                    else if (baseTypeName.charAt(0).match(/^[_$A-Z]$/)) {
                        validationType = class_validator_1.ValidationTypes.IS_INSTANCE;
                        if (Types[baseTypeName]) {
                            constraints = [Types[baseTypeName]];
                        }
                        else if (getSrcFilePathNameForTypeName_1.hasSrcFilenameForTypeName(baseTypeName)) {
                            if (isArrayType &&
                                !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.ARRAY_UNIQUE) &&
                                !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')) {
                                throw new Error(Class.name +
                                    '.' +
                                    propertyName +
                                    ' must have either @ArrayUnique() or @ArrayNotUnique() annotation');
                            }
                            const enumValues = parseEnumValuesFromSrcFile_1.default(baseTypeName);
                            validationType = class_validator_1.ValidationTypes.IS_IN;
                            constraints = [enumValues];
                        }
                        else {
                            throw new Error('Type: ' +
                                baseTypeName +
                                ' not found in ' +
                                serviceName.charAt(0).toUpperCase() +
                                serviceName.slice(1) +
                                '.Types');
                        }
                    }
                    else if (baseTypeName === 'any') {
                        if (!typePropertyAnnotationContainer_1.default.getTypePropertyRemoteServiceFetchSpec(Class, propertyName)) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                " type 'any' allowed only with @FetchFromRemoteService() annotation present");
                        }
                    }
                    else if (baseTypeName !== 'any') {
                        validationType = class_validator_1.ValidationTypes.IS_IN;
                        if (isArrayType &&
                            !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.ARRAY_UNIQUE) &&
                            !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                ' must have either @ArrayUnique() or @ArrayNotUnique() annotation');
                        }
                        if (baseTypeName[0] === '(' && baseTypeName[baseTypeName.length - 1] === ')') {
                            baseTypeName = baseTypeName.slice(1, -1);
                        }
                        let enumType;
                        const enumValues = baseTypeName.split('|').map((enumValue) => {
                            const trimmedEnumValue = enumValue.trim();
                            const validator = new class_validator_1.Validator();
                            if (validator.isNumberString(trimmedEnumValue)) {
                                if (enumType === 'string') {
                                    throw new Error('All enum values must be of same type: ' +
                                        baseTypeName +
                                        ' in ' +
                                        className +
                                        '.' +
                                        propertyName);
                                }
                                enumType = 'number';
                                return parseFloat(trimmedEnumValue);
                            }
                            else if ((trimmedEnumValue.charAt(0) === "'" &&
                                trimmedEnumValue.charAt(trimmedEnumValue.length - 1) === "'") ||
                                (trimmedEnumValue.charAt(0) === '"' &&
                                    trimmedEnumValue.charAt(trimmedEnumValue.length - 1) === '"')) {
                                if (enumType === 'number') {
                                    throw new Error('All enum values must be of same type: ' +
                                        baseTypeName +
                                        ' in ' +
                                        className +
                                        '.' +
                                        propertyName);
                                }
                                enumType = 'string';
                                return trimmedEnumValue.slice(1, -1);
                            }
                            else {
                                throw new Error('Enum values cannot contain | character in ' + className + '.' + propertyName);
                            }
                        });
                        constraints = [enumValues];
                    }
                    if (typePropertyAnnotationContainer_1.default.getTypePropertyRemoteServiceFetchSpec(Class, propertyName)) {
                        if (!classBodyNode.readonly) {
                            throw new Error(Class.name +
                                '.' +
                                propertyName +
                                ' must be a readonly property when property decorated with @FetchFromRemoteService() annotation');
                        }
                    }
                    if (validationType && !doesPropertyContainValidation(Class, propertyName, validationType)) {
                        const validationMetadataArgs = {
                            type: validationType,
                            target: Class,
                            propertyName,
                            constraints,
                            validationOptions: { each: isArrayType }
                        };
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(validationMetadataArgs));
                    }
                    if (isArrayType && !doesPropertyContainValidation(Class, propertyName, class_validator_1.ValidationTypes.IS_ARRAY)) {
                        const arrayValidationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.IS_ARRAY,
                            target: Class,
                            propertyName
                        };
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(arrayValidationMetadataArgs));
                    }
                    if (isNullableType) {
                        const isNullableValidationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CONDITIONAL_VALIDATION,
                            target: Class,
                            propertyName,
                            constraints: [(object) => object[propertyName] !== null, 'isNullable'],
                            validationOptions: { each: isArrayType }
                        };
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(isNullableValidationMetadataArgs));
                    }
                    const conditionalValidation = getPropertyValidationOfType(Class, propertyTypeName, class_validator_1.ValidationTypes.CONDITIONAL_VALIDATION);
                    if (classBodyNode.optional &&
                        (!conditionalValidation || conditionalValidation.constraints[1] !== 'isOptional')) {
                        const optionalValidationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CONDITIONAL_VALIDATION,
                            target: Class,
                            constraints: [
                                (object) => {
                                    return object[propertyName] !== null && object[propertyName] !== undefined;
                                },
                                'isOptional'
                            ],
                            propertyName
                        };
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(new ValidationMetadata_1.ValidationMetadata(optionalValidationMetadataArgs));
                    }
                    if (propertyName !== '_id' && entityAnnotationContainer_1.default.isEntity(Class)) {
                        const optionalValidationMetadataArgs = {
                            type: class_validator_1.ValidationTypes.CONDITIONAL_VALIDATION,
                            target: Class,
                            constraints: [
                                (object) => {
                                    return object[propertyName] !== null && object[propertyName] !== undefined;
                                },
                                'isOptional'
                            ],
                            propertyName
                        };
                        const validationMetadata = new ValidationMetadata_1.ValidationMetadata(optionalValidationMetadataArgs);
                        validationMetadata.groups = ['__backk_update__'];
                        class_validator_1.getFromContainer(class_validator_1.MetadataStorage).addValidationMetadata(validationMetadata);
                    }
                }
            }
        }
    }
}
exports.default = setClassPropertyValidationDecorators;
//# sourceMappingURL=setClassPropertyValidationDecorators.js.map