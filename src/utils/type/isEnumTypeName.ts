import parseEnumValuesFromSrcFile from '../../typescript/parser/parseEnumValuesFromSrcFile';
import entityAnnotationContainer from "../../decorators/entity/entityAnnotationContainer";

export default function isEnumTypeName(typeName: string): boolean {
  return (
    typeName[0] === '(' ||
    (typeName[0] === typeName[0].toUpperCase() &&
      typeName !== 'Date' &&
      !entityAnnotationContainer.entityNameToClassMap[typeName] &&
      parseEnumValuesFromSrcFile(typeName).length > 0)
  );
}
