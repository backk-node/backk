"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSubEntitiesByAction(newSubEntities, currentSubEntities) {
    const subEntitiesToDelete = currentSubEntities.filter((currentSubEntity) => !newSubEntities.some((newSubEntity) => currentSubEntity.id === newSubEntity.id));
    const subEntitiesToAdd = newSubEntities.filter((newSubEntity) => !currentSubEntities.some((currentSubEntity) => currentSubEntity.id === newSubEntity.id));
    const subEntitiesToUpdate = newSubEntities.filter((newSubEntity) => currentSubEntities.some((currentSubEntity) => currentSubEntity.id === newSubEntity.id));
    return {
        subEntitiesToAdd,
        subEntitiesToDelete,
        subEntitiesToUpdate
    };
}
exports.default = getSubEntitiesByAction;
//# sourceMappingURL=getSubEntitiesByAction.js.map