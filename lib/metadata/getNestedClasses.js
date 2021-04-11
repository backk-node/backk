"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
const fs_1 = require("fs");
const getSrcFilePathNameForTypeName_1 = __importDefault(require("../utils/file/getSrcFilePathNameForTypeName"));
const getTypeInfoForTypeName_1 = __importDefault(require("../utils/type/getTypeInfoForTypeName"));
const generateClassFromSrcFile_1 = __importDefault(require("../typescript/generator/generateClassFromSrcFile"));
const isEnumTypeName_1 = __importDefault(require("../utils/type/isEnumTypeName"));
function getNestedClasses(classNames, Types, PublicTypes, remoteServiceRootDir = '') {
    classNames.forEach((className) => {
        if (className.includes(':')) {
            className = className.split(':')[1];
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
                        if (!classBodyNode.typeAnnotation) {
                            throw new Error(className + '.' + classBodyNode.key.name + ' is missing type annotation');
                        }
                        const propertyTypeNameStart = classBodyNode.typeAnnotation.loc.start;
                        const propertyTypeNameEnd = classBodyNode.typeAnnotation.loc.end;
                        const propertyTypeName = fileRows[propertyTypeNameStart.line - 1].slice(propertyTypeNameStart.column + 2, propertyTypeNameEnd.column);
                        const { baseTypeName } = getTypeInfoForTypeName_1.default(propertyTypeName);
                        if (baseTypeName !== 'Date' &&
                            baseTypeName.charAt(0).match(/^[_$A-Z]$/) &&
                            !isEnumTypeName_1.default(baseTypeName)) {
                            if (!Types[baseTypeName]) {
                                Types[baseTypeName] = generateClassFromSrcFile_1.default(baseTypeName, remoteServiceRootDir);
                                PublicTypes[baseTypeName] = Types[baseTypeName];
                                getNestedClasses([baseTypeName], Types, PublicTypes);
                                let proto = Object.getPrototypeOf(new Types[baseTypeName]());
                                while (proto !== Object.prototype) {
                                    if (!Types[proto.constructor.name]) {
                                        Types[proto.constructor.name] = proto.constructor;
                                        getNestedClasses([baseTypeName], Types, PublicTypes);
                                    }
                                    proto = Object.getPrototypeOf(proto);
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}
exports.default = getNestedClasses;
//# sourceMappingURL=getNestedClasses.js.map