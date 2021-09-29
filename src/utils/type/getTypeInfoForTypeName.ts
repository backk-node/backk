// noinspection OverlyComplexFunctionJS,FunctionTooLongJS
export default function getTypeInfoForTypeName(typeName: string) {
  let canBeError = false;

  if (typeName.startsWith('PromiseErrorOr<')) {
    canBeError = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(15, -1);
  }

  let isManyOf = false;
  let isArrayType = false;

  if (typeName.startsWith('Many<')) {
    canBeError = true;
    isManyOf = true;
    isArrayType = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(5, -1);
  }

  let isOneOf = false;

  if (typeName.startsWith('One<')) {
    canBeError = true;
    isOneOf = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(4, -1);
  }

  const isOptionalType = typeName.startsWith('?');
  // noinspection AssignmentToFunctionParameterJS
  typeName = isOptionalType ? typeName.slice(1) : typeName;
  if (typeName.startsWith('(') && typeName.endsWith(')') && typeName.includes(' | null')) {
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(1, -1);
  }

  let defaultValueStr;
  [typeName, defaultValueStr] = typeName.split(' = ');

  if (typeName.endsWith('[]')) {
    isArrayType = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(0, -2);
  } else if (typeName.startsWith('Array<')) {
    isArrayType = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.slice(6, -1);
  }

  let isNullableType = false;
  if (typeName.endsWith(' | null')) {
    isNullableType = true;
    // noinspection AssignmentToFunctionParameterJS
    typeName = typeName.split(' | null')[0];
  }

  if (typeName.endsWith('[]') || typeName.startsWith('Array<')) {
    if (isNullableType) {
      throw new Error(
        'Array type union with null type is not allowed, use empty array to denote a missing value.'
      );
    } else if (isArrayType) {
      throw new Error('Multi-dimensional types not allowed');
    }
  }

  return {
    baseTypeName: typeName,
    isNull: typeName === 'null',
    canBeError,
    defaultValueStr,
    isArrayType,
    isNullableType,
    isOptionalType,
    isManyOf,
    isOneOf
  };
}
