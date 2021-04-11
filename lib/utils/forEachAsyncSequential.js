"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function forEachAsyncSequential(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
exports.default = forEachAsyncSequential;
//# sourceMappingURL=forEachAsyncSequential.js.map