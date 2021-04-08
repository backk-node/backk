import { getFromContainer, MetadataStorage } from 'class-validator';
import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
import shouldEncryptValue from '../crypt/shouldEncryptValue';
import encrypt from '../crypt/encrypt';

function calculateMaxLength(Class: Function, propertyName: string, dataLength: number): number {
  if (shouldEncryptValue(propertyName, Class)) {
    const encryptedValue = encrypt(
      Array(dataLength)
        .fill(1)
        .join('')
    );
    return encryptedValue.length;
  }

  return dataLength;
}

export default function getMaxLengthValidationConstraint(Class: Function, propertyName: string) {
  const validationMetadatas = getFromContainer(MetadataStorage).getTargetValidationMetadatas(Class, '');

  const maxLengthValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName && validationMetadata.type === 'maxLength'
  );

  if (maxLengthValidation) {
    return calculateMaxLength(Class, propertyName, maxLengthValidation.constraints[0]);
  }

  const lengthValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName && validationMetadata.type === 'length'
  );

  if (lengthValidation) {
    return calculateMaxLength(Class, propertyName, lengthValidation.constraints[1]);
  }

  const lengthAndMatchesValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === 'lengthAndMatches'
  );

  if (lengthAndMatchesValidation) {
    return calculateMaxLength(Class, propertyName, lengthAndMatchesValidation.constraints[2]);
  }

  const lengthAndMatchesAllValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === 'lengthAndMatchesAll'
  );

  if (lengthAndMatchesAllValidation) {
    return calculateMaxLength(Class, propertyName, lengthAndMatchesAllValidation.constraints[2]);
  }

  const maxLengthAndMatchesValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === 'maxLengthAndMatches'
  );

  if (maxLengthAndMatchesValidation) {
    return calculateMaxLength(Class, propertyName, maxLengthAndMatchesValidation.constraints[1]);
  }

  const maxLengthAndMatchesAllValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === 'maxLengthAndMatchesAll'
  );

  if (maxLengthAndMatchesAllValidation) {
    return calculateMaxLength(Class, propertyName, maxLengthAndMatchesAllValidation.constraints[1]);
  }

  const strongPasswordValidation = validationMetadatas.find(
    (validationMetadata: ValidationMetadata) =>
      validationMetadata.propertyName === propertyName &&
      validationMetadata.type === 'customValidation' &&
      validationMetadata.constraints[0] === 'isStrongPassword'
  );

  if (strongPasswordValidation) {
    return calculateMaxLength(Class, propertyName, 512);
  }

  throw new Error("Cannot figure out string property's maximum length");
}
