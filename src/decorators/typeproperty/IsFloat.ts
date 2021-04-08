import { ValidationMetadataArgs } from "class-validator/metadata/ValidationMetadataArgs";
import { getFromContainer, MetadataStorage, ValidationTypes } from "class-validator";
import { ValidationMetadata } from "class-validator/metadata/ValidationMetadata";

export function IsFloat(maxDecimalPlaces: number, options?: { each: boolean}) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function(object: Object, propertyName: string) {
    const validationMetadataArgs: ValidationMetadataArgs = {
      type: ValidationTypes.IS_NUMBER,
      target: object.constructor,
      propertyName,
      constraints: [{ maxDecimalPlaces }],
      validationOptions: { each: options?.each }
    };

    const validationMetadata = new ValidationMetadata(validationMetadataArgs);
    getFromContainer(MetadataStorage).addValidationMetadata(validationMetadata);
  };
}
