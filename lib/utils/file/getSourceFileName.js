"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSourceFileName(fileName, distFolderName = 'dist') {
    return fileName.replace(distFolderName, 'src');
}
exports.default = getSourceFileName;
//# sourceMappingURL=getSourceFileName.js.map