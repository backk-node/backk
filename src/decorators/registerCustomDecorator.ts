import { registerDecorator, ValidationDecoratorOptions } from 'class-validator';

export const customDecoratorNameToTestValueMap: { [key: string]: any } = {};

export default function registerCustomDecorator(options: ValidationDecoratorOptions, testValue: any) {
  if (!options.name) {
    throw new Error('name must be specified in ValidationDecoratorOptions');
  }

  if (options.name !== options.constraints?.[0]) {
    throw new Error("property 'name' and 'constraints[0]' must be same in ValidationDecoratorOptions");
  }

  customDecoratorNameToTestValueMap[options.name] = testValue;
  registerDecorator(options);
}
