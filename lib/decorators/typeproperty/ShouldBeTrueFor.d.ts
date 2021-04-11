import { ValidationOptions } from 'class-validator';
export declare function ShouldBeTrueFor<T>(func: (entity: T) => boolean, errorMessage?: string, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
