"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const core_1 = require("@babel/core");
const isValidFunctionArgumentTypeName_1 = __importDefault(require("../../utils/type/isValidFunctionArgumentTypeName"));
const serviceFunctionAnnotationContainer_1 = __importDefault(require("../../decorators/service/function/serviceFunctionAnnotationContainer"));
function parseServiceFunctionNameToArgAndReturnTypeNameMaps(ServiceClass, serviceName, serviceFileName, remoteServiceRootDir = '') {
    var _a, _b;
    const fileContentsStr = fs_1.readFileSync(serviceFileName, { encoding: 'UTF-8' });
    const fileRows = fileContentsStr.split('\n');
    const ast = core_1.parseSync(fileContentsStr, {
        plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-typescript'
        ]
    });
    const serviceClassName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
    const functionNameToFunctionArgumentTypeNameMap = {};
    const functionNameToFunctionReturnValueTypeNameMap = {};
    let serviceDocumentation;
    const functionNameToDocumentationMap = {};
    const nodes = ast.program.body;
    for (const node of nodes) {
        if (node.type === 'ExportDefaultDeclaration' &&
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id.name === serviceClassName) {
            serviceDocumentation = (_a = node.leadingComments) === null || _a === void 0 ? void 0 : _a[0].value;
            for (const classBodyNode of node.declaration.body.body) {
                if (classBodyNode.type === 'TSDeclareMethod') {
                    if (classBodyNode.accessibility === 'private' || classBodyNode.accessibility === 'protected') {
                        continue;
                    }
                    const functionName = classBodyNode.key.name;
                    if (classBodyNode.params.length >= 1) {
                        if (classBodyNode.params.length > 1 &&
                            !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForServiceInternalUse(ServiceClass, functionName)) {
                            throw new Error(serviceName + '.' + functionName + ': there can be only one input argument');
                        }
                        if (serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForServiceInternalUse(ServiceClass, functionName)) {
                            continue;
                        }
                        const functionArgumentTypeNameStart = classBodyNode.params[0].typeAnnotation.loc.start;
                        const functionArgumentTypeNameEnd = classBodyNode.params[0].typeAnnotation.loc.end;
                        const functionArgumentTypeName = fileRows[functionArgumentTypeNameStart.line - 1].slice(functionArgumentTypeNameStart.column + 1, functionArgumentTypeNameEnd.column).trim();
                        if (!isValidFunctionArgumentTypeName_1.default(functionArgumentTypeName, remoteServiceRootDir) &&
                            !serviceFunctionAnnotationContainer_1.default.isServiceFunctionAllowedForServiceInternalUse(ServiceClass, functionName)) {
                            console.log(fileRows[functionArgumentTypeNameStart.line - 1]);
                            throw new Error(serviceName + '.' + functionName + ': input argument type must be a user-defined class type');
                        }
                        functionNameToFunctionArgumentTypeNameMap[functionName] = functionArgumentTypeName;
                    }
                    const returnTypeNameStart = classBodyNode.returnType.typeAnnotation.loc.start;
                    const returnTypeNameEnd = classBodyNode.returnType.typeAnnotation.loc.end;
                    const returnTypeName = fileRows[returnTypeNameStart.line - 1].slice(returnTypeNameStart.column, returnTypeNameEnd.column);
                    functionNameToFunctionReturnValueTypeNameMap[functionName] = returnTypeName;
                    functionNameToDocumentationMap[functionName] = (_b = classBodyNode.leadingComments) === null || _b === void 0 ? void 0 : _b[0].value;
                }
            }
        }
    }
    return [
        serviceDocumentation,
        functionNameToFunctionArgumentTypeNameMap,
        functionNameToFunctionReturnValueTypeNameMap,
        functionNameToDocumentationMap
    ];
}
exports.default = parseServiceFunctionNameToArgAndReturnTypeNameMaps;
//# sourceMappingURL=parseServiceFunctionNameToArgAndReturnTypeNameMaps.js.map