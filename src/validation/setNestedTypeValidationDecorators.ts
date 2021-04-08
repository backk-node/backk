import { getFromContainer, MetadataStorage, ValidationTypes } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import { ValidationMetadataArgs } from 'class-validator/metadata/ValidationMetadataArgs';
import { Type } from 'class-transformer';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';

export default function setNestedTypeValidationDecorators(Class: Function) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');

  validationMetadatas.forEach((validationMetadata: ValidationMetadata) => {
    if (validationMetadata.type === 'isDate') {
      Type(() => Date)(new (validationMetadata.target as new () => any)(), validationMetadata.propertyName);
    }

    if (validationMetadata.type === 'isInstance') {
      if (
        entityAnnotationContainer.entityNameToClassMap[Class.name] &&
        !entityAnnotationContainer.entityNameToClassMap[validationMetadata.constraints[0].name]
      ) {
        throw new Error(validationMetadata.constraints[0].name + ' is missing @BackkEntity() annotation')
      }

      const nestedValidationMetadataArgs: ValidationMetadataArgs = {
        type: ValidationTypes.NESTED_VALIDATION,
        target: validationMetadata.target,
        propertyName: validationMetadata.propertyName,
        validationOptions: { each: validationMetadata.each }
      };

      Type(() => validationMetadata.constraints[0])(
        new (validationMetadata.target as new () => any)(),
        validationMetadata.propertyName
      );

      getFromContainer(MetadataStorage).addValidationMetadata(
        new ValidationMetadata(nestedValidationMetadataArgs)
      );
    }
  });
}
