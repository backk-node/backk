import entityAnnotationContainer from "../../decorators/entity/entityAnnotationContainer";

export default function getJoinPipelines(EntityClass: Function, Types: object) {
  let joinPipelines: any[] = [];

  if (entityAnnotationContainer.entityNameToJoinsMap[EntityClass.name]) {
    joinPipelines = entityAnnotationContainer.entityNameToJoinsMap[EntityClass.name]
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
