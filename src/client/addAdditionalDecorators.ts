import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import pushIfNotExists from '../utils/array/pushIfNotExists';

function createUndefinedDecorator(modes: string[]) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'IsUndefined',
      },
      arguments: [
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'groups',
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'ArrayExpression',
                elements: modes.map((mode) => ({
                  type: 'StringLiteral',
                  value: mode,
                })),
              },
            },
          ],
        },
      ],
    },
  };
}

function createIdValidationDecorator() {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'MaxLengthAndMatches',
      },
      arguments: [
        {
          type: 'NumericLiteral',
          value: 24,
        },
        {
          type: 'RegExpLiteral',
          pattern: '^[a-f\\d]{1,24}$',
          flags: '',
        },
      ],
    },
  };
}

function createIdOrObjectIdValidationDecorator() {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'IsStringOrObjectId',
      },
    },
  };
}

function createIsInstanceValidationDecorator(className: string) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'IsInstance',
      },
      arguments: [
        {
          type: 'Identifier',
          name: className,
        },
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'each',
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'BooleanLiteral',
                value: true,
              },
            },
          ],
        },
      ],
    },
  };
}

function createNestedValidationDecorator() {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'ValidateNested',
      },
      arguments: [
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'each',
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'BooleanLiteral',
                value: true,
              },
            },
          ],
        },
      ],
    },
  };
}

function createTypeDecorator(typeName: string) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'Type',
      },
      arguments: [
        {
          type: 'ArrowFunctionExpression',
          id: null,
          generator: false,
          async: false,
          params: [],
          body: {
            type: 'Identifier',
            name: typeName,
          },
        },
      ],
    },
  };
}

function createIsInDecorator(values: any[]) {
  const firstValueAsNumber = parseFloat(values[1]);

  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'IsIn',
      },
      arguments: [
        {
          type: 'ArrayExpression',
          elements: values.map((value) => ({
            type: isNaN(firstValueAsNumber) ? 'StringLiteral' : 'NumericLiteral',
            value,
          })),
        },
      ],
    },
  };
}

function createValidateIfNotNullDecorator(propertyName: string) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'ValidateIf',
      },
      arguments: [
        {
          type: 'ArrowFunctionExpression',
          id: null,
          generator: false,
          async: false,
          params: [
            {
              type: 'Identifier',
              name: 'o',
              typeAnnotation: {
                type: 'TypeAnnotation',
                typeAnnotation: {
                  type: 'AnyTypeAnnotation',
                },
              },
            },
          ],
          body: {
            type: 'BinaryExpression',
            left: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'o',
              },
              computed: false,
              property: {
                type: 'Identifier',
                name: propertyName,
              },
            },
            operator: '!==',
            right: {
              type: 'NullLiteral',
            },
          },
        },
      ],
    },
  };
}

function createValidateIfNotUndefinedDecorator(propertyName: string) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'ValidateIf',
      },
      arguments: [
        {
          type: 'ArrowFunctionExpression',
          id: null,
          generator: false,
          async: false,
          params: [
            {
              type: 'Identifier',
              name: 'o',
              typeAnnotation: {
                type: 'TypeAnnotation',
                typeAnnotation: {
                  type: 'AnyTypeAnnotation',
                },
              },
            },
          ],
          body: {
            type: 'BinaryExpression',
            left: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'o',
              },
              computed: false,
              property: {
                type: 'Identifier',
                name: propertyName,
              },
            },
            operator: '!==',
            right: {
              type: 'Identifier',
              name: 'undefined',
            },
          },
        },
      ],
    },
  };
}

function createValidateIfNotUndefinedOnUpdateDecorator(propertyName: string) {
  return {
    type: 'Decorator',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'ValidateIf',
      },
      arguments: [
        {
          type: 'ArrowFunctionExpression',
          id: null,
          generator: false,
          async: false,
          params: [
            {
              type: 'Identifier',
              name: 'o',
              typeAnnotation: {
                type: 'TypeAnnotation',
                typeAnnotation: {
                  type: 'AnyTypeAnnotation',
                },
              },
            },
          ],
          body: {
            type: 'BinaryExpression',
            left: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'o',
              },
              computed: false,
              property: {
                type: 'Identifier',
                name: propertyName,
              },
            },
            operator: '!==',
            right: {
              type: 'Identifier',
              name: 'undefined',
            },
          },
        },
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'groups',
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'ArrayExpression',
                elements: [
                  {
                    type: 'StringLiteral',
                    value: '__backk_update__',
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  };
}

function addDecorator(decorators: any[], decoratorToAdd: any) {
  if (
    !decorators.find(
      (decorator: any) => decorator.expression.callee.name === decoratorToAdd.expression.callee.name
    )
  ) {
    decorators.push(decoratorToAdd);
  }
}

export default function addAdditionalDecorators(
  classBodyNode: any,
  imports: string[],
  typeNames: string[],
  isEntity: boolean
): string[] {
  const isCreateOnly = !!classBodyNode.decorators.find(
    (decorator: any) => decorator.expression.callee.name === 'CreateOnly'
  );

  if (isCreateOnly) {
    addDecorator(classBodyNode.decorators, createUndefinedDecorator(['__backk_update__']));
    pushIfNotExists(imports, 'IsUndefined');
  }

  const isUpdateOnlyOrReadUpdate = !!classBodyNode.decorators.find(
    (decorator: any) =>
      decorator.expression.callee.name === 'UpdateOnly' || decorator.expression.callee.name === 'ReadUpdate'
  );

  if (isUpdateOnlyOrReadUpdate) {
    addDecorator(classBodyNode.decorators, createUndefinedDecorator(['__backk_create__']));
    pushIfNotExists(imports, 'IsUndefined');
  }

  const isPrivateOrReadOnly = !!classBodyNode.decorators.find(
    (decorator: any) =>
      decorator.expression.callee.name === 'Private' || decorator.expression.callee.name === 'ReadOnly'
  );

  if (isPrivateOrReadOnly) {
    addDecorator(
      classBodyNode.decorators,
      createUndefinedDecorator(['__backk_create__', '__backk_update__'])
    );
    pushIfNotExists(imports, 'IsUndefined');
  }

  const isExternalId = !!classBodyNode.decorators.find(
    (decorator: any) =>
      decorator.expression.callee.name === 'Private' || decorator.expression.callee.name === 'IsExternalId'
  );

  const isOneOrNoneOf = classBodyNode.decorators.find(
    (decorator: any) =>
      decorator.expression.callee.name === 'IsNoneOf' || decorator.expression.callee.name === 'IsOneOf'
  );

  if (isOneOrNoneOf) {
    isOneOrNoneOf.expression.arguments = isOneOrNoneOf.expression.arguments.slice(1);
  }

  const propertyName = classBodyNode.key.name;

  if (
    propertyName === '_id' ||
    propertyName === 'id' ||
    (propertyName.endsWith('Id') && !isExternalId) ||
    (propertyName.endsWith('Ids') && !isExternalId)
  ) {
    addDecorator(classBodyNode.decorators, createIdValidationDecorator());
    pushIfNotExists(imports, 'MaxLengthAndMatches');
    addDecorator(classBodyNode.decorators, createIdOrObjectIdValidationDecorator());
    pushIfNotExists(imports, 'IsStringOrObjectId');
  }

  const isArrayType = classBodyNode.typeAnnotation?.typeAnnotation?.type === 'TSArrayType';
  const typeName = isArrayType
    ? classBodyNode.typeAnnotation?.typeAnnotation?.elementType?.typeName?.name
    : classBodyNode.typeAnnotation?.typeAnnotation?.typeName?.name;

  if (typeName === 'Date') {
    classBodyNode.decorators.push(createTypeDecorator('Date'));
    pushIfNotExists(imports, 'Type');
  } else if (typeName) {
    if (typeNames.includes(typeName)) {
      classBodyNode.decorators.push(createIsInstanceValidationDecorator(typeName));
      pushIfNotExists(imports, 'IsInstance');
      classBodyNode.decorators.push(createNestedValidationDecorator());
      pushIfNotExists(imports, 'ValidateNested');
      classBodyNode.decorators.push(createTypeDecorator(typeName));
      pushIfNotExists(imports, 'Type');
    } else {
      const enumValues = parseEnumValuesFromSrcFile(typeName);
      if (enumValues.length > 0) {
        classBodyNode.decorators.push(createIsInDecorator(enumValues));
        pushIfNotExists(imports, 'IsIn');
      }
    }
  }

  if (classBodyNode.typeAnnotation?.typeAnnotation?.type === 'UnionTypeAnnotation') {
    const enumValues = classBodyNode.typeAnnotation.typeAnnotation.types.map((type: any) => type.value);

    classBodyNode.decorators.push(createIsInDecorator(enumValues));
    pushIfNotExists(imports, 'IsIn');
  }

  if (classBodyNode.typeAnnotation?.typeAnnotation?.types?.[1]?.type === 'TSNullKeyword') {
    classBodyNode.decorators.push(createValidateIfNotNullDecorator(propertyName));
    pushIfNotExists(imports, 'ValidateIf');
  }

  if (classBodyNode.optional) {
    classBodyNode.decorators.push(createValidateIfNotUndefinedDecorator(propertyName));
    pushIfNotExists(imports, 'ValidateIf');
  }

  if (propertyName !== '_id' && isEntity) {
    classBodyNode.decorators.push(createValidateIfNotUndefinedOnUpdateDecorator(propertyName));
    pushIfNotExists(imports, 'ValidateIf');
  }

  return imports;
}
