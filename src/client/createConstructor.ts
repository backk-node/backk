function getExpressionStatement(propertyName: string, right: object) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'ThisExpression',
        },
        property: {
          type: 'Identifier',
          name: propertyName,
        },
      },
      right,
    },
  };
}

function getArrayExpressionStatement(propertyName: string, right: object) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        object: {
          type: 'ThisExpression',
        },
        property: {
          type: 'Identifier',
          name: propertyName,
        },
      },
      right: {
        type: 'ArrayExpression',
        elements: [right],
      },
    },
  };
}

function getExpressionStatementForProperty(propertyName: string, propertyTypeName: string | number) {
  const numericValue = typeof propertyTypeName === 'string' ? parseFloat(propertyTypeName) : propertyTypeName;
  if (!isNaN(numericValue)) {
    return getExpressionStatement(propertyName, {
      type: 'NumericLiteral',
      value: numericValue,
    });
  } else if (typeof propertyTypeName === 'string' && propertyTypeName[0] === "'") {
    return getExpressionStatement(propertyName, {
      type: 'StringLiteral',
      value: propertyTypeName.slice(1, -1),
    });
  } else if (propertyTypeName === 'TSStringKeyword') {
    return getExpressionStatement(propertyName, {
      type: 'StringLiteral',
      value: '',
    });
  } else if (propertyTypeName === 'TSNumberKeyword') {
    return getExpressionStatement(propertyName, {
      type: 'NumericLiteral',
      value: 0,
    });
  } else if (propertyTypeName === 'TSBooleanKeyword') {
    return getExpressionStatement(propertyName, {
      type: 'BooleanLiteral',
      value: false,
    });
  } else {
    return getExpressionStatement(propertyName, {
      type: 'NewExpression',
      callee: {
        type: 'Identifier',
        name: propertyTypeName,
      },
    });
  }
}

function getExpressionStatementForArrayProperty(propertyName: string, propertyTypeName: string | number) {
  const numericValue = typeof propertyTypeName === 'string' ? parseFloat(propertyTypeName) : propertyTypeName;
  if (!isNaN(numericValue)) {
    return getArrayExpressionStatement(propertyName, {
      type: 'NumericLiteral',
      value: numericValue,
    });
  } else if (typeof propertyTypeName === 'string' && propertyTypeName[0] === "'") {
    return getArrayExpressionStatement(propertyName, {
      type: 'StringLiteral',
      value: propertyTypeName.slice(1, -1),
    });
  } else if (propertyTypeName === 'TSStringKeyword') {
    return getArrayExpressionStatement(propertyName, {
      type: 'StringLiteral',
      value: '',
    });
  } else if (propertyTypeName === 'TSNumberKeyword') {
    return getArrayExpressionStatement(propertyName, {
      type: 'NumericLiteral',
      value: 0,
    });
  } else if (propertyTypeName === 'TSBooleanKeyword') {
    return getArrayExpressionStatement(propertyName, {
      type: 'BooleanLiteral',
      value: false,
    });
  } else {
    return getArrayExpressionStatement(propertyName, {
      type: 'NewExpression',
      callee: {
        type: 'Identifier',
        name: propertyTypeName,
      },
    });
  }
}

export default function createConstructor(
  propertyNameToTypeNameMap: { [key: string]: string | number },
  hasSuperClass: boolean
) {
  const initializers = Object.entries(propertyNameToTypeNameMap).map(([propertyName, propertyTypeName]) => {
    if (typeof propertyTypeName === 'string' && propertyTypeName.endsWith('[]')) {
      return getExpressionStatementForArrayProperty(propertyName, propertyTypeName.slice(0, -2));
    } else {
      return getExpressionStatementForProperty(propertyName, propertyTypeName);
    }
  });

  const superCall = {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'Super',
      },
    },
  };

  return {
    type: 'ClassMethod',
    kind: 'constructor',
    key: {
      type: 'Identifier',
      name: 'constructor',
    },
    computed: false,
    id: null,
    generator: false,
    async: false,
    params: [],
    static: false,
    body: {
      type: 'BlockStatement',
      body: [...(hasSuperClass ? [superCall] : []), ...initializers],
    },
  };
}
