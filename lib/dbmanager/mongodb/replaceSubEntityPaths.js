"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function replaceSubEntityPaths(operations, wantedSubEntityPath) {
    var _a;
    return ((_a = operations === null || operations === void 0 ? void 0 : operations.filter((operation) => {
        return operation.subEntityPath === wantedSubEntityPath || operation.subEntityPath === '*';
    }).map((operation) => {
        var _a;
        let newSubEntityPath = operation.subEntityPath;
        if (operation.subEntityPath !== '*') {
            [, newSubEntityPath] = ((_a = operation.subEntityPath) !== null && _a !== void 0 ? _a : '').split(wantedSubEntityPath);
            if ((newSubEntityPath === null || newSubEntityPath === void 0 ? void 0 : newSubEntityPath[0]) === '.') {
                newSubEntityPath = newSubEntityPath.slice(1);
            }
        }
        return {
            ...operation,
            subEntityPath: newSubEntityPath
        };
    })) !== null && _a !== void 0 ? _a : []);
}
exports.default = replaceSubEntityPaths;
//# sourceMappingURL=replaceSubEntityPaths.js.map