"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasBackkSrcFilenameForTypeName = exports.hasSrcFilenameForTypeName = exports.getFileNamesRecursively = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function getFileNamesRecursively(directory) {
    const directoryEntries = fs_1.readdirSync(directory, { withFileTypes: true });
    const files = directoryEntries.map((directoryEntry) => {
        const pathName = path_1.resolve(directory, directoryEntry.name);
        return directoryEntry.isDirectory() ? getFileNamesRecursively(pathName) : pathName;
    });
    return Array.prototype.concat(...files);
}
exports.getFileNamesRecursively = getFileNamesRecursively;
function hasSrcFilenameForTypeName(typeName, serviceRootDir = '') {
    if (typeName.includes(':')) {
        typeName = typeName.split(':')[1];
    }
    const srcFilePathNames = getFileNamesRecursively(process.cwd() + (serviceRootDir ? '/' + serviceRootDir : '') + '/src');
    let backkSrcFilePathNames = [];
    if (fs_1.existsSync(process.cwd() + '/node_modules/backk/src')) {
        backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
    }
    const foundFilePathName = [...srcFilePathNames, ...backkSrcFilePathNames].find((filePathName) => {
        return filePathName.endsWith('/' + typeName + '.ts');
    });
    return !!foundFilePathName;
}
exports.hasSrcFilenameForTypeName = hasSrcFilenameForTypeName;
function hasBackkSrcFilenameForTypeName(typeName) {
    if (typeName.includes(':')) {
        typeName = typeName.split(':')[1];
    }
    const srcFilePathNames = getFileNamesRecursively(process.cwd() + '/src');
    let backkSrcFilePathNames = [];
    if (fs_1.existsSync(process.cwd() + '/node_modules/backk/src')) {
        backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
    }
    const foundFilePathName = [...srcFilePathNames, ...backkSrcFilePathNames].find((filePathName) => {
        return filePathName.includes('backk') && filePathName.endsWith('/' + typeName + '.ts');
    });
    return !!foundFilePathName;
}
exports.hasBackkSrcFilenameForTypeName = hasBackkSrcFilenameForTypeName;
function getSrcFilePathNameForTypeName(typeName, serviceRootDir = '') {
    if (typeName.includes(':')) {
        typeName = typeName.split(':')[1];
    }
    const srcFilePathNames = getFileNamesRecursively(process.cwd() + (serviceRootDir ? '/' + serviceRootDir : '') + '/src');
    let backkSrcFilePathNames = [];
    if (fs_1.existsSync(process.cwd() + '/node_modules/backk/src')) {
        backkSrcFilePathNames = getFileNamesRecursively(process.cwd() + '/node_modules/backk/src');
    }
    const foundFilePathNames = [...srcFilePathNames, ...backkSrcFilePathNames].filter((filePathName) => {
        return filePathName.endsWith('/' + typeName + '.ts');
    });
    if (foundFilePathNames.length === 0) {
        throw new Error('File not found for type: ' + typeName);
    }
    else if (foundFilePathNames.length > 1) {
        throw new Error('Multiple types with same name not supported: ' + typeName);
    }
    return foundFilePathNames[0];
}
exports.default = getSrcFilePathNameForTypeName;
//# sourceMappingURL=getSrcFilePathNameForTypeName.js.map