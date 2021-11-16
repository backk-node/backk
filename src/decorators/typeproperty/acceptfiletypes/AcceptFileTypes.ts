import { registerDecorator, ValidationOptions } from 'class-validator';

export default function AcceptFileTypes(fileTypes: string[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'acceptFileTypes',
      target: object.constructor,
      propertyName: propertyName,
      constraints: ['acceptFileTypes', fileTypes],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          const valueMediaTypes = value.slice(5)?.split(';base64')[0]?.split(';');
          const requiredFileTypes = fileTypes.map((fileType) => {
            if (fileType.endsWith('/*')) {
              return fileType.slice(0, -2);
            }
            return fileType.slice(1);
          });
          return requiredFileTypes.some(
            (requiredFileType) =>
              !!valueMediaTypes.find((valueMediaType) => valueMediaType.includes(requiredFileType))
          );
        },
        defaultMessage: () => propertyName + ' is not valid file type: ' + fileTypes.join(', '),
      },
    });
  };
}
