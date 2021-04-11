"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const constants_1 = require("../constants/constants");
const typePropertyAnnotationContainer_1 = __importDefault(require("../decorators/typeproperty/typePropertyAnnotationContainer"));
const isEntityTypeName_1 = __importDefault(require("../utils/type/isEntityTypeName"));
const classNameToMetadataMap = {};
function getClassPropertyNameToPropertyTypeNameMap(Class, dbManager, isGeneration = false) {
    if (!isGeneration && classNameToMetadataMap[Class.name]) {
        return classNameToMetadataMap[Class.name];
    }
    if (!Class.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        throw new Error(Class.name + ': must match regular expression /^[a-zA-Z_][a-zA-Z0-9_]*$/');
    }
    const validationMetadatas = class_validator_1.getFromContainer(class_validator_1.MetadataStorage).getTargetValidationMetadatas(Class, '');
    const prototypes = [];
    let prototype = Object.getPrototypeOf(new Class());
    while (prototype !== Object.prototype) {
        prototypes.push(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
    prototypes.reverse();
    prototypes.forEach((prototype) => {
        validationMetadatas.sort(({ target }) => (target === prototype.constructor ? -1 : 0));
    });
    validationMetadatas.reverse();
    const propNameToIsOptionalMap = {};
    const propNameToPropTypeNameMap = {};
    const propNameToDefaultValueMap = {};
    const typeObject = new Class();
    Object.entries(typeObject).forEach(([propName, defaultValue]) => {
        propNameToDefaultValueMap[propName] = defaultValue;
    });
    validationMetadatas.forEach((validationMetadata) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25;
        if (!validationMetadata.propertyName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            throw new Error(Class.name +
                '.' +
                validationMetadata.propertyName +
                ': must match regular expression /^[a-zA-Z_][a-zA-Z0-9_]*$/');
        }
        const hasDifferentDbManagerGroup = (_a = validationMetadata.groups) === null || _a === void 0 ? void 0 : _a.find((group) => group.startsWith('DbManager: ') && group !== 'DbManager: ' + (dbManager === null || dbManager === void 0 ? void 0 : dbManager.getDbManagerType()));
        if (hasDifferentDbManagerGroup) {
            return;
        }
        const undefinedValidation = validationMetadatas.find(({ propertyName, type, constraints }) => propertyName === validationMetadata.propertyName &&
            type === 'customValidation' &&
            (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'isUndefined');
        if ((validationMetadata.type === 'maxLength' ||
            validationMetadata.type === 'length' ||
            validationMetadata.type === 'isString' ||
            validationMetadata.type === 'conditionalValidation' ||
            validationMetadata.type === 'nestedValidation' ||
            (validationMetadata.type === 'customValidation' &&
                ((_b = validationMetadata.constraints) === null || _b === void 0 ? void 0 : _b[0]) === 'isStringOrObjectId')) &&
            !((_c = validationMetadata.groups) === null || _c === void 0 ? void 0 : _c.includes('__backk_none__'))) {
            if ((validationMetadata.type === 'maxLength' ||
                validationMetadata.type === 'length' ||
                validationMetadata.type === 'isString' ||
                (validationMetadata.type === 'customValidation' &&
                    ((_d = validationMetadata.constraints) === null || _d === void 0 ? void 0 : _d[0]) === 'isStringOrObjectId')) &&
                undefinedValidation &&
                ((_e = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _e === void 0 ? void 0 : _e[0]) === '__backk_update__') {
                if (!((_f = validationMetadata.groups) === null || _f === void 0 ? void 0 : _f.includes('__backk_firstRoundWhenCreate__'))) {
                    validationMetadata.groups = (_h = (_g = validationMetadata.groups) === null || _g === void 0 ? void 0 : _g.concat('__backk_firstRoundWhenCreate__')) !== null && _h !== void 0 ? _h : [
                        '__backk_firstRoundWhenCreate__'
                    ];
                }
            }
            else if ((validationMetadata.type === 'maxLength' ||
                validationMetadata.type === 'length' ||
                validationMetadata.type === 'isString' ||
                (validationMetadata.type === 'customValidation' &&
                    ((_j = validationMetadata.constraints) === null || _j === void 0 ? void 0 : _j[0]) === 'isStringOrObjectId')) &&
                undefinedValidation &&
                ((_k = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _k === void 0 ? void 0 : _k[0]) === '__backk_create__') {
                if (!((_l = validationMetadata.groups) === null || _l === void 0 ? void 0 : _l.includes('__backk_firstRoundWhenUpdate__'))) {
                    validationMetadata.groups = (_o = (_m = validationMetadata.groups) === null || _m === void 0 ? void 0 : _m.concat('__backk_firstRoundWhenUpdate__')) !== null && _o !== void 0 ? _o : [
                        '__backk_firstRoundWhenUpdate__'
                    ];
                }
            }
            else {
                if (!((_p = validationMetadata.groups) === null || _p === void 0 ? void 0 : _p.includes('__backk_firstRound__'))) {
                    validationMetadata.groups = (_r = (_q = validationMetadata.groups) === null || _q === void 0 ? void 0 : _q.concat('__backk_firstRound__')) !== null && _r !== void 0 ? _r : [
                        '__backk_firstRound__'
                    ];
                }
            }
        }
        if (validationMetadata.type !== 'arrayMinSize' &&
            validationMetadata.type !== 'arrayMaxSize' &&
            validationMetadata.type !== 'arrayUnique' &&
            (validationMetadata.type !== 'customValidation' ||
                (validationMetadata.type === 'customValidation' &&
                    validationMetadata.constraints[0] !== 'isUndefined'))) {
            if (!((_s = validationMetadata.groups) === null || _s === void 0 ? void 0 : _s.includes('__backk_response__'))) {
                validationMetadata.groups = (_u = (_t = validationMetadata.groups) === null || _t === void 0 ? void 0 : _t.concat('__backk_response__')) !== null && _u !== void 0 ? _u : [
                    '__backk_response__'
                ];
            }
        }
        if (validationMetadata.type !== 'customValidation' ||
            (validationMetadata.type === 'customValidation' && validationMetadata.constraints[0] !== 'isUndefined')) {
            if (((_v = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _v === void 0 ? void 0 : _v[0]) === '__backk_update__' && !((_w = undefinedValidation.groups) === null || _w === void 0 ? void 0 : _w[1])) {
                if (!((_x = validationMetadata.groups) === null || _x === void 0 ? void 0 : _x.includes('__backk_create__'))) {
                    validationMetadata.groups = (_z = (_y = validationMetadata.groups) === null || _y === void 0 ? void 0 : _y.concat('__backk_create__')) !== null && _z !== void 0 ? _z : [
                        '__backk_create__'
                    ];
                }
            }
            else if (((_0 = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _0 === void 0 ? void 0 : _0[0]) === '__backk_create__' &&
                !((_1 = undefinedValidation.groups) === null || _1 === void 0 ? void 0 : _1[1])) {
                if (!((_2 = validationMetadata.groups) === null || _2 === void 0 ? void 0 : _2.includes('__backk_update__'))) {
                    validationMetadata.groups = (_4 = (_3 = validationMetadata.groups) === null || _3 === void 0 ? void 0 : _3.concat('__backk_update__')) !== null && _4 !== void 0 ? _4 : [
                        '__backk_update__'
                    ];
                }
            }
            else if (((_5 = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _5 === void 0 ? void 0 : _5[0]) === '__backk_create__' &&
                ((_6 = undefinedValidation === null || undefinedValidation === void 0 ? void 0 : undefinedValidation.groups) === null || _6 === void 0 ? void 0 : _6[1]) === '__backk_update__') {
                if (!((_7 = validationMetadata.groups) === null || _7 === void 0 ? void 0 : _7.includes('__backk_none__'))) {
                    validationMetadata.groups = (_9 = (_8 = validationMetadata.groups) === null || _8 === void 0 ? void 0 : _8.concat('__backk_none__')) !== null && _9 !== void 0 ? _9 : [
                        '__backk_none__'
                    ];
                }
            }
            else {
                if (!((_10 = validationMetadata.groups) === null || _10 === void 0 ? void 0 : _10.includes('__backk_none__')) &&
                    !((_11 = validationMetadata.groups) === null || _11 === void 0 ? void 0 : _11.includes('__backk_argument__')) &&
                    !((_12 = validationMetadata.groups) === null || _12 === void 0 ? void 0 : _12.includes('__backk_update__'))) {
                    validationMetadata.groups = (_14 = (_13 = validationMetadata.groups) === null || _13 === void 0 ? void 0 : _13.concat('__backk_argument__')) !== null && _14 !== void 0 ? _14 : [
                        '__backk_argument__'
                    ];
                }
            }
        }
        let isNullable = false;
        if (validationMetadata.type === 'conditionalValidation') {
            if (validationMetadata.constraints[1] === 'isOptional' &&
                validationMetadata.groups[0] !== '__backk_update__') {
                propNameToIsOptionalMap[validationMetadata.propertyName] = true;
            }
            else if (validationMetadata.constraints[1] === 'isNullable') {
                isNullable = true;
            }
        }
        switch (validationMetadata.type) {
            case 'isNumber':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    'number' + ((_15 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _15 !== void 0 ? _15 : '');
                break;
            case 'isString':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    'string' + ((_16 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _16 !== void 0 ? _16 : '');
                break;
            case 'isInt':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    'integer' + ((_17 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _17 !== void 0 ? _17 : '');
                break;
            case 'isDate':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    'Date' + ((_18 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _18 !== void 0 ? _18 : '');
                break;
            case 'customValidation':
                if (validationMetadata.constraints[0] === 'isBigInt') {
                    propNameToPropTypeNameMap[validationMetadata.propertyName] =
                        'bigint' + ((_19 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _19 !== void 0 ? _19 : '');
                }
                else if (validationMetadata.constraints[0] === 'isBooleanOrTinyInt') {
                    propNameToPropTypeNameMap[validationMetadata.propertyName] =
                        'boolean' + ((_20 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _20 !== void 0 ? _20 : '');
                }
                else if (validationMetadata.constraints[0] === 'isStringOrObjectId') {
                    propNameToPropTypeNameMap[validationMetadata.propertyName] =
                        'string' + ((_21 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _21 !== void 0 ? _21 : '');
                }
                break;
            case 'isIn':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    '(' +
                        validationMetadata.constraints[0]
                            .map((value) => (typeof value === 'string' ? `'${value}'` : `${value}`))
                            .join('|') +
                        ')' +
                        ((_22 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _22 !== void 0 ? _22 : '');
                break;
            case 'isInstance':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    validationMetadata.constraints[0].name +
                        ((_23 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _23 !== void 0 ? _23 : '');
                break;
            case 'isArray':
                propNameToPropTypeNameMap[validationMetadata.propertyName] =
                    ((_24 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _24 !== void 0 ? _24 : '') + '[]';
                break;
        }
        if (isNullable) {
            propNameToPropTypeNameMap[validationMetadata.propertyName] =
                ((_25 = propNameToPropTypeNameMap[validationMetadata.propertyName]) !== null && _25 !== void 0 ? _25 : '') + ' | null';
        }
        const hasMatchesValidation = !!validationMetadatas.find(({ propertyName, type }) => propertyName === validationMetadata.propertyName && type === 'matches');
        if (isGeneration && hasMatchesValidation) {
            throw new Error('Property ' +
                Class.name +
                '.' +
                validationMetadata.propertyName +
                ': Use @MaxLengthAndMatches or @MaxLengthAndMatchesAll instead of @Matches');
        }
        if (validationMetadata.type === 'isArray') {
            const arrayMaxSizeValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                otherValidationMetadata.type === 'arrayMaxSize');
            const arrayMinSizeValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                otherValidationMetadata.type === 'arrayMinSize');
            const undefinedValidation = validationMetadatas.find(({ propertyName, type, constraints }) => propertyName === validationMetadata.propertyName &&
                type === 'customValidation' &&
                (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'isUndefined');
            if (!undefinedValidation && !arrayMaxSizeValidationMetadata) {
                throw new Error('Property ' +
                    Class.name +
                    '.' +
                    validationMetadata.propertyName +
                    ' has array type and must have @ArrayMaxSize annotation');
            }
            if (!undefinedValidation && !arrayMinSizeValidationMetadata) {
                throw new Error('Property ' +
                    Class.name +
                    '.' +
                    validationMetadata.propertyName +
                    ' has array type and must have @ArrayMinSize annotation');
            }
            const instanceValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                otherValidationMetadata.type === 'isInstance');
            const isOneToMany = typePropertyAnnotationContainer_1.default.isTypePropertyOneToMany(Class, validationMetadata.propertyName);
            const isManyToMany = typePropertyAnnotationContainer_1.default.isTypePropertyManyToMany(Class, validationMetadata.propertyName);
            const isReferenceToExternalEntity = typePropertyAnnotationContainer_1.default.isTypePropertyExternalServiceEntity(Class, validationMetadata.propertyName);
            if (instanceValidationMetadata && !isOneToMany && !isManyToMany && isEntityTypeName_1.default(Class.name)) {
                throw new Error('Property ' +
                    Class.name +
                    '.' +
                    validationMetadata.propertyName +
                    ' must have @OneToMany(true/false) or @ManyToMany() annotation. If you want ManyToOne relationship, use these 3 annotations: @ArrayMinSize(1), @ArrayMaxSize(1) and @ManyToMany. If this relationship is a reference to external entity (ie. join to external table), use annotation: @OneToMany(true)');
            }
            if (instanceValidationMetadata &&
                isOneToMany &&
                isReferenceToExternalEntity &&
                !undefinedValidation &&
                isEntityTypeName_1.default(Class.name)) {
                throw new Error('Property ' +
                    Class.name +
                    '.' +
                    validationMetadata.propertyName +
                    ' must be declared to readonly, because it is a reference to external entity and cannot be modified by this service');
            }
        }
        if (isGeneration) {
            if (validationMetadata.type === 'isInt' ||
                validationMetadata.type === 'isNumber' ||
                (validationMetadata.type === 'customValidation' && validationMetadata.constraints[0] === 'isBigInt')) {
                const minValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                    otherValidationMetadata.type === 'min');
                const maxValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                    otherValidationMetadata.type === 'max');
                const minMaxValidationMetadata = validationMetadatas.find((otherValidationMetadata) => otherValidationMetadata.propertyName === validationMetadata.propertyName &&
                    otherValidationMetadata.type === 'customValidation' &&
                    otherValidationMetadata.constraints[0] === 'minMax');
                if (!minMaxValidationMetadata &&
                    (minValidationMetadata === undefined || maxValidationMetadata === undefined)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' has numeric type and must have @Min and @Max annotations or @MinMax annotation');
                }
                if ((minValidationMetadata === null || minValidationMetadata === void 0 ? void 0 : minValidationMetadata.constraints[0]) > (maxValidationMetadata === null || maxValidationMetadata === void 0 ? void 0 : maxValidationMetadata.constraints[0]) ||
                    (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[1]) > (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[2])) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' has @Min validation that is greater than @Max validation');
                }
                if (validationMetadata.type === 'isInt' &&
                    ((minValidationMetadata === null || minValidationMetadata === void 0 ? void 0 : minValidationMetadata.constraints[0]) < -2147483648 ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[1]) < -2147483648)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' has @Min validation value must be equal or greater than -2147483648');
                }
                if (validationMetadata.type === 'isInt' &&
                    ((maxValidationMetadata === null || maxValidationMetadata === void 0 ? void 0 : maxValidationMetadata.constraints[0]) > constants_1.MAX_INT_VALUE ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[2]) > constants_1.MAX_INT_VALUE)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' @Max validation value must be equal or less than 2147483647');
                }
                if (validationMetadata.type === 'customValidation' &&
                    validationMetadata.constraints[0] === 'isBigInt' &&
                    ((minValidationMetadata === null || minValidationMetadata === void 0 ? void 0 : minValidationMetadata.constraints[0]) < Number.MIN_SAFE_INTEGER ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[1]) < Number.MIN_SAFE_INTEGER)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' has @Min validation value must be equal or greater than ' +
                        Number.MIN_SAFE_INTEGER.toString());
                }
                if (validationMetadata.type === 'customValidation' &&
                    validationMetadata.constraints[0] === 'isBigInt' &&
                    ((maxValidationMetadata === null || maxValidationMetadata === void 0 ? void 0 : maxValidationMetadata.constraints[0]) > Number.MAX_SAFE_INTEGER ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[2]) > Number.MAX_SAFE_INTEGER)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' @Max validation value must be equal or less than ' +
                        Number.MAX_SAFE_INTEGER);
                }
                if (validationMetadata.type === 'isNumber' &&
                    ((minValidationMetadata === null || minValidationMetadata === void 0 ? void 0 : minValidationMetadata.constraints[0]) < -(10 ** 308) ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[1]) < -(10 ** 308))) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' @Min validation value must be equal or greater than -1E308');
                }
                if (validationMetadata.type === 'isNumber' &&
                    ((maxValidationMetadata === null || maxValidationMetadata === void 0 ? void 0 : maxValidationMetadata.constraints[0]) > 10 ** 308 ||
                        (minMaxValidationMetadata === null || minMaxValidationMetadata === void 0 ? void 0 : minMaxValidationMetadata.constraints[2]) > 10 ** 308)) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' @Max validation value must be equal or less than 1E308');
                }
            }
            if (validationMetadata.type === 'isString') {
                const hasMaxLengthValidation = !!validationMetadatas.find(({ propertyName, type }) => propertyName === validationMetadata.propertyName && type === 'maxLength');
                const hasLengthValidation = !!validationMetadatas.find(({ type, propertyName }) => propertyName === validationMetadata.propertyName && type === 'length');
                const hasMaxLengthAndMatchesValidation = !!validationMetadatas.find(({ constraints, propertyName }) => propertyName === validationMetadata.propertyName && (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'maxLengthAndMatches');
                const hasMaxLengthAndMatchesAllValidation = !!validationMetadatas.find(({ constraints, propertyName }) => propertyName === validationMetadata.propertyName && (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'maxLengthAndMatchesAll');
                const hasLengthAndMatchesValidation = !!validationMetadatas.find(({ constraints, propertyName }) => propertyName === validationMetadata.propertyName && (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'lengthAndMatches');
                const hasLengthAndMatchesAllValidation = !!validationMetadatas.find(({ constraints, propertyName }) => propertyName === validationMetadata.propertyName && (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'lengthAndMatchesAll');
                const hasStrongPasswordValidation = !!validationMetadatas.find(({ constraints, propertyName }) => propertyName === validationMetadata.propertyName && (constraints === null || constraints === void 0 ? void 0 : constraints[0]) === 'isStrongPassword');
                if (!hasMaxLengthValidation &&
                    !hasMaxLengthAndMatchesValidation &&
                    !hasMaxLengthAndMatchesAllValidation &&
                    !hasLengthValidation &&
                    !hasLengthAndMatchesValidation &&
                    !hasLengthAndMatchesAllValidation &&
                    !hasStrongPasswordValidation) {
                    throw new Error('Property ' +
                        Class.name +
                        '.' +
                        validationMetadata.propertyName +
                        ' has string type and must have either @Length, @MaxLength, @MaxLengthAndMatches or @MaxLengthAndMatchesAll annotation');
                }
            }
        }
    });
    const metadata = Object.entries(propNameToPropTypeNameMap).reduce((accumulatedTypeObject, [propName, propTypeName]) => {
        let finalPropType = propTypeName;
        if (propNameToIsOptionalMap[propName] && propTypeName.includes(' | null') && propTypeName[0] !== '(') {
            finalPropType = '(' + propTypeName + ')';
        }
        return {
            ...accumulatedTypeObject,
            [propName]: (propNameToIsOptionalMap[propName] ? '?' + finalPropType : finalPropType) +
                (propNameToDefaultValueMap[propName] === undefined
                    ? ''
                    : ` = ${JSON.stringify(propNameToDefaultValueMap[propName])}`)
        };
    }, {});
    if (!classNameToMetadataMap[Class.name]) {
        classNameToMetadataMap[Class.name] = metadata;
    }
    return metadata;
}
exports.default = getClassPropertyNameToPropertyTypeNameMap;
//# sourceMappingURL=getClassPropertyNameToPropertyTypeNameMap.js.map