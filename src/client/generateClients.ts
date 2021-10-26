import {
  copyFileSync,
  Dirent,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from 'fs';
import { resolve, dirname } from 'path';
import { parseSync } from '@babel/core';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import generate from '@babel/generator';
import { getFileNamesRecursively } from '../utils/file/getSrcFilePathNameForTypeName';
import getMicroserviceName from '../utils/getMicroserviceName';

function getInternalReturnFetchStatement(serviceName: string, functionName: string, argumentName: string) {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'callRemoteService'
      },
      arguments: [
        {
          type: 'StringLiteral',
          value: getMicroserviceName()
        },
        {
          type: 'StringLiteral',
          value: `${serviceName}.${functionName}`
        },
        {
          type: 'Identifier',
          name: argumentName ?? 'undefined'
        },
        {
          type: 'StringLiteral',
          value: process.env.SERVICE_NAMESPACE
        }
      ]
    }
  };
}

function getFrontendReturnFetchStatement(serviceName: string, functionName: string, argumentName: string) {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'fetch'
      },
      arguments: [
        {
          type: 'TemplateLiteral',
          expressions: [
            {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: 'window'
                },
                computed: false,
                property: {
                  type: 'Identifier',
                  name: 'location'
                }
              },
              computed: false,
              property: {
                type: 'Identifier',
                name: 'host'
              }
            }
          ],
          quasis: [
            {
              type: 'TemplateElement',
              value: {
                raw: 'https://',
                cooked: 'https://'
              },
              tail: false
            },
            {
              type: 'TemplateElement',
              value: {
                raw: `/${getNamespacedMicroserviceName()}/${serviceName}.${functionName}`,
                cooked: `/${getNamespacedMicroserviceName()}/${serviceName}.${functionName}`
              },
              tail: true
            }
          ]
        },
        {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'method'
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'StringLiteral',
                extra: {
                  rawValue: 'post',
                  raw: "'post'"
                },
                value: 'post'
              }
            },
            ...(argumentName
              ? [
                  {
                    type: 'ObjectProperty',
                    method: false,
                    key: {
                      type: 'Identifier',
                      name: 'body'
                    },
                    computed: false,
                    shorthand: false,
                    value: {
                      type: 'CallExpression',
                      callee: {
                        type: 'MemberExpression',
                        object: {
                          type: 'Identifier',
                          name: 'JSON'
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          name: 'stringify'
                        }
                      },
                      arguments: [
                        {
                          type: 'Identifier',
                          name: argumentName
                        }
                      ]
                    }
                  }
                ]
              : []),
            {
              type: 'ObjectProperty',
              method: false,
              key: {
                type: 'Identifier',
                name: 'headers'
              },
              computed: false,
              shorthand: false,
              value: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'ObjectProperty',
                    method: false,
                    key: {
                      type: 'StringLiteral',
                      extra: {
                        rawValue: 'Content-Type',
                        raw: "'Content-Type'"
                      },
                      value: 'Content-Type'
                    },
                    computed: false,
                    shorthand: false,
                    value: {
                      type: 'StringLiteral',
                      extra: {
                        rawValue: 'application/json',
                        raw: "'application/json'"
                      },
                      value: 'application/json'
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  };
}

function rewriteTypeFilesWithPrivateProperties(
  typeFilePathName: string,
  frontEndDestTypeFilePathName: string
) {
  const typeFileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(typeFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;
  let needsRewrite = false;

  for (const node of nodes) {
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      const classBodyNodes: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        const isPrivate = classBodyNode.decorators?.find(
          (decorator: any) => decorator.expression.callee.name === 'Private'
        );
        if (classBodyNode.type === 'ClassProperty' && isPrivate) {
          needsRewrite = true;
          return;
        }
        classBodyNodes.push(classBodyNode);
      });
      node.declaration.body.body = classBodyNodes;
    }
  }

  if (needsRewrite) {
    const code = generate(ast as any).code;
    writeFileSync(frontEndDestTypeFilePathName, code, { encoding: 'UTF-8' });
  }
}

function generateFrontendServiceFile(serviceImplFilePathName: string) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (node.type === 'ImportDeclaration' && node.source.value === 'backk') {
      node.source.value = 'backk-frontend-utils';
      node.source.raw = 'backk-frontend-utils';
    }

    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      if (
        node.declaration.decorators?.find(
          (decorator: any) => decorator.expression.callee.name === 'AllowServiceForKubeClusterInternalUse'
        )
      ) {
        const destServiceImplFilePathName = serviceImplFilePathName.replace(
          /src\/services/,
          'generated/clients/frontend/' + getNamespacedMicroserviceName()
        );
        unlinkSync(destServiceImplFilePathName);
      }

      if (node.declaration.type !== 'ClassDeclaration') {
        throw new Error(serviceImplFilePathName + ': Invalid service implementation file. File must contain a single export of service implementation class')
      }

      node.declaration.superClass = null;
      const serviceName = node.declaration.id.name[0].toLowerCase() + node.declaration.id.name.slice(1);
      if (serviceName.endsWith('Impl')) {
        node.declaration.id.name = node.declaration.id.name.slice(0, -4);
      }

      const methods: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassMethod') {
          const functionName = classBodyNode.key.name;
          const argumentName = classBodyNode.params?.[0]?.name;
          const isInternalMethod = classBodyNode.decorators?.find(
            (decorator: any) =>
              decorator.expression.callee.name === 'AllowForKubeClusterInternalUse' ||
              decorator.expression.callee.name === 'AllowForMicroserviceInternalUse' ||
              decorator.expression.callee.name === 'AllowForTests' ||
              decorator.expression.callee.name === 'ExecuteOnStartUp' ||
              decorator.expression.callee.name === 'CronJob'
          );

          if (
            functionName === 'constructor' ||
            classBodyNode.accessibility === 'private' ||
            isInternalMethod
          ) {
            return;
          }

          classBodyNode.async = false;
          classBodyNode.decorators = [];
          classBodyNode.body = {
            type: 'BlockStatement',
            body: [getFrontendReturnFetchStatement(serviceName, functionName, argumentName)]
          };

          methods.push(classBodyNode);
        }
      });

      node.declaration.body.body = methods;
    }
  }

  const code = generate(ast as any).code;
  const destServiceImplFilePathName = serviceImplFilePathName.replace(
    /src\/services/,
    'generated/clients/frontend/' + getNamespacedMicroserviceName()
  );

  const frontEndDestDirPathName = dirname(destServiceImplFilePathName);
  if (!existsSync(frontEndDestDirPathName)) {
    mkdirSync(frontEndDestDirPathName, { recursive: true });
  }

  writeFileSync(
    destServiceImplFilePathName.endsWith('ServiceImpl.ts')
      ? destServiceImplFilePathName.slice(0, -7) + '.ts'
      : destServiceImplFilePathName,
    code,
    { encoding: 'UTF-8' }
  );
}

function generateInternalServiceFile(serviceImplFilePathName: string) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;

  for (const node of nodes) {
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type !== 'ClassDeclaration') {
        throw new Error(serviceImplFilePathName + ': Invalid service implementation file. File must contain a single export of service implementation class')
      }

      node.declaration.superClass = null;
      const serviceName = node.declaration.id.name[0].toLowerCase() + node.declaration.id.name.slice(1);
      if (serviceName.endsWith('Impl')) {
        node.declaration.id.name = node.declaration.id.name.slice(0, -4);
      }

      const methods: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassMethod') {
          const functionName = classBodyNode.key.name;
          const argumentName = classBodyNode.params?.[0]?.name;
          const isInternalMethod = classBodyNode.decorators?.find(
            (decorator: any) => decorator.expression.callee.name === 'AllowForKubeClusterInternalUse'
          );

          if (
            functionName === 'constructor' ||
            classBodyNode.accessibility === 'private' ||
            !isInternalMethod
          ) {
            return;
          }

          classBodyNode.async = false;
          classBodyNode.decorators = [];
          classBodyNode.body = {
            type: 'BlockStatement',
            body: [getInternalReturnFetchStatement(serviceName, functionName, argumentName)]
          };
          methods.push(classBodyNode);
        }
      });

      node.declaration.body.body = methods;
    }
  }

  const code = generate(ast as any).code;
  const destServiceImplFilePathName = serviceImplFilePathName.replace(
    /src\/services/,
    'generated/clients/internal/' + getNamespacedMicroserviceName()
  );

  const internalDestDirPathName = dirname(destServiceImplFilePathName);
  if (!existsSync(internalDestDirPathName)) {
    mkdirSync(internalDestDirPathName, { recursive: true });
  }

  writeFileSync(
    destServiceImplFilePathName.endsWith('ServiceImpl.ts')
      ? destServiceImplFilePathName.slice(0, -7) + '.ts'
      : destServiceImplFilePathName,
    code,
    { encoding: 'UTF-8' }
  );
}

export default function generateClients() {
  if (!existsSync('src/services')) {
    return;
  }

  const generatedClientsFiles = getFileNamesRecursively('generated/clients');
  generatedClientsFiles.forEach((generatedClientFile) => {
    unlinkSync(generatedClientFile);
  });

  const directoryEntries = readdirSync('src/services', { withFileTypes: true });

  directoryEntries.forEach((directoryEntry: Dirent) => {
    const serviceDirectory = resolve('src/services', directoryEntry.name);
    if (!directoryEntry.isDirectory()) {
      return;
    }

    const serviceDirectoryEntries = readdirSync(serviceDirectory, { withFileTypes: true });

    const typeFilePathNames = getFileNamesRecursively(serviceDirectory + '/types');
    typeFilePathNames
      .filter((typeFilePathName) => typeFilePathName.endsWith('.ts'))
      .forEach((typeFilePathName) => {
        const frontEndDestTypeFilePathName = typeFilePathName.replace(
          /src\/services/,
          'generated/clients/frontend/' + getNamespacedMicroserviceName()
        );
        const frontEndDestDirPathName = dirname(frontEndDestTypeFilePathName);
        if (!existsSync(frontEndDestDirPathName)) {
          mkdirSync(frontEndDestDirPathName, { recursive: true });
        }
        copyFileSync(typeFilePathName, frontEndDestTypeFilePathName);

        rewriteTypeFilesWithPrivateProperties(typeFilePathName, frontEndDestTypeFilePathName);

        const internalDestTypeFilePathName = typeFilePathName.replace(
          /src\/services/,
          'generated/clients/internal/' + getNamespacedMicroserviceName()
        );
        const internalDestDirPathName = dirname(internalDestTypeFilePathName);
        if (!existsSync(internalDestDirPathName)) {
          mkdirSync(internalDestDirPathName, { recursive: true });
        }
        copyFileSync(typeFilePathName, internalDestTypeFilePathName);
      });

    let serviceImplFileDirEntry = serviceDirectoryEntries.find((serviceDirectoryEntry) =>
      serviceDirectoryEntry.name.endsWith('ServiceImpl.ts')
    );

    if (!serviceImplFileDirEntry) {
      serviceImplFileDirEntry = serviceDirectoryEntries.find((serviceDirectoryEntry) =>
        serviceDirectoryEntry.name.endsWith('Service.ts')
      );
    }

    if (!serviceImplFileDirEntry) {
      return;
    }

    const serviceImplFilePathName = resolve(serviceDirectory, serviceImplFileDirEntry.name);
    generateFrontendServiceFile(serviceImplFilePathName);
    generateInternalServiceFile(serviceImplFilePathName);
  });
}
