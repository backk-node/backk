import entityAnnotationContainer, {
  EntityJoinSpec,
  ManyToManyRelationTableSpec
} from '../../../../../decorators/entity/entityAnnotationContainer';
import typePropertyAnnotationContainer from '../../../../../decorators/typeproperty/typePropertyAnnotationContainer';
import { doesClassPropertyContainCustomValidation } from '../../../../../validation/setClassPropertyValidationDecorators';
import getSingularName from '../../../../../utils/getSingularName';

export default function setSubEntityInfo(
  entityName: string,
  EntityClass: Function,
  fieldName: string,
  subEntityName: string,
  isArrayType: boolean
) {
  let tableName = entityName;

  if (entityAnnotationContainer.entityNameToTableNameMap[entityName]) {
    tableName = entityAnnotationContainer.entityNameToTableNameMap[entityName];
  }

  if (typePropertyAnnotationContainer.isTypePropertyManyToMany(EntityClass, fieldName)) {
    const manyToManyRelationTableSpec: ManyToManyRelationTableSpec = {
      entityName,
      subEntityName,
      entityFieldName: fieldName,
      associationTableName: entityName + '_' + getSingularName(fieldName),
      entityForeignIdFieldName: tableName.charAt(0).toLowerCase() + tableName.slice(1) + 'Id',
      subEntityForeignIdFieldName: subEntityName.charAt(0).toLowerCase() + subEntityName.slice(1) + 'Id'
    };

    entityAnnotationContainer.manyToManyRelationTableSpecs.push(manyToManyRelationTableSpec);
  } else {
    const subEntityForeignIdFieldName = tableName.charAt(0).toLowerCase() + tableName.slice(1) + 'Id';

    if (entityAnnotationContainer.entityNameToForeignIdFieldNamesMap[subEntityName]) {
      entityAnnotationContainer.entityNameToForeignIdFieldNamesMap[subEntityName].push(
        subEntityForeignIdFieldName
      );
    } else {
      entityAnnotationContainer.entityNameToForeignIdFieldNamesMap[subEntityName] = [
        subEntityForeignIdFieldName
      ];
    }

    entityAnnotationContainer.entityNameToIsArrayMap[subEntityName] = isArrayType;

    const isReadonly =
      doesClassPropertyContainCustomValidation(EntityClass, fieldName, 'isUndefined') &&
      typePropertyAnnotationContainer.isTypePropertyOneToMany(EntityClass, fieldName) &&
      typePropertyAnnotationContainer.isTypePropertyExternalServiceEntity(EntityClass, fieldName);

    const entityJoinSpec: EntityJoinSpec = {
      entityFieldName: fieldName,
      subEntityTableName: subEntityName,
      entityIdFieldName: '_id',
      subEntityForeignIdFieldName,
      isReadonly
    };

    if (entityAnnotationContainer.entityNameToJoinsMap[entityName]) {
      entityAnnotationContainer.entityNameToJoinsMap[entityName].push(entityJoinSpec);
    } else {
      entityAnnotationContainer.entityNameToJoinsMap[entityName] = [entityJoinSpec];
    }
  }
}
