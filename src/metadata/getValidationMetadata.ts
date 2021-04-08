import { getFromContainer, MetadataStorage } from "class-validator";
import { ValidationMetadata } from "class-validator/metadata/ValidationMetadata";

export default function getValidationMetadata<T>(Class: new () => T): object {
  const metadataForValidations = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');
  const propNameToValidationsMap: { [key: string]: string[] } = {};

  // noinspection FunctionWithMoreThanThreeNegationsJS
  metadataForValidations.forEach((validationMetadata: ValidationMetadata) => {
    const validationType =
      validationMetadata.type === 'customValidation'
        ? validationMetadata.constraints[0]
        : validationMetadata.type;

    if (
      validationMetadata.type !== 'conditionalValidation' &&
      validationMetadata.type !== 'nestedValidation' &&
      validationMetadata.type !== 'isInstance' &&
      validationType !== 'isUndefined'
    ) {
      const validationConstraints =
        validationMetadata.type === 'customValidation'
          ? validationMetadata.constraints.slice(1)
          : validationMetadata.constraints;

      const validationConstraintsStr = (validationConstraints ?? [])
        .map((validationConstraint) =>
          typeof validationMetadata.constraints[0] === 'object' && !(validationConstraint instanceof RegExp)
            ? JSON.stringify(validationConstraint)
            : validationConstraint
        )
        .join(', ');

      const separator = validationConstraintsStr ? ', ' : '';
      const validationOptionsStr = validationMetadata.each ? separator + '{ each: true }' : '';

      const validationExpr = `${validationType}${'(' +
        validationConstraintsStr +
        validationOptionsStr +
        ')'}`;

      if (!propNameToValidationsMap[validationMetadata.propertyName]) {
        propNameToValidationsMap[validationMetadata.propertyName] = [validationExpr];
      }

      if (!propNameToValidationsMap[validationMetadata.propertyName].includes(validationExpr)) {
        propNameToValidationsMap[validationMetadata.propertyName].push(validationExpr);
      }
    }
  });

  return Object.entries(propNameToValidationsMap).reduce(
    (accumulatedValidationMetadata, [propName, validations]) => {
      return {
        ...accumulatedValidationMetadata,
        [propName]: validations
      };
    },
    {}
  );
}
