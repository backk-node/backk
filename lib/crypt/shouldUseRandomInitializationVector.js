"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shouldUseRandomInitializationVector(propertyName) {
    const lowerCasePropertyName = propertyName.toLowerCase();
    return !(lowerCasePropertyName === 'user' ||
        lowerCasePropertyName.includes('username') ||
        lowerCasePropertyName.includes('user_name'));
}
exports.default = shouldUseRandomInitializationVector;
//# sourceMappingURL=shouldUseRandomInitializationVector.js.map