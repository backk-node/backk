"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const xmldom_1 = __importDefault(require("xmldom"));
const xpath_1 = __importDefault(require("xpath"));
function tryGetValuesByXPathFromXmlFile(filePathName, xPath) {
    const document = new xmldom_1.default.DOMParser().parseFromString(fs_1.readFileSync(filePathName, { encoding: 'UTF-8' }));
    return xpath_1.default.select(xPath, document);
}
exports.default = tryGetValuesByXPathFromXmlFile;
//# sourceMappingURL=tryGetValuesByXPathFromXmlFile.js.map