"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
function tryGetRowsFromCsvFile(filePathName, columnNames = 'readFromFirstRow', delimiter = ',') {
    return sync_1.default(fs_1.readFileSync(filePathName, { encoding: 'UTF-8' }), {
        columns: columnNames === 'readFromFirstRow' ? true : columnNames,
        skip_empty_lines: true,
        trim: true,
        delimiter
    });
}
exports.default = tryGetRowsFromCsvFile;
//# sourceMappingURL=tryGetRowsFromCsvFile.js.map