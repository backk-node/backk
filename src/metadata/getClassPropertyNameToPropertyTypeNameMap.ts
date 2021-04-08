import { getFromContainer, MetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import AbstractDbManager from '../dbmanager/AbstractDbManager';
import { MAX_INT_VALUE } from '../constants/constants';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import isEntityTypeName from '../utils/type/isEntityTypeName';

const classNameToMetadataMap: { [key: string]: { [key: string]: string } } = {};

// noinspection FunctionWithMoreThanThreeNegationsJS
export default function getClassPropertyNameToPropertyTypeNameMap<T>(
  Class: new () => T,
  dbManager?: AbstractDbManager,
  isGeneration = false
): { [key: string]: string } {
  if (!isGeneration && classNameToMetadataMap[Class.name]) {
    return classNameToMetadataMap[Class.name];
  }

  if (!Class.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
    throw new Error(Class.name + ': must match regular expression /^[a-zA-Z_][a-zA-Z0-9_]*$/');
  }

  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');
  const prototypes = [];
  let prototype = Object.getPrototypeOf(new Class());

  while (prototype !== Object.prototype) {
    prototypes.push(prototype);
    prototype = Object.getPrototypeOf(prototype);
  }

  prototypes.reverse();

  prototypes.forEach((prototype) => {
    validationMetadatas.sort(({ target }) => (target === prototype.constructor ? -1 : 0));
  });

  validationMetadatas.reverse();

  const propNameToIsOptionalMap: { [key: string]: boolean } = {};
  const propNameToPropTypeNameMap: { [key: string]: string } = {};
  const propNameToDefaultValueMap: { [key: string]: any } = {};

  const typeObject = new Class();
  Object.entries(typeObject).forEach(([propName, defaultValue]: [string, any]) => {
    propNameToDefaultValueMap[propName] = defaultValue;
  });

  // noinspection FunctionWithMoreThanThreeNegationsJS,FunctionWithMoreThanThreeNegationsJS,OverlyComplexFunctionJS,FunctionTooLongJS
  validationMetadatas.forEach((validationMetadata: ValidationMetadata) => {
    if (!validationMetadata.propertyName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      throw new Error(
        Class.name +
          '.' +
          validationMetadata.propertyName +
          ': must match regular expression /^[a-zA-Z_][a-zA-Z0-9_]*$/'
      );
    }

    const hasDifferentDbManagerGroup = validationMetadata.groups?.find(
      (group) => group.startsWith('DbManager: ') && group !== 'DbManager: ' + dbManager?.getDbManagerType()
    );

    if (hasDifferentDbManagerGroup) {
      return;
    }

    const undefinedValidation = validationMetadatas.find(
      ({ propertyName, type, constraints }: ValidationMetadata) =>
        propertyName === validationMetadata.propertyName &&
        type === 'customValidation' &&
        constraints?.[0] === 'isUndefined'
    );

    if (
      (validationMetadata.type === 'maxLength' ||
        validationMetadata.type === 'length' ||
        validationMetadata.type === 'isString' ||
        validationMetadata.type === 'conditionalValidation' ||
        validationMetadata.type === 'nestedValidation' ||
        (validationMetadata.type === 'customValidation' &&
          validationMetadata.constraints?.[0] === 'isStringOrObjectId')) &&
      !validationMetadata.groups?.includes('__backk_none__')
    ) {
      if (
        (validationMetadata.type === 'maxLength' ||
          validationMetadata.type === 'length' ||
          validationMetadata.type === 'isString' ||
          (validationMetadata.type === 'customValidation' &&
            validationMetadata.constraints?.[0] === 'isStringOrObjectId')) &&
        undefinedValidation &&
        undefinedValidation?.groups?.[0] === '__backk_update__'
      ) {
        if (!validationMetadata.groups?.includes('__backk_firstRoundWhenCreate__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_firstRoundWhenCreate__') ?? [
            '__backk_firstRoundWhenCreate__'
          ];
        }
      } else if (
        (validationMetadata.type === 'maxLength' ||
          validationMetadata.type === 'length' ||
          validationMetadata.type === 'isString' ||
          (validationMetadata.type === 'customValidation' &&
            validationMetadata.constraints?.[0] === 'isStringOrObjectId')) &&
        undefinedValidation &&
        undefinedValidation?.groups?.[0] === '__backk_create__'
      ) {
        if (!validationMetadata.groups?.includes('__backk_firstRoundWhenUpdate__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_firstRoundWhenUpdate__') ?? [
            '__backk_firstRoundWhenUpdate__'
          ];
        }
      } else {
        if (!validationMetadata.groups?.includes('__backk_firstRound__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_firstRound__') ?? [
            '__backk_firstRound__'
          ];
        }
      }
    }

    if (
      validationMetadata.type !== 'arrayMinSize' &&
      validationMetadata.type !== 'arrayMaxSize' &&
      validationMetadata.type !== 'arrayUnique' &&
      (validationMetadata.type !== 'customValidation' ||
        (validationMetadata.type === 'customValidation' &&
          validationMetadata.constraints[0] !== 'isUndefined'))
    ) {
      if (!validationMetadata.groups?.includes('__backk_response__')) {
        validationMetadata.groups = validationMetadata.groups?.concat('__backk_response__') ?? [
          '__backk_response__'
        ];
      }
    }

    if (
      validationMetadata.type !== 'customValidation' ||
      (validationMetadata.type === 'customValidation' && validationMetadata.constraints[0] !== 'isUndefined')
    ) {
      if (undefinedValidation?.groups?.[0] === '__backk_update__' && !undefinedValidation.groups?.[1]) {
        if (!validationMetadata.groups?.includes('__backk_create__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_create__') ?? [
            '__backk_create__'
          ];
        }
      } else if (
        undefinedValidation?.groups?.[0] === '__backk_create__' &&
        !undefinedValidation.groups?.[1]
      ) {
        if (!validationMetadata.groups?.includes('__backk_update__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_update__') ?? [
            '__backk_update__'
          ];
        }
      } else if (
        undefinedValidation?.groups?.[0] === '__backk_create__' &&
        undefinedValidation?.groups?.[1] === '__backk_update__'
      ) {
        if (!validationMetadata.groups?.includes('__backk_none__')) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_none__') ?? [
            '__backk_none__'
          ];
        }
      } else {
        if (
          !validationMetadata.groups?.includes('__backk_none__') &&
          !validationMetadata.groups?.includes('__backk_argument__') &&
          !validationMetadata.groups?.includes('__backk_update__')
        ) {
          validationMetadata.groups = validationMetadata.groups?.concat('__backk_argument__') ?? [
            '__backk_argument__'
          ];
        }
      }
    }

    let isNullable = false;
    if (validationMetadata.type === 'conditionalValidation') {
      if (
        validationMetadata.constraints[1] === 'isOptional' &&
        validationMetadata.groups[0] !== '__backk_update__'
      ) {
        propNameToIsOptionalMap[validationMetadata.propertyName] = true;
      } else if (validationMetadata.constraints[1] === 'isNullable') {
        isNullable = true;
      }
    }

    switch (validationMetadata.type) {
      case 'isNumber':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          'number' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'isString':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          'string' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'isInt':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          'integer' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'isDate':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          'Date' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'customValidation':
        if (validationMetadata.constraints[0] === 'isBigInt') {
          propNameToPropTypeNameMap[validationMetadata.propertyName] =
            'bigint' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        } else if (validationMetadata.constraints[0] === 'isBooleanOrTinyInt') {
          propNameToPropTypeNameMap[validationMetadata.propertyName] =
            'boolean' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        } else if (validationMetadata.constraints[0] === 'isStringOrObjectId') {
          propNameToPropTypeNameMap[validationMetadata.propertyName] =
            'string' + (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        }
        break;
      case 'isIn':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          '(' +
          validationMetadata.constraints[0]
            .map((value: any) => (typeof value === 'string' ? `'${value}'` : `${value}`))
            .join('|') +
          ')' +
          (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'isInstance':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          validationMetadata.constraints[0].name +
          (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '');
        break;
      case 'isArray':
        propNameToPropTypeNameMap[validationMetadata.propertyName] =
          (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '') + '[]';
        break;
    }

    if (isNullable) {
      propNameToPropTypeNameMap[validationMetadata.propertyName] =
        (propNameToPropTypeNameMap[validationMetadata.propertyName] ?? '') + ' | null';
    }

    const hasMatchesValidation = !!validationMetadatas.find(
      ({ propertyName, type }: ValidationMetadata) =>
        propertyName === validationMetadata.propertyName && type === 'matches'
    );

    if (isGeneration && hasMatchesValidation) {
      throw new Error(
        'Property ' +
          Class.name +
          '.' +
          validationMetadata.propertyName +
          ': Use @MaxLengthAndMatches or @MaxLengthAndMatchesAll instead of @Matches'
      );
    }

    if (validationMetadata.type === 'isArray') {
      const arrayMaxSizeValidationMetadata = validationMetadatas.find(
        (otherValidationMetadata: ValidationMetadata) =>
          otherValidationMetadata.propertyName === validationMetadata.propertyName &&
          otherValidationMetadata.type === 'arrayMaxSize'
      );

      const arrayMinSizeValidationMetadata = validationMetadatas.find(
        (otherValidationMetadata: ValidationMetadata) =>
          otherValidationMetadata.propertyName === validationMetadata.propertyName &&
          otherValidationMetadata.type === 'arrayMinSize'
      );

      const undefinedValidation = validationMetadatas.find(
        ({ propertyName, type, constraints }: ValidationMetadata) =>
          propertyName === validationMetadata.propertyName &&
          type === 'customValidation' &&
          constraints?.[0] === 'isUndefined'
      );

      if (!undefinedValidation && !arrayMaxSizeValidationMetadata) {
        throw new Error(
          'Property ' +
            Class.name +
            '.' +
            validationMetadata.propertyName +
            ' has array type and must have @ArrayMaxSize annotation'
        );
      }

      if (!undefinedValidation && !arrayMinSizeValidationMetadata) {
        throw new Error(
          'Property ' +
            Class.name +
            '.' +
            validationMetadata.propertyName +
            ' has array type and must have @ArrayMinSize annotation'
        );
      }

      const instanceValidationMetadata = validationMetadatas.find(
        (otherValidationMetadata: ValidationMetadata) =>
          otherValidationMetadata.propertyName === validationMetadata.propertyName &&
          otherValidationMetadata.type === 'isInstance'
      );

      const isOneToMany = typePropertyAnnotationContainer.isTypePropertyOneToMany(
        Class,
        validationMetadata.propertyName
      );

      const isManyToMany = typePropertyAnnotationContainer.isTypePropertyManyToMany(
        Class,
        validationMetadata.propertyName
      );

      const isReferenceToExternalEntity = typePropertyAnnotationContainer.isTypePropertyExternalServiceEntity(
        Class,
        validationMetadata.propertyName
      );

      if (instanceValidationMetadata && !isOneToMany && !isManyToMany && isEntityTypeName(Class.name)) {
        throw new Error(
          'Property ' +
            Class.name +
            '.' +
            validationMetadata.propertyName +
            ' must have @OneToMany(true/false) or @ManyToMany() annotation. If you want ManyToOne relationship, use these 3 annotations: @ArrayMinSize(1), @ArrayMaxSize(1) and @ManyToMany. If this relationship is a reference to external entity (ie. join to external table), use annotation: @OneToMany(true)'
        );
      }

      if (
        instanceValidationMetadata &&
        isOneToMany &&
        isReferenceToExternalEntity &&
        !undefinedValidation &&
        isEntityTypeName(Class.name)
      ) {
        throw new Error(
          'Property ' +
            Class.name +
            '.' +
            validationMetadata.propertyName +
            ' must be declared to readonly, because it is a reference to external entity and cannot be modified by this service'
        );
      }
    }

    if (isGeneration) {
      if (
        validationMetadata.type === 'isInt' ||
        validationMetadata.type === 'isNumber' ||
        (validationMetadata.type === 'customValidation' && validationMetadata.constraints[0] === 'isBigInt')
      ) {
        const minValidationMetadata = validationMetadatas.find(
          (otherValidationMetadata: ValidationMetadata) =>
            otherValidationMetadata.propertyName === validationMetadata.propertyName &&
            otherValidationMetadata.type === 'min'
        );

        const maxValidationMetadata = validationMetadatas.find(
          (otherValidationMetadata: ValidationMetadata) =>
            otherValidationMetadata.propertyName === validationMetadata.propertyName &&
            otherValidationMetadata.type === 'max'
        );

        const minMaxValidationMetadata = validationMetadatas.find(
          (otherValidationMetadata: ValidationMetadata) =>
            otherValidationMetadata.propertyName === validationMetadata.propertyName &&
            otherValidationMetadata.type === 'customValidation' &&
            otherValidationMetadata.constraints[0] === 'minMax'
        );

        if (
          !minMaxValidationMetadata &&
          (minValidationMetadata === undefined || maxValidationMetadata === undefined)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' has numeric type and must have @Min and @Max annotations or @MinMax annotation'
          );
        }

        if (
          minValidationMetadata?.constraints[0] > maxValidationMetadata?.constraints[0] ||
          minMaxValidationMetadata?.constraints[1] > minMaxValidationMetadata?.constraints[2]
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' has @Min validation that is greater than @Max validation'
          );
        }

        if (
          validationMetadata.type === 'isInt' &&
          (minValidationMetadata?.constraints[0] < -2147483648 ||
            minMaxValidationMetadata?.constraints[1] < -2147483648)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' has @Min validation value must be equal or greater than -2147483648'
          );
        }

        if (
          validationMetadata.type === 'isInt' &&
          (maxValidationMetadata?.constraints[0] > MAX_INT_VALUE ||
            minMaxValidationMetadata?.constraints[2] > MAX_INT_VALUE)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' @Max validation value must be equal or less than 2147483647'
          );
        }

        if (
          validationMetadata.type === 'customValidation' &&
          validationMetadata.constraints[0] === 'isBigInt' &&
          (minValidationMetadata?.constraints[0] < Number.MIN_SAFE_INTEGER ||
            minMaxValidationMetadata?.constraints[1] < Number.MIN_SAFE_INTEGER)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' has @Min validation value must be equal or greater than ' +
              Number.MIN_SAFE_INTEGER.toString()
          );
        }

        if (
          validationMetadata.type === 'customValidation' &&
          validationMetadata.constraints[0] === 'isBigInt' &&
          (maxValidationMetadata?.constraints[0] > Number.MAX_SAFE_INTEGER ||
            minMaxValidationMetadata?.constraints[2] > Number.MAX_SAFE_INTEGER)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' @Max validation value must be equal or less than ' +
              Number.MAX_SAFE_INTEGER
          );
        }

        if (
          validationMetadata.type === 'isNumber' &&
          (minValidationMetadata?.constraints[0] < -(10 ** 308) ||
            minMaxValidationMetadata?.constraints[1] < -(10 ** 308))
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' @Min validation value must be equal or greater than -1E308'
          );
        }

        if (
          validationMetadata.type === 'isNumber' &&
          (maxValidationMetadata?.constraints[0] > 10 ** 308 ||
            minMaxValidationMetadata?.constraints[2] > 10 ** 308)
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' @Max validation value must be equal or less than 1E308'
          );
        }
      }

      if (validationMetadata.type === 'isString') {
        const hasMaxLengthValidation = !!validationMetadatas.find(
          ({ propertyName, type }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && type === 'maxLength'
        );

        const hasLengthValidation = !!validationMetadatas.find(
          ({ type, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && type === 'length'
        );

        const hasMaxLengthAndMatchesValidation = !!validationMetadatas.find(
          ({ constraints, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && constraints?.[0] === 'maxLengthAndMatches'
        );

        const hasMaxLengthAndMatchesAllValidation = !!validationMetadatas.find(
          ({ constraints, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && constraints?.[0] === 'maxLengthAndMatchesAll'
        );

        const hasLengthAndMatchesValidation = !!validationMetadatas.find(
          ({ constraints, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && constraints?.[0] === 'lengthAndMatches'
        );

        const hasLengthAndMatchesAllValidation = !!validationMetadatas.find(
          ({ constraints, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && constraints?.[0] === 'lengthAndMatchesAll'
        );

        const hasStrongPasswordValidation = !!validationMetadatas.find(
          ({ constraints, propertyName }: ValidationMetadata) =>
            propertyName === validationMetadata.propertyName && constraints?.[0] === 'isStrongPassword'
        );

        if (
          !hasMaxLengthValidation &&
          !hasMaxLengthAndMatchesValidation &&
          !hasMaxLengthAndMatchesAllValidation &&
          !hasLengthValidation &&
          !hasLengthAndMatchesValidation &&
          !hasLengthAndMatchesAllValidation &&
          !hasStrongPasswordValidation
        ) {
          throw new Error(
            'Property ' +
              Class.name +
              '.' +
              validationMetadata.propertyName +
              ' has string type and must have either @Length, @MaxLength, @MaxLengthAndMatches or @MaxLengthAndMatchesAll annotation'
          );
        }
      }
    }
  });

  const metadata = Object.entries(propNameToPropTypeNameMap).reduce(
    (accumulatedTypeObject, [propName, propTypeName]) => {
      let finalPropType = propTypeName;
      if (propNameToIsOptionalMap[propName] && propTypeName.includes(' | null') && propTypeName[0] !== '(') {
        finalPropType = '(' + propTypeName + ')';
      }
      return {
        ...accumulatedTypeObject,
        [propName]:
          (propNameToIsOptionalMap[propName] ? '?' + finalPropType : finalPropType) +
          (propNameToDefaultValueMap[propName] === undefined
            ? ''
            : ` = ${JSON.stringify(propNameToDefaultValueMap[propName])}`)
      };
    },
    {}
  );

  if (!classNameToMetadataMap[Class.name]) {
    classNameToMetadataMap[Class.name] = metadata;
  }

  return metadata;
}
