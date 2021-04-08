import getClassPropertyNameToPropertyTypeNameMap from '../../metadata/getClassPropertyNameToPropertyTypeNameMap';

export default function getDefaultIncludeFieldsMap(EntityClass: new () => any) {
  const entityPropertyNameToEntityPropertyTypeNameMap = getClassPropertyNameToPropertyTypeNameMap(
    EntityClass
  );

  return Object.keys(entityPropertyNameToEntityPropertyTypeNameMap).reduce(
    (defaultIncludeFieldsMap, propertyName) => ({
      ...defaultIncludeFieldsMap,
      [propertyName]: 1
    }),
    {}
  );
}
