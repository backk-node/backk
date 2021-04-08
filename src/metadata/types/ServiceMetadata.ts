import { FunctionMetadata } from './FunctionMetadata';

export type ServiceMetadata = {
  serviceName: string;
  serviceDocumentation?: string;
  functions: FunctionMetadata[];
  types: { [p: string]: object };
  publicTypes: { [p: string]: object };
  propertyModifiers: { [p: string]: object };
  typeReferences: { [p: string]: string };
  typesDocumentation?: object;
  validations: { [p: string]: any[] };
};
