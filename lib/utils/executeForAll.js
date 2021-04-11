"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function executeForAll(values, func) {
    const finalValues = Array.isArray(values) ? values : [values];
    const possibleError = await finalValues.reduce(async (possibleErrorPromise, value) => {
        const possibleError = await possibleErrorPromise;
        if (possibleError) {
            return possibleError;
        }
        const [, error] = await func(value);
        return error;
    }, Promise.resolve(null));
    return [null, possibleError];
}
exports.default = executeForAll;
//# sourceMappingURL=executeForAll.js.map