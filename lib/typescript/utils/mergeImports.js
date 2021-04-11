"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function mergeImports(importLines) {
    const nonMergeableImportLines = importLines.filter((importLine) => !importLine
        .slice(7)
        .trim()
        .startsWith('{'));
    const importFileToImportedNamesMap = importLines
        .filter((importLine) => importLine
        .slice(7)
        .trim()
        .startsWith('{'))
        .reduce((importFileToImportedNamesMap, importLine) => {
        const [importedNamesPart, importFilePart] = importLine
            .slice(7, -1)
            .trim()
            .split('from');
        const importFileName = importFilePart.split(/['"]/)[1];
        const importedNames = importedNamesPart
            .split(/[{}]/)[1]
            .split(',')
            .map((importedName) => importedName.trim());
        return {
            ...importFileToImportedNamesMap,
            [importFileName]: importFileToImportedNamesMap[importFileName]
                ? lodash_1.default.uniq(lodash_1.default.flatten([...importFileToImportedNamesMap[importFileName], importedNames]))
                : importedNames
        };
    }, {});
    const mergeImportLines = Object.entries(importFileToImportedNamesMap).map(([importFile, importedNames]) => `import { ${importedNames.join(', ')} } from "${importFile}"`);
    return [...nonMergeableImportLines, ...mergeImportLines];
}
exports.default = mergeImports;
//# sourceMappingURL=mergeImports.js.map