import { ValidationOptions } from 'class-validator';
export default function MinMax(minValue: number, maxValue: number, validationOptions?: ValidationOptions): (object: Record<string, any>, propertyName: string) => void;
