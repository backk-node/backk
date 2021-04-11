"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function forEachAsyncParallel(array, callback) {
    await Promise.all(array.map(callback));
}
exports.default = forEachAsyncParallel;
//# sourceMappingURL=forEachAsyncParallel.js.map