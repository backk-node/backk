export type ErrorDefinition = {
  readonly errorCode: string;
  readonly message: string;
  readonly statusCode?: number;
};

export type ErrorDefinitions = { [key: string]: ErrorDefinition };
