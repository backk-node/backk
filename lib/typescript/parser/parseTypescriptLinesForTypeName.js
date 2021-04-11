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
const lodash_1 = __importDefault(require("lodash"));
const core_1 = require("@babel/core");
const generator_1 = __importDefault(require("@babel/generator"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const getSrcFilePathNameForTypeName_1 = __importStar(require("../../utils/file/getSrcFilePathNameForTypeName"));
function getDeclarationsFor(typeName, originatingTypeFilePathName) {
    const typeFilePathName = getSrcFilePathNameForTypeName_1.default(typeName);
    const fileContentsStr = fs_1.readFileSync(typeFilePathName, { encoding: 'UTF-8' });
    const ast = core_1.parseSync(fileContentsStr, {
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-typescript'
        ]
    });
    const nodes = ast.program.body;
    let importLines = [];
    let classPropertyDeclarations = [];
    for (const node of nodes) {
        if (node.type === 'ImportDeclaration') {
            if (node.source.value.startsWith('.')) {
                const relativeImportPathName = node.source.value;
                const importAbsolutePathName = path_1.default.resolve(path_1.default.dirname(typeFilePathName !== null && typeFilePathName !== void 0 ? typeFilePathName : ''), relativeImportPathName);
                let newRelativeImportPathName = path_1.default.relative(path_1.default.dirname(originatingTypeFilePathName), importAbsolutePathName);
                if (!newRelativeImportPathName.startsWith('.')) {
                    newRelativeImportPathName = './' + newRelativeImportPathName;
                }
                if (newRelativeImportPathName !== relativeImportPathName) {
                    node.source.value = newRelativeImportPathName;
                }
            }
            importLines.push(generator_1.default(node).code);
        }
        if ((node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
            node.declaration.type === 'ClassDeclaration') {
            if (node.declaration.superClass) {
                const [superClassesImportLines, superClassesPropertyDeclarations] = getDeclarationsFor(node.declaration.superClass.name, originatingTypeFilePathName);
                importLines = importLines.concat(superClassesImportLines);
                classPropertyDeclarations = classPropertyDeclarations.concat(superClassesPropertyDeclarations);
            }
            node.declaration.body.body.forEach((classBodyNode) => {
                if (classBodyNode.type === 'ClassProperty') {
                    classPropertyDeclarations.push(classBodyNode);
                }
            });
        }
    }
    return [importLines, classPropertyDeclarations];
}
function parseTypescriptLinesForTypeName(typeName, isBaseTypeOptional, isReadonly, isPublic, isNonNullable, isPrivate, keys, keyType, originatingTypeFilePathName, keyToNewKeyMap) {
    let typeFilePathName;
    let fileContentsStr;
    if (getSrcFilePathNameForTypeName_1.hasSrcFilenameForTypeName(typeName)) {
        typeFilePathName = getSrcFilePathNameForTypeName_1.default(typeName);
        fileContentsStr = fs_1.readFileSync(typeFilePathName, { encoding: 'UTF-8' });
    }
    else {
        throw new Error('In type file: ' + originatingTypeFilePathName + ': Unsupported type: ' + typeName);
    }
    const ast = core_1.parseSync(fileContentsStr, {
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-typescript'
        ]
    });
    const nodes = ast.program.body;
    let importLines = [];
    const finalClassPropertyDeclarations = [];
    const classPropertyNames = [];
    for (const node of nodes) {
        if (node.type === 'ImportDeclaration') {
            if (node.source.value.startsWith('.')) {
                const relativeImportPathName = node.source.value;
                const importAbsolutePathName = path_1.default.resolve(path_1.default.dirname(typeFilePathName !== null && typeFilePathName !== void 0 ? typeFilePathName : ''), relativeImportPathName);
                const newRelativeImportPathName = path_1.default.relative(path_1.default.dirname(originatingTypeFilePathName), importAbsolutePathName);
                if (newRelativeImportPathName !== relativeImportPathName) {
                    node.source.value = newRelativeImportPathName;
                }
            }
            importLines.push(generator_1.default(node).code);
        }
        if ((node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
            node.declaration.type === 'ClassDeclaration') {
            let classPropertyDeclarations = [];
            if (node.declaration.superClass) {
                const [superClassesImportLines, superClassesPropertyDeclarations] = getDeclarationsFor(node.declaration.superClass.name, originatingTypeFilePathName);
                importLines = importLines.concat(superClassesImportLines);
                classPropertyDeclarations = classPropertyDeclarations.concat(superClassesPropertyDeclarations);
            }
            classPropertyDeclarations = classPropertyDeclarations.concat(node.declaration.body.body);
            classPropertyDeclarations.forEach((classBodyNode) => {
                var _a, _b, _c;
                if (classBodyNode.type === 'ClassProperty') {
                    const propertyName = classBodyNode.key.name;
                    classPropertyNames.push(propertyName);
                    if (keyType === 'omit' && keys.includes(propertyName)) {
                        return;
                    }
                    else if (keyType === 'pick') {
                        if (!keys.includes(propertyName)) {
                            return;
                        }
                        if (keyToNewKeyMap && keyToNewKeyMap[propertyName]) {
                            keyToNewKeyMap[propertyName].forEach((newKey) => {
                                var _a, _b, _c;
                                const classProperty = lodash_1.default.cloneDeep(classBodyNode);
                                classProperty.key.name = newKey;
                                if (isBaseTypeOptional) {
                                    classProperty.optional = true;
                                    classProperty.definite = false;
                                }
                                if (isReadonly) {
                                    classProperty.readonly = true;
                                }
                                if (isPublic) {
                                    classProperty.accessibility = 'public';
                                    classProperty.decorators = (_a = classProperty.decorators) === null || _a === void 0 ? void 0 : _a.filter((decorator) => decorator.expression.callee.name !== 'Private' &&
                                        decorator.expression.callee.name !== 'IsUndefined');
                                }
                                if (isPrivate) {
                                    importLines.push("import Entity from '../../../../backk/decorators/typeproperty/IsPrivate';");
                                    classProperty.decorators.push({
                                        type: 'Decorator',
                                        expression: {
                                            type: 'CallExpression',
                                            callee: {
                                                type: 'Identifier',
                                                name: 'Private'
                                            },
                                            arguments: [],
                                            optional: false
                                        }
                                    });
                                }
                                if (isNonNullable) {
                                    classProperty.optional = false;
                                    if (classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
                                        ((_c = (_b = classProperty.typeAnnotation.typeAnnotation) === null || _b === void 0 ? void 0 : _b.types[1]) === null || _c === void 0 ? void 0 : _c.type) === 'TSNullKeyword') {
                                        classProperty.typeAnnotation.typeAnnotation =
                                            classProperty.typeAnnotation.typeAnnotation.types[0];
                                    }
                                }
                                finalClassPropertyDeclarations.push(classProperty);
                            });
                            return;
                        }
                    }
                }
                if (isBaseTypeOptional) {
                    classBodyNode.optional = true;
                    classBodyNode.definite = false;
                }
                if (isReadonly) {
                    classBodyNode.readonly = true;
                }
                if (isPublic) {
                    classBodyNode.accessibility = 'public';
                    classBodyNode.decorators = (_a = classBodyNode.decorators) === null || _a === void 0 ? void 0 : _a.filter((decorator) => decorator.expression.callee.name !== 'Private' &&
                        decorator.expression.callee.name !== 'IsUndefined');
                }
                if (isPrivate) {
                    importLines.push("import Entity from '../../../../backk/decorators/typeproperty/IsPrivate';");
                    classBodyNode.decorators.push({
                        type: 'Decorator',
                        expression: {
                            type: 'CallExpression',
                            callee: {
                                type: 'Identifier',
                                name: 'Private'
                            },
                            arguments: [],
                            optional: false
                        }
                    });
                }
                if (isNonNullable) {
                    classBodyNode.optional = false;
                    if (classBodyNode.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
                        ((_c = (_b = classBodyNode.typeAnnotation.typeAnnotation) === null || _b === void 0 ? void 0 : _b.types[1]) === null || _c === void 0 ? void 0 : _c.type) === 'TSNullKeyword') {
                        classBodyNode.typeAnnotation.typeAnnotation =
                            classBodyNode.typeAnnotation.typeAnnotation.types[0];
                    }
                }
                finalClassPropertyDeclarations.push(classBodyNode);
            });
        }
    }
    keys.forEach((key) => {
        if (!classPropertyNames.some((classPropertyName) => classPropertyName === key)) {
            throw new Error('In type file: ' +
                originatingTypeFilePathName +
                ': key: ' +
                key +
                ' does not exists in type: ' +
                typeName);
        }
    });
    return [importLines, finalClassPropertyDeclarations];
}
exports.default = parseTypescriptLinesForTypeName;
//# sourceMappingURL=parseTypescriptLinesForTypeName.js.map