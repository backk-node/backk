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
          const mediaTypes = value.split(':')[1]?.split(';')?.slice(0, -1);
          const finalFileTypes = fileTypes.map((fileType) => {
            if (fileType.endsWith('/*')) {
              return fileType.slice(0, -2);
            }
            return fileType.slice(1);
          });
          return finalFileTypes.some((finalFileType) => mediaTypes.includes(finalFileType));
        },
      },
    });
  };
}
