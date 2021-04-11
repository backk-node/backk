"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const core_1 = require("@babel/core");
const getSrcFilePathNameForTypeName_1 = __importDefault(require("../../utils/file/getSrcFilePathNameForTypeName"));
function parseEnumValuesFromSrcFile(typeName) {
    const fileContentsStr = fs_1.readFileSync(getSrcFilePathNameForTypeName_1.default(typeName), { encoding: 'UTF-8' });
    const ast = core_1.parseSync(fileContentsStr, {
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-typescript'
        ]
    });
    const nodes = ast.program.body;
    for (const node of nodes) {
        if (node.type === 'ExportNamedDeclaration' &&
            node.declaration.type === 'TSTypeAliasDeclaration' &&
            node.declaration.id.name === typeName) {
            return node.declaration.typeAnnotation.types.map((type) => type.literal.value);
        }
    }
    return [];
}
exports.default = parseEnumValuesFromSrcFile;
//# sourceMappingURL=parseEnumValuesFromSrcFile.js.map