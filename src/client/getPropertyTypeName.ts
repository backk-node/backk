export default function getPropertyTypeName(classProperty: any, enumValues: any[]) {
  if (enumValues) {
    const numericValue = parseFloat(enumValues[0]);
    if (!isNaN(numericValue)) {
      return  numericValue;
    }
    return "'" + enumValues[0] +  "'";
  }
  else if (
    classProperty.typeAnnotation.typeAnnotation.type === 'TSStringKeyword' ||
    classProperty.typeAnnotation.typeAnnotation.type === 'TSNumberKeyword' ||
    classProperty.typeAnnotation.typeAnnotation.type === 'TSBooleanKeyword'
  ) {
    return classProperty.typeAnnotation.typeAnnotation.type;
  } else if (
    classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
    (classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSStringKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSNumberKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSBooleanKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSNullKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSUndefinedKeyword')
  ) {
    return classProperty.typeAnnotation.typeAnnotation.types[0].type;
  } else if ( classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
    classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSTypeReference') {
    return classProperty.typeAnnotation.typeAnnotation.types[0].typeName.name;
  } else if (classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
    classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSArrayType') {
    if (classProperty.typeAnnotation.typeAnnotation.types[0].elementType.type === 'TSStringKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].elementType.type === 'TSNumberKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.types[0].elementType.type === 'TSBooleanKeyword') {
      return classProperty.typeAnnotation.typeAnnotation.types[0].elementType.type + '[]';
    }
    return classProperty.typeAnnotation.typeAnnotation.types[0].elementType.typeName.name + '[]';
  } else if (
    classProperty.typeAnnotation.typeAnnotation.type === 'TSUnionType' &&
    classProperty.typeAnnotation.typeAnnotation.types[0].type === 'TSLiteralType'
  ) {
    const literalValue = classProperty.typeAnnotation.typeAnnotation.types[0].literal.value;
    const numericValue = parseFloat(literalValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
    return "'" + literalValue + "'";
  } else if (classProperty.typeAnnotation.typeAnnotation.typeName?.name) {
    return classProperty.typeAnnotation.typeAnnotation.typeName.name;
  } else if (classProperty.typeAnnotation.typeAnnotation.type === 'TSArrayType') {
    if (
      classProperty.typeAnnotation.typeAnnotation.elementType.type === 'TSStringKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.elementType.type === 'TSNumberKeyword' ||
      classProperty.typeAnnotation.typeAnnotation.elementType.type === 'TSBooleanKeyword'
    ) {
      return classProperty.typeAnnotation.typeAnnotation.elementType.type + '[]';
    }  else if (
      classProperty.typeAnnotation.typeAnnotation.elementType.type === 'TSParenthesizedType' &&
      classProperty.typeAnnotation.typeAnnotation.elementType.typeAnnotation.types[0].type === 'TSLiteralType'
    ) {
      const literalValue = classProperty.typeAnnotation.typeAnnotation.elementType.typeAnnotation.types[0].literal.value;
      const numericValue = parseFloat(literalValue);
      if (!isNaN(numericValue)) {
        return numericValue + '[]';
      }
      return "'" + literalValue + "'" + '[]';
    } else if (classProperty.typeAnnotation.typeAnnotation.elementType.typeName.name) {
      return classProperty.typeAnnotation.typeAnnotation.elementType.typeName.name + '[]';
    }
  }
}
