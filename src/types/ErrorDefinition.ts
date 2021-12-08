export type ErrorDefinition = {
  readonly errorCode: string | number;
  readonly message: string;
  readonly statusCode?: number;
};

export type ErrorNameToErrorDefinitionMap = { [errorName: string]: ErrorDefinition };
