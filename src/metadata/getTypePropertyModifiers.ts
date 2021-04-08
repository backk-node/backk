import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';
import { doesClassPropertyContainCustomValidation } from '../validation/setClassPropertyValidationDecorators';

export default function getTypePropertyModifiers<T>(
  typeMetadata: { [key: string]: string } | undefined,
  Class: new () => T
): { [key: string]: string } {
  return Object.keys(typeMetadata ?? {}).reduce((accumulatedTypePropertyModifiers, propertyName) => {
    const isPrivate = typePropertyAnnotationContainer.isTypePropertyPrivate(Class, propertyName);
    const isReadonly = doesClassPropertyContainCustomValidation(
      Class,
      propertyName,
      'isUndefined',
      '__backk_update__'
    );
    const isTransient = typePropertyAnnotationContainer.isTypePropertyTransient(Class, propertyName);
    const typePropertyModifiers =
      (isPrivate ? 'private' : 'public') +
      (isTransient ? ' transient' : '') +
      (isReadonly ? ' readonly' : '');

    return {
      ...accumulatedTypePropertyModifiers,
      [propertyName]: typePropertyModifiers
    };
  }, {});
}
