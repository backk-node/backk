"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function findAsyncSequential(values, predicate) {
    for (const value of values) {
        if (await predicate(value)) {
            return value;
        }
    }
    return undefined;
}
exports.default = findAsyncSequential;
//# sourceMappingURL=findAsyncSequential.js.map