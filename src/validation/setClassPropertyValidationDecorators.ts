import { parseSync } from '@babel/core';
import { getFromContainer, MetadataStorage, ValidationTypes, Validator } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { ValidationMetadataArgs } from 'class-validator/metadata/ValidationMetadataArgs';
import { readFileSync } from 'fs';
import getSrcFilePathNameForTypeName, {
  hasBackkSrcFilenameForTypeName,
  hasSrcFilenameForTypeName
} from '../utils/file/getSrcFilePathNameForTypeName';
import getTypeInfoForTypeName from '../utils/type/getTypeInfoForTypeName';
import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';
import { customDecoratorNameToTestValueMap } from '../decorators/registerCustomDecorator';
import getValidationConstraint from './getValidationConstraint';

export function getPropertyValidationOfType(
  typeClass: Function,
  propertyName: string,
  validationType: string
) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(typeClass, '');

  return validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName && validationMetadata.type === validationType
  );
}

function doesPropertyContainValidation(typeClass: Function, propertyName: string, validationType: string) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(typeClass, '');

  const foundValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName && validationMetadata.type === validationType
  );

  return foundValidation !== undefined;
}

export function getClassPropertyCustomValidationTestValue(Class: Function, propertyName: string) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');

  const foundCustomValidationWithTestValue = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      customDecoratorNameToTestValueMap[validationMetadata.constraints[0]]
  );

  return foundCustomValidationWithTestValue
    ? customDecoratorNameToTestValueMap[foundCustomValidationWithTestValue.constraints[0]]
    : undefined;
}

export function doesClassPropertyContainCustomValidation(
  Class: Function,
  propertyName: string,
  validationType: string,
  disregardFirstGroup?: string,
  group?: string
) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');

  const foundValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === validationType &&
      (!disregardFirstGroup ||
        (disregardFirstGroup && validationMetadata.groups[0] !== disregardFirstGroup)) &&
      (!group || (group && validationMetadata.groups.includes(group)))
  );

  return foundValidation !== undefined;
}

// noinspection FunctionWithMultipleLoopsJS,OverlyComplexFunctionJS,FunctionTooLongJS,FunctionWithMoreThanThreeNegationsJS
export default function setClassPropertyValidationDecorators(
  Class: Function,
  serviceName: string,
  Types: { [key: string]: new () => any },
  remoteServiceRootDir = ''
) {
  const className = Class.name;

  if (hasBackkSrcFilenameForTypeName(className)) {
    return;
  }

  const fileContentsStr = readFileSync(getSrcFilePathNameForTypeName(className, remoteServiceRootDir), {
    encoding: 'UTF-8'
  });

  const fileRows = fileContentsStr.split('\n');

  const ast = parseSync(fileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (
      (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportNamedDeclaration') &&
      node.declaration.type === 'ClassDeclaration' &&
      node.declaration.id.name === className
    ) {
      for (const classBodyNode of node.declaration.body.body) {
        if (classBodyNode.type === 'ClassProperty') {
          const propertyName = classBodyNode.key.name;
          let baseTypeName: string;
          let propertyTypeName;
          let isNullableType = false;
          let isArrayType = false;
          const documentation = classBodyNode.leadingComments?.[0].value;

          if (documentation) {
            typePropertyAnnotationContainer.addDocumentationForTypeProperty(
              Class,
              propertyName,
              documentation
            );
          }

          const isPrivateProperty = classBodyNode.accessibility !== 'public';

          if (
            isPrivateProperty &&
            entityAnnotationContainer.isEntity(Class) &&
            !typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName)
          ) {
            throw new Error(
              Class.name +
                '.' +
                propertyName +
                " is a private property and it must be decorated with @Private() annotation. Or if the property should be public, denote it with a 'public' keyword"
            );
          }

          if (isPrivateProperty && entityAnnotationContainer.isEntity(Class)) {
            const validationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CUSTOM_VALIDATION,
              target: Class,
              propertyName,
              constraints: ['isUndefined'],
              validationOptions: { each: isArrayType }
            };

            const validationMetadata = new ValidationMetadata(validationMetadataArgs);
            validationMetadata.groups = ['__backk_update__'];
            getFromContainer(MetadataStorage).addValidationMetadata(validationMetadata);
          }

          if (classBodyNode.readonly && entityAnnotationContainer.isEntity(Class)) {
            const validationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CUSTOM_VALIDATION,
              target: Class,
              propertyName,
              constraints: ['isUndefined'],
              validationOptions: { each: isArrayType }
            };

            const validationMetadata = new ValidationMetadata(validationMetadataArgs);

            if (propertyName === '_id') {
              validationMetadata.groups = ['__backk_create__'];
            } else {
              validationMetadata.groups = ['__backk_create__', '__backk_update__'];
            }

            getFromContainer(MetadataStorage).addValidationMetadata(validationMetadata);
          }

          if (classBodyNode.typeAnnotation === undefined) {
            if (typeof classBodyNode.value?.value === 'number') {
              propertyTypeName = 'number';
              baseTypeName = 'number';
            } else if (typeof classBodyNode.value?.value === 'boolean') {
              propertyTypeName = 'boolean';
              baseTypeName = 'boolean';
            } else if (typeof classBodyNode.value?.value === 'string') {
              propertyTypeName = 'string';
              baseTypeName = 'string';
            } else if (
              typeof classBodyNode.value?.value === 'object' ||
              typeof classBodyNode.value?.value === 'bigint' ||
              typeof classBodyNode.value?.value === 'symbol'
            ) {
              throw new Error(
                'Default value must a scalar (number, boolean or string) for property: ' +
                  propertyName +
                  ' in ' +
                  Class.name
              );
            } else {
              throw new Error('Missing type annotation for property: ' + propertyName + ' in ' + Class.name);
            }
          } else {
            const propertyTypeNameStart = classBodyNode.typeAnnotation.loc.start;
            const propertyTypeNameEnd = classBodyNode.typeAnnotation.loc.end;

            propertyTypeName = fileRows[propertyTypeNameStart.line - 1].slice(
              propertyTypeNameStart.column + 2,
              propertyTypeNameEnd.column
            );

            ({ baseTypeName, isArrayType, isNullableType } = getTypeInfoForTypeName(propertyTypeName));
          }

          let validationType;
          let constraints;
          const isExternalId = typePropertyAnnotationContainer.isTypePropertyExternalId(Class, propertyName);

          if (
            propertyName === '_id' ||
            propertyName === 'id' ||
            (propertyName.endsWith('Id') && !isExternalId) ||
            (propertyName.endsWith('Ids') && !isExternalId)
          ) {
            if (!doesClassPropertyContainCustomValidation(Class, propertyName, 'maxLengthAndMatches')) {
              const validationMetadataArgs: ValidationMetadataArgs = {
                type: ValidationTypes.CUSTOM_VALIDATION,
                target: Class,
                propertyName,
                constraints: ['maxLengthAndMatches', 24, /^[a-f\d]{1,24}$/],
                validationOptions: { each: isArrayType }
              };

              getFromContainer(MetadataStorage).addValidationMetadata(
                new ValidationMetadata(validationMetadataArgs)
              );
            }
          }

          // noinspection IfStatementWithTooManyBranchesJS
          if (baseTypeName === 'boolean') {
            const validationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CUSTOM_VALIDATION,
              target: Class,
              propertyName,
              constraints: ['isBooleanOrTinyInt'],
              validationOptions: { each: isArrayType }
            };

            getFromContainer(MetadataStorage).addValidationMetadata(
              new ValidationMetadata(validationMetadataArgs)
            );
          } else if (baseTypeName === 'number') {
            if (
              isArrayType &&
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.ARRAY_UNIQUE) &&
              !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')
            ) {
              throw new Error(
                Class.name +
                  '.' +
                  propertyName +
                  ' must have either @ArrayUnique() or @ArrayNotUnique() annotation'
              );
            }

            if (
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_INT) &&
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_NUMBER) &&
              !doesClassPropertyContainCustomValidation(Class, propertyName, 'isBigInt')
            ) {
              throw new Error(
                Class.name +
                '.' +
                propertyName +
                ' must have either @IsInt(), @IsFloat() or @IsBigInt() annotation'
              );
            }
          } else if (baseTypeName === 'string') {
            if (
              isArrayType &&
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.ARRAY_UNIQUE) &&
              !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')
            ) {
              throw new Error(
                Class.name +
                  '.' +
                  propertyName +
                  ' must have either @ArrayUnique() or @ArrayNotUnique() annotation'
              );
            }

            let maxLength: number | undefined;

            // noinspection IfStatementWithTooManyBranchesJS
            if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_BOOLEAN_STRING)) {
              maxLength = 5;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isBIC')) {
              maxLength = 11;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isBtcAddress')) {
              maxLength = 35;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_CREDIT_CARD)) {
              maxLength = 19;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_DATE_STRING)) {
              maxLength = 64;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isEAN')) {
              maxLength = 13;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_EMAIL)) {
              maxLength = 320;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isEthereumAddress')) {
              maxLength = 42;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isHSL')) {
              maxLength = 64;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_HEX_COLOR)) {
              maxLength = 7;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ISIN)) {
              maxLength = 12;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isIBAN')) {
              maxLength = 42;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_IP)) {
              let ipValidationConstraint = getValidationConstraint(
                Class,
                propertyName,
                ValidationTypes.IS_IP
              );

              if (typeof ipValidationConstraint === 'string') {
                ipValidationConstraint = parseInt(ipValidationConstraint, 10);
              }

              maxLength = ipValidationConstraint === 4 ? 15 : 39;
            } else if (
              doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ISO31661_ALPHA_2)
            ) {
              maxLength = 2;
            } else if (
              doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ISO31661_ALPHA_3)
            ) {
              maxLength = 3;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ISO8601)) {
              maxLength = 64;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isISRC')) {
              maxLength = 15;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ISSN)) {
              maxLength = 9;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_JWT)) {
              maxLength = 8192;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isLocale')) {
              maxLength = 5;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_MAC_ADDRESS)) {
              maxLength = 17;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_MILITARY_TIME)) {
              maxLength = 5;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isMimeType')) {
              maxLength = 64;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_PORT)) {
              maxLength = 5;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isRgbColor')) {
              maxLength = 32;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isSemVer')) {
              maxLength = 32;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_UUID)) {
              maxLength = 36;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isPostalCode')) {
              maxLength = 32;
            } else if (
              doesClassPropertyContainCustomValidation(Class, propertyName, 'isCreditCardExpiration')
            ) {
              maxLength = 7;
            } else if (
              doesClassPropertyContainCustomValidation(Class, propertyName, 'isCardVerificationCode')
            ) {
              maxLength = 4;
            } else if (doesClassPropertyContainCustomValidation(Class, propertyName, 'isMobileNumber')) {
              maxLength = 32;
            } else if (doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_PHONE_NUMBER)) {
              maxLength = 32;
            }

            if (
              maxLength &&
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.MAX_LENGTH)
            ) {
              const validationMetadataArgs: ValidationMetadataArgs = {
                type: ValidationTypes.MAX_LENGTH,
                target: Class,
                propertyName,
                constraints: [maxLength],
                validationOptions: { each: isArrayType }
              };

              getFromContainer(MetadataStorage).addValidationMetadata(
                new ValidationMetadata(validationMetadataArgs)
              );
            }

            if (
              propertyName === '_id' ||
              propertyName === 'id' ||
              propertyName.endsWith('Id') ||
              propertyName.endsWith('Ids')
            ) {
              if (!doesClassPropertyContainCustomValidation(Class, propertyName, 'isStringOrObjectId')) {
                const validationMetadataArgs: ValidationMetadataArgs = {
                  type: ValidationTypes.CUSTOM_VALIDATION,
                  target: Class,
                  propertyName,
                  constraints: ['isStringOrObjectId'],
                  validationOptions: { each: isArrayType }
                };

                getFromContainer(MetadataStorage).addValidationMetadata(
                  new ValidationMetadata(validationMetadataArgs)
                );
              }
            } else {
              validationType = ValidationTypes.IS_STRING;
            }
          } else if (baseTypeName === 'Date') {
            validationType = ValidationTypes.IS_DATE;
          } else if (baseTypeName.charAt(0).match(/^[_$A-Z]$/)) {
            validationType = ValidationTypes.IS_INSTANCE;
            if (Types[baseTypeName]) {
              constraints = [Types[baseTypeName]];
            } else if (hasSrcFilenameForTypeName(baseTypeName)) {
              if (
                isArrayType &&
                !doesPropertyContainValidation(Class, propertyName, ValidationTypes.ARRAY_UNIQUE) &&
                !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')
              ) {
                throw new Error(
                  Class.name +
                  '.' +
                  propertyName +
                  ' must have either @ArrayUnique() or @ArrayNotUnique() annotation'
                );
              }

              const enumValues = parseEnumValuesFromSrcFile(baseTypeName);
              validationType = ValidationTypes.IS_IN;
              constraints = [enumValues];
            } else {
              throw new Error(
                'Type: ' +
                baseTypeName +
                ' not found in ' +
                serviceName.charAt(0).toUpperCase() +
                serviceName.slice(1) +
                '.Types'
              );
            }
          } else if (baseTypeName === 'any') {
            if (!typePropertyAnnotationContainer.getTypePropertyRemoteServiceFetchSpec(Class, propertyName)) {
              throw new Error(
                Class.name +
                '.' +
                propertyName +
                " type 'any' allowed only with @FetchFromRemoteService() annotation present"
              );
            }
          } else if (baseTypeName !== 'any') {
            validationType = ValidationTypes.IS_IN;

            if (
              isArrayType &&
              !doesPropertyContainValidation(Class, propertyName, ValidationTypes.ARRAY_UNIQUE) &&
              !doesClassPropertyContainCustomValidation(Class, propertyName, 'arrayNotUnique')
            ) {
              throw new Error(
                Class.name +
                  '.' +
                  propertyName +
                  ' must have either @ArrayUnique() or @ArrayNotUnique() annotation'
              );
            }

            if (baseTypeName[0] === '(' && baseTypeName[baseTypeName.length - 1] === ')') {
              baseTypeName = baseTypeName.slice(1, -1);
            }

            let enumType: any;
            const enumValues = baseTypeName.split('|').map((enumValue) => {
              const trimmedEnumValue = enumValue.trim();
              const validator = new Validator();

              if (validator.isNumberString(trimmedEnumValue)) {
                if (enumType === 'string') {
                  throw new Error(
                    'All enum values must be of same type: ' +
                      baseTypeName +
                      ' in ' +
                      className +
                      '.' +
                      propertyName
                  );
                }
                enumType = 'number';
                return parseFloat(trimmedEnumValue);
              } else if (
                (trimmedEnumValue.charAt(0) === "'" &&
                  trimmedEnumValue.charAt(trimmedEnumValue.length - 1) === "'") ||
                (trimmedEnumValue.charAt(0) === '"' &&
                  trimmedEnumValue.charAt(trimmedEnumValue.length - 1) === '"')
              ) {
                if (enumType === 'number') {
                  throw new Error(
                    'All enum values must be of same type: ' +
                      baseTypeName +
                      ' in ' +
                      className +
                      '.' +
                      propertyName
                  );
                }
                enumType = 'string';
                return trimmedEnumValue.slice(1, -1);
              } else {
                throw new Error(
                  'Enum values cannot contain | character in ' + className + '.' + propertyName
                );
              }
            });

            constraints = [enumValues];
          }

          if (typePropertyAnnotationContainer.getTypePropertyRemoteServiceFetchSpec(Class, propertyName)) {
            if (!classBodyNode.readonly) {
              throw new Error(
                Class.name +
                '.' +
                propertyName +
                ' must be a readonly property when property decorated with @FetchFromRemoteService() annotation'
              );
            }
          }

          if (validationType && !doesPropertyContainValidation(Class, propertyName, validationType)) {
            const validationMetadataArgs: ValidationMetadataArgs = {
              type: validationType,
              target: Class,
              propertyName,
              constraints,
              validationOptions: { each: isArrayType }
            };

            getFromContainer(MetadataStorage).addValidationMetadata(
              new ValidationMetadata(validationMetadataArgs)
            );
          }

          if (isArrayType && !doesPropertyContainValidation(Class, propertyName, ValidationTypes.IS_ARRAY)) {
            const arrayValidationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.IS_ARRAY,
              target: Class,
              propertyName
            };

            getFromContainer(MetadataStorage).addValidationMetadata(
              new ValidationMetadata(arrayValidationMetadataArgs)
            );
          }

          if (isNullableType) {
            const isNullableValidationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CONDITIONAL_VALIDATION,
              target: Class,
              propertyName,
              constraints: [(object: any) => object[propertyName] !== null, 'isNullable'],
              validationOptions: { each: isArrayType }
            };

            getFromContainer(MetadataStorage).addValidationMetadata(
              new ValidationMetadata(isNullableValidationMetadataArgs)
            );
          }

          const conditionalValidation = getPropertyValidationOfType(
            Class,
            propertyTypeName,
            ValidationTypes.CONDITIONAL_VALIDATION
          );

          if (
            classBodyNode.optional &&
            (!conditionalValidation || conditionalValidation.constraints[1] !== 'isOptional')
          ) {
            const optionalValidationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CONDITIONAL_VALIDATION,
              target: Class,
              constraints: [
                (object: any) => {
                  return object[propertyName] !== null && object[propertyName] !== undefined;
                },
                'isOptional'
              ],
              propertyName
            };

            getFromContainer(MetadataStorage).addValidationMetadata(
              new ValidationMetadata(optionalValidationMetadataArgs)
            );
          }

          if (propertyName !== '_id' && entityAnnotationContainer.isEntity(Class)) {
            const optionalValidationMetadataArgs: ValidationMetadataArgs = {
              type: ValidationTypes.CONDITIONAL_VALIDATION,
              target: Class,
              constraints: [
                (object: any) => {
                  return object[propertyName] !== null && object[propertyName] !== undefined;
                },
                'isOptional'
              ],
              propertyName
            };

            const validationMetadata = new ValidationMetadata(optionalValidationMetadataArgs);
            validationMetadata.groups = ['__backk_update__'];
            getFromContainer(MetadataStorage).addValidationMetadata(validationMetadata);
          }
        }
      }
    }
  }
}
