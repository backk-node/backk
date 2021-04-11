"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function replaceFieldPathNames(fields, wantedSubEntityPath) {
    var _a;
    return ((_a = fields === null || fields === void 0 ? void 0 : fields.filter((field) => {
        return field.startsWith(wantedSubEntityPath);
    }).map((field) => {
        let [, fieldPathPostFix] = field.split(wantedSubEntityPath);
        if (fieldPathPostFix[0] === '.') {
            fieldPathPostFix = fieldPathPostFix.slice(1);
        }
        return fieldPathPostFix;
    })) !== null && _a !== void 0 ? _a : []);
}
exports.default = replaceFieldPathNames;
//# sourceMappingURL=replaceFieldPathNames.js.map