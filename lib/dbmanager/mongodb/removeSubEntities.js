"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeSubEntities(entity, subEntities) {
    Object.entries(entity).forEach(([propertyName, propertyValueOrValues]) => {
        if (Array.isArray(propertyValueOrValues) &&
            propertyValueOrValues.length > 0) {
            entity[propertyName] = propertyValueOrValues.filter((propertyValue) => !subEntities.find((subEntity) => subEntity === propertyValue));
        }
        if (typeof propertyValueOrValues === 'object' && propertyValueOrValues !== null) {
            if (Array.isArray(propertyValueOrValues) &&
                propertyValueOrValues.length > 0 &&
                typeof propertyValueOrValues[0] === 'object') {
                propertyValueOrValues.forEach((propertyValue) => removeSubEntities(propertyValue, subEntities));
            }
            else {
                removeSubEntities(propertyValueOrValues, subEntities);
            }
        }
    });
}
exports.default = removeSubEntities;
//# sourceMappingURL=removeSubEntities.js.map