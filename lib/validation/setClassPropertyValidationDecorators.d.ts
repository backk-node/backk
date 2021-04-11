import { ValidationMetadata } from 'class-validator/metadata/ValidationMetadata';
export declare function getPropertyValidationOfType(typeClass: Function, propertyName: string, validationType: string): ValidationMetadata | undefined;
export declare function getClassPropertyCustomValidationTestValue(Class: Function, propertyName: string): any;
export declare function doesClassPropertyContainCustomValidation(Class: Function, propertyName: string, validationType: string, disregardFirstGroup?: string, group?: string): boolean;
export default function setClassPropertyValidationDecorators(Class: Function, serviceName: string, Types: {
    [key: string]: new () => any;
}, remoteServiceRootDir?: string): void;
