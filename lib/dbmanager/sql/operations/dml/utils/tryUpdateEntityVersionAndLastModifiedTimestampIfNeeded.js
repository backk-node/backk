"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded(dbManager, currentEntity, EntityClass) {
    if ('version' in currentEntity || 'lastModifiedTimestamp' in currentEntity) {
        const [, error] = await dbManager.updateEntity(EntityClass, {
            _id: currentEntity._id
        });
        if (error) {
            throw error;
        }
    }
}
exports.default = tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded;
//# sourceMappingURL=tryUpdateEntityVersionAndLastModifiedTimestampIfNeeded.js.map