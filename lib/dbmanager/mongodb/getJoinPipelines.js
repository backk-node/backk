"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entityAnnotationContainer_1 = __importDefault(require("../../decorators/entity/entityAnnotationContainer"));
function getJoinPipelines(EntityClass, Types) {
    let joinPipelines = [];
    if (entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name]) {
        joinPipelines = entityAnnotationContainer_1.default.entityNameToJoinsMap[EntityClass.name]
            .map((joinSpec) => {
            return [
                { $addFields: { entityIdFieldNameAsString: { $toString: `$${joinSpec.entityIdFieldName}` } } },
                {
                    $lookup: {
                        from: joinSpec.subEntityTableName,
                        localField: 'entityIdFieldNameAsString',
                        foreignField: joinSpec.subEntityForeignIdFieldName,
                        as: joinSpec.asFieldName
                    }
                }
            ];
        })
            .flat();
    }
    return joinPipelines;
}
exports.default = getJoinPipelines;
//# sourceMappingURL=getJoinPipelines.js.map