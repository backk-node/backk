"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSqlColumnFromProjection(projection) {
    const leftSideOfAs = projection.split(' AS ')[0];
    if (leftSideOfAs.startsWith('CAST(')) {
        return leftSideOfAs.slice(5);
    }
    return leftSideOfAs;
}
exports.default = getSqlColumnFromProjection;
//# sourceMappingURL=getSqlColumnFromProjection.js.map