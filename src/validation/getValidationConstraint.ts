import { getFromContainer, MetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';

export default function getValidationConstraint(
  Class: Function,
  propertyName: string,
  validationType: string,
  constraintIndex?: number
): any {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');

  const foundValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName && validationMetadata.type === validationType
  );

  return foundValidation ? foundValidation.constraints[constraintIndex ?? 0] : undefined;
}
