"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSingularName(name) {
    if (name.endsWith('ses')) {
        return name.slice(0, -2);
    }
    else if (name.endsWith('s')) {
        return name.slice(0, -1);
    }
    return name;
}
exports.default = getSingularName;
//# sourceMappingURL=getSingularName.js.map