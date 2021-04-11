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
const fs_1 = require("fs");
const ts = __importStar(require("typescript"));
const path_1 = __importDefault(require("path"));
const getSrcFilePathNameForTypeName_1 = __importDefault(require("../../utils/file/getSrcFilePathNameForTypeName"));
const types_1 = __importDefault(require("../../types/types"));
function generateClassFromSrcFile(typeName, remoteServiceRootDir = '') {
    if (types_1.default[typeName]) {
        return types_1.default[typeName];
    }
    const srcFilePathName = getSrcFilePathNameForTypeName_1.default(typeName, remoteServiceRootDir);
    const fileContentsStr = fs_1.readFileSync(srcFilePathName, { encoding: 'UTF-8' });
    const srcDirectory = path_1.default.dirname(srcFilePathName).split(/src/)[1];
    const result = ts.transpileModule(fileContentsStr, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2017,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            esModuleInterop: true,
            incremental: true
        }
    });
    const outputRows = result.outputText.split('\n');
    let newOutputText = outputRows.slice(0, -2).join('\n') + '\n' + '(' + typeName + ')';
    newOutputText = newOutputText.replace(/require\("\.{2}\//g, 'require("../../../..' +
        (remoteServiceRootDir ? '/' + remoteServiceRootDir : '') +
        '/dist' +
        srcDirectory +
        '/../');
    newOutputText = newOutputText.replace(/require\("\.\//g, 'require("../../../..' +
        (remoteServiceRootDir ? '/' + remoteServiceRootDir : '') +
        '/dist' +
        srcDirectory +
        '/');
    const generatedClass = eval(newOutputText);
    return generatedClass;
}
exports.default = generateClassFromSrcFile;
//# sourceMappingURL=generateClassFromSrcFile.js.map