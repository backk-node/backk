import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';

export default function getFieldOrdering(EntityClass: new () => any) {
  const entityPropertyNameToEntityPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(
    EntityClass
  );

  const newRoot = Object.keys(entityPropertyNameToEntityPropertyTypeNameMap).reduce(
    (defaultIncludeFieldsMap, propertyName) => ({
      ...defaultIncludeFieldsMap,
      [propertyName]: `$${propertyName}`
    }),
    {}
  );

  return {
    $replaceRoot: {
      newRoot
    }
  };
}
