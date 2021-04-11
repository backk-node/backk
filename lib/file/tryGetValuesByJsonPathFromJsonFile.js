"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const jsonpath_plus_1 = require("jsonpath-plus");
function tryGetValuesByJsonPathFromJsonFile(filePathName, jsonPath) {
    const object = JSON.parse(fs_1.readFileSync(filePathName, { encoding: 'UTF-8' }));
    return jsonpath_plus_1.JSONPath({ json: object, path: jsonPath });
}
exports.default = tryGetValuesByJsonPathFromJsonFile;
//# sourceMappingURL=tryGetValuesByJsonPathFromJsonFile.js.map