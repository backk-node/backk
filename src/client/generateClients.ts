import { parseSync } from '@babel/core';
import generate from '@babel/generator';
import { exec } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import rimraf from 'rimraf';
import util from 'util';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import Microservice from '../microservice/Microservice';
import { RequestProcessor } from '../requestprocessor/RequestProcessor';
import types from '../types/types';
import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import getSrcFilePathNameForTypeName, {
  getFileNamesRecursively,
} from '../utils/file/getSrcFilePathNameForTypeName';
import getMicroserviceName from '../utils/getMicroserviceName';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import decapitalizeFirstLetter from '../utils/string/decapitalizeFirstLetter';
import addAdditionalDecorators from './addAdditionalDecorators';
import getServiceFunctionType from './getServiceFunctionType';

const promisifiedExec = util.promisify(exec);

export type ServiceFunctionType = 'create' | 'update' | 'other';

function getValidateServiceFunctionArgumentBlock(
  argumentName: string,
  argumentClassName: string,
  serviceFunctionType: string
) {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AwaitExpression',
            argument: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'validateServiceFunctionArgumentOrThrow',
              },
              arguments: [
                {
                  type: 'Identifier',
                  name: argumentName,
                },
                {
                  type: 'Identifier',
                  name: argumentClassName,
                },
                {
                  type: 'StringLiteral',
                  value: serviceFunctionType,
                },
              ],
              optional: false,
            },
          },
        },
      ],
    },
    handler: {
      type: 'CatchClause',
      param: {
        type: 'Identifier',
        name: 'error',
      },
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'ArrayExpression',
              elements: [
                {
                  type: 'NullLiteral',
                  value: null,
                },
                {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'ObjectProperty',
                      method: false,
                      key: {
                        type: 'Identifier',
                        name: 'message',
                      },
                      computed: false,
                      shorthand: false,
                      value: {
                        type: 'MemberExpression',
                        object: {
                          type: 'Identifier',
                          name: 'error',
                        },
                        computed: false,
                        property: {
                          type: 'Identifier',
                          name: 'message',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
    finalizer: null,
  };
}

function getReturnCallOrSendToRemoteServiceStatement(
  serviceName: string,
  functionName: string,
  argumentName: string,
  isGetMethodAllowed: boolean,
  requestProcessors?: RequestProcessor[],
  shouldHaveAccessTokenStorageEncryptionKeyArg = false
) {
  let backkFunction = 'callRemoteService';
  const asyncRequestProcessor = requestProcessors?.find((requestProcessor) =>
    requestProcessor.isAsyncProcessor()
  );
  if (asyncRequestProcessor) {
    backkFunction = 'sendToRemoteService';
  }

  return {
    type: 'ReturnStatement',
    argument: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: backkFunction,
      },
      arguments: [
        ...(asyncRequestProcessor
          ? [{ type: 'StringLiteral', value: asyncRequestProcessor.getCommunicationMethod() }]
          : []),
        {
          type: 'StringLiteral',
          value: getMicroserviceName(),
        },
        {
          type: 'StringLiteral',
          value: `${serviceName}.${functionName}`,
        },
        {
          type: 'Identifier',
          name: argumentName ?? 'undefined',
        },
        {
          type: 'StringLiteral',
          value: process.env.SERVICE_NAMESPACE,
        },
        ...(shouldHaveAccessTokenStorageEncryptionKeyArg
          ? [
              {
                type: 'Identifier',
                name: 'EncryptionKeyManager.accessTokenStorageEncryptionKey',
              },
            ]
          : []),
        ...(isGetMethodAllowed
          ? [
              {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'ObjectProperty',
                    method: false,
                    key: {
                      type: 'Identifier',
                      name: 'httpMethod',
                    },
                    computed: false,
                    shorthand: false,
                    value: {
                      type: 'StringLiteral',
                      value: 'GET',
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },
  };
}

function rewriteTypeFile(
  typeFilePathName: string,
  destTypeFilePathName: string,
  clientType: 'frontend' | 'internal',
  typeNames: string[]
) {
  const typeFileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(typeFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript',
    ],
  });

  const nodes = (ast as any).program.body;
  const imports: string[] = [];

  for (const node of nodes) {
    if (clientType === 'frontend' && node.type === 'ImportDeclaration' && node.source.value === 'backk') {
      node.source.value = 'backk-frontend-utils';
    }

    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      if (node.declaration?.type === 'TSTypeAliasDeclaration') {
        continue;
      }

      const isEntity = node.declaration.decorators?.find(
        (decorator: any) => decorator.expression.callee.name === 'Entity'
      );

      const classBodyNodes: any[] = [];
      node.declaration.decorators = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        const isPrivate = classBodyNode.decorators?.find(
          (decorator: any) => decorator.expression.callee.name === 'Private'
        );

        if (classBodyNode.type === 'ClassProperty' && isPrivate) {
          return;
        }

        const propertyTypeName = classBodyNode.typeAnnotation.typeAnnotation?.typeName?.name;

        if (
          propertyTypeName &&
          propertyTypeName[0] === propertyTypeName[0].toUpperCase() &&
          propertyTypeName[0] !== '(' &&
          propertyTypeName !== 'Date' &&
          !typeNames.includes(propertyTypeName) &&
          !(types as any)[propertyTypeName] &&
          parseEnumValuesFromSrcFile(propertyTypeName).length > 0
        ) {
          const typeFilePathName = getSrcFilePathNameForTypeName(propertyTypeName);

          const destTypeFilePathName = typeFilePathName.replace(
            /src\/services/,
            'generated/clients/frontend/' + getNamespacedMicroserviceName()
          );

          const destDirPathName = dirname(destTypeFilePathName);

          if (!existsSync(destDirPathName)) {
            mkdirSync(destDirPathName, { recursive: true });
          }

          rewriteTypeFile(typeFilePathName, destTypeFilePathName, clientType, typeNames);
        }

        if (!classBodyNode.decorators) {
          classBodyNode.decorators = [];
        }

        addAdditionalDecorators(classBodyNode, imports, typeNames, isEntity);

        classBodyNode.decorators = classBodyNode.decorators?.filter((decorator: any) => {
          const decoratorName = decorator.expression.callee.name;
          const shouldRemove = [
            'TestValue',
            'Encrypted',
            'FetchFromRemoteService',
            'Hashed',
            'Index',
            'NotEncrypted',
            'NotHashed',
            'NotUnique',
            'ManyToMany',
            'OneToMany',
            'Transient',
            'Unique',
            'CreateOnly',
            'ReadOnly',
            'ReadUpdate',
            'ReadWrite',
            'UpdateOnly',
            'WriteOnly',
            'IsExternalId',
          ].includes(decoratorName);

          return !shouldRemove;
        });

        classBodyNodes.push(classBodyNode);
      });
      node.declaration.body.body = classBodyNodes;
    }
  }

  const code = generate(ast as any).code;

  let outputFileContentsStr =
    '// DO NOT MODIFY THIS FILE! This is an auto-generated file' +
    '\n' +
    (imports.length > 0 ? 'import {' + imports.join(', ') + "} from 'backk-frontend-utils'" : '') +
    code;

  outputFileContentsStr = outputFileContentsStr
    .split('\n')
    .map((outputFileLine) => {
      if (outputFileLine.endsWith(';') && !outputFileLine.startsWith('import')) {
        return outputFileLine + '\n';
      }

      if (outputFileLine.startsWith('export default class') || outputFileLine.startsWith('export class')) {
        return '\n' + outputFileLine;
      }

      return outputFileLine;
    })
    .join('\n');

  writeFileSync(destTypeFilePathName, outputFileContentsStr, { encoding: 'UTF-8' });
}

function generateFrontendServiceFile(microservice: Microservice, serviceImplFilePathName: string) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript',
    ],
  });

  const nodes = (ast as any).program.body;
  const functionNames: string[] = [];
  let methodCount = 0;

  for (const node of nodes) {
    if (node.type === 'ImportDeclaration' && node.source.value === 'backk') {
      node.source.value = 'backk-frontend-utils';
    }

    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      const isInternalService = node.declaration.decorators?.find(
        (decorator: any) => decorator.expression.callee.name === 'AllowServiceForKubeClusterInternalUse'
      );

      if (node.declaration.type !== 'ClassDeclaration') {
        throw new Error(
          serviceImplFilePathName +
            ': Invalid service implementation file. File must contain a single export of service implementation class'
        );
      }

      node.declaration.superClass = undefined;
      node.declaration.decorators = [];
      node.declaration.implements = undefined;
      const serviceClassName = node.declaration.id.name;

      if (serviceClassName.endsWith('Impl')) {
        node.declaration.id.name = serviceClassName.slice(0, -4);
      }

      const [serviceName] =
        Object.entries(microservice).find(
          ([, service]: [string, any]) => service.constructor.name === serviceClassName
        ) ?? [];

      if (!serviceName) {
        break;
      }

      const methods: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassMethod') {
          const functionName = classBodyNode.key.name;

          const argumentName =
            classBodyNode.params?.[0]?.type === 'ObjectPattern'
              ? decapitalizeFirstLetter(classBodyNode.params[0].typeAnnotation.typeAnnotation.typeName.name)
              : classBodyNode.params?.[0]?.name;

          const isGetMethodAllowed = classBodyNode.decorators?.find(
            (decorator: any) => decorator.expression.callee.name === 'AllowHttpGetMethod'
          );

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
            classBodyNode.accessibility === 'protected' ||
            classBodyNode.static ||
            isInternalMethod ||
            (isInternalService && !classBodyNode.decorators)
          ) {
            return;
          }

          const serviceFunctionType = getServiceFunctionType(functionName, classBodyNode.decorators);

          functionNames.push(functionName);
          if (classBodyNode.params?.[0]?.type === 'ObjectPattern') {
            classBodyNode.params[0] = {
              type: 'Identifier',
              name: argumentName,
              typeAnnotation: classBodyNode.params[0].typeAnnotation,
            };
          }
          classBodyNode.static = true;
          classBodyNode.async = true;
          classBodyNode.decorators = [];
          const argumentClassName = classBodyNode.params?.[0]?.typeAnnotation?.typeAnnotation?.typeName?.name;
          classBodyNode.body = {
            type: 'BlockStatement',
            body: [
              ...(argumentName && argumentClassName
                ? [
                    getValidateServiceFunctionArgumentBlock(
                      argumentName,
                      argumentClassName,
                      serviceFunctionType
                    ),
                  ]
                : []),
              getReturnCallOrSendToRemoteServiceStatement(
                serviceName,
                functionName,
                argumentName,
                isGetMethodAllowed,
                [],
                true
              ),
            ],
          };

          methods.push(classBodyNode);
          methodCount++;
        }
      });

      node.declaration.body.body = methods;
    }
  }

  if (methodCount > 0) {
    const code = generate(ast as any).code;
    const destServiceImplFilePathName = serviceImplFilePathName.replace(
      /src\/services/,
      'generated/clients/frontend/' + getNamespacedMicroserviceName()
    );

    const frontEndDestDirPathName = dirname(destServiceImplFilePathName);
    if (!existsSync(frontEndDestDirPathName)) {
      mkdirSync(frontEndDestDirPathName, { recursive: true });
    }

    let outputFileContentsStr =
      '// DO NOT MODIFY THIS FILE! This is an auto-generated file' +
      '\n' +
      "import { callRemoteService, validateServiceFunctionArgumentOrThrow } from 'backk-frontend-utils';" +
      "import EncryptionKeyManager from '../_backk/EncryptionKeyManager';" +
      code;
    let isFirstFunction = true;

    outputFileContentsStr = outputFileContentsStr
      .split('\n')
      .map((outputFileLine) => {
        if (
          !isFirstFunction &&
          functionNames.some((functionName) => outputFileLine.includes(functionName)) &&
          outputFileLine.includes(': PromiseErrorOr<') &&
          outputFileLine.endsWith('{')
        ) {
          return '\n' + outputFileLine;
        }

        if (outputFileLine.startsWith('export default class') || outputFileLine.startsWith('export class')) {
          return '\n' + outputFileLine;
        }

        // noinspection ReuseOfLocalVariableJS
        isFirstFunction = false;
        return outputFileLine;
      })
      .join('\n');

    const destServiceClientFilePathName = destServiceImplFilePathName.endsWith('ServiceImpl.ts')
      ? destServiceImplFilePathName.slice(0, -7) + '.ts'
      : destServiceImplFilePathName;

    writeFileSync(destServiceClientFilePathName, outputFileContentsStr, { encoding: 'UTF-8' });
  }
}

function generateInternalServiceFile(
  microservice: Microservice,
  serviceImplFilePathName: string,
  requestProcessors: RequestProcessor[]
) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript',
    ],
  });

  const nodes = (ast as any).program.body;
  const functionNames: string[] = [];
  let methodCount = 0;

  for (const node of nodes) {
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type !== 'ClassDeclaration') {
        throw new Error(
          serviceImplFilePathName +
            ': Invalid service implementation file. File must contain a single export of service implementation class'
        );
      }

      const isInternalService = node.declaration.decorators?.find(
        (decorator: any) => decorator.expression.callee.name === 'AllowServiceForKubeClusterInternalUse'
      );
      node.declaration.decorators = [];
      node.declaration.superClass = null;
      node.declaration.implements = undefined;
      const serviceClassName = node.declaration.id.name;

      if (serviceClassName.endsWith('Impl')) {
        node.declaration.id.name = serviceClassName.slice(0, -4);
      }

      const [serviceName] =
        Object.entries(microservice).find(
          ([, service]: [string, any]) => service.constructor.name === serviceClassName
        ) ?? [];

      if (!serviceName) {
        break;
      }

      const methods: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassMethod') {
          const functionName = classBodyNode.key.name;
          const argumentName =
            classBodyNode.params?.[0]?.type === 'ObjectPattern'
              ? decapitalizeFirstLetter(classBodyNode.params[0].typeAnnotation.typeAnnotation.typeName.name)
              : classBodyNode.params?.[0]?.name;

          const isGetMethodAllowed = classBodyNode.decorators?.find(
            (decorator: any) => decorator.expression.callee.name === 'AllowHttpGetMethod'
          );

          const isInternalMethod = classBodyNode.decorators?.find(
            (decorator: any) =>
              isInternalService || decorator.expression.callee.name === 'AllowForKubeClusterInternalUse'
          );

          if (
            functionName === 'constructor' ||
            classBodyNode.accessibility === 'private' ||
            classBodyNode.accessibility === 'protected' ||
            classBodyNode.static ||
            !isInternalMethod
          ) {
            return;
          }

          const serviceFunctionType = getServiceFunctionType(functionName, classBodyNode.decorators);
          functionNames.push(functionName);
          if (classBodyNode.params?.[0]?.type === 'ObjectPattern') {
            classBodyNode.params[0] = {
              type: 'Identifier',
              name: argumentName,
              typeAnnotation: classBodyNode.params[0].typeAnnotation,
            };
          }
          classBodyNode.async = true;
          classBodyNode.static = true;
          classBodyNode.decorators = [];
          const argumentClassName = classBodyNode.params?.[0]?.typeAnnotation?.typeAnnotation?.typeName?.name;

          classBodyNode.body = {
            type: 'BlockStatement',
            body: [
              ...(argumentName && argumentClassName
                ? [
                    getValidateServiceFunctionArgumentBlock(
                      argumentName,
                      argumentClassName,
                      serviceFunctionType
                    ),
                  ]
                : []),
              getReturnCallOrSendToRemoteServiceStatement(
                serviceName,
                functionName,
                argumentName,
                isGetMethodAllowed,
                requestProcessors
              ),
            ],
          };
          methods.push(classBodyNode);
          methodCount++;
        }
      });

      node.declaration.body.body = methods;
    }
  }

  if (methodCount > 0) {
    const code = generate(ast as any).code;
    const destServiceImplFilePathName = serviceImplFilePathName.replace(
      /src\/services/,
      'generated/clients/internal/' + getNamespacedMicroserviceName()
    );

    const internalDestDirPathName = dirname(destServiceImplFilePathName);
    if (!existsSync(internalDestDirPathName)) {
      mkdirSync(internalDestDirPathName, { recursive: true });
    }

    let outputFileContentsStr = '// DO NOT MODIFY THIS FILE! This is an auto-generated file' + '\n' +
      "import { callRemoteService, sendToRemoteService, validateServiceFunctionArgumentOrThrow } from 'backk';\n" + code;
    let isFirstFunction = true;

    outputFileContentsStr = outputFileContentsStr
      .split('\n')
      .map((outputFileLine) => {
        if (
          !isFirstFunction &&
          functionNames.some((functionName) => outputFileLine.includes(functionName)) &&
          outputFileLine.includes(': PromiseErrorOr<') &&
          outputFileLine.endsWith('}')
        ) {
          return '\n' + outputFileLine;
        }

        if (outputFileLine.startsWith('export default class') || outputFileLine.startsWith('export class')) {
          return '\n' + outputFileLine;
        }

        // noinspection ReuseOfLocalVariableJS
        isFirstFunction = false;
        return outputFileLine;
      })
      .join('\n');

    const destServiceClientFilePathName = destServiceImplFilePathName.endsWith('ServiceImpl.ts')
      ? destServiceImplFilePathName.slice(0, -7) + '.ts'
      : destServiceImplFilePathName;

    writeFileSync(destServiceClientFilePathName, outputFileContentsStr, { encoding: 'UTF-8' });
  }
}

function createPackageJsonFiles() {
  const npmPackageScope = process.env.GENERATED_CLIENTS_NPM_PACKAGE_SCOPE ?? process.env.SERVICE_NAMESPACE;
  const frontEndClientPackageName = getMicroserviceName() + '-frontend-client';
  const frontEndClientPackageJsonObj = {
    name:
      npmPackageScope === 'default'
        ? frontEndClientPackageName
        : `@${npmPackageScope}/${frontEndClientPackageName}`,
    version: '1.0.0',
    files: ['lib'],
    scripts: {
      prebuild: 'rimraf lib',
      build: 'tsc -p tsconfig.json',
    },
    devDependencies: {
      'backk-frontend-utils': '^1.0.0',
      '@types/node': '13.13.48',
      rimraf: '^3.0.2',
      typescript: '3.9.9',
    },
  };

  const frontEndClientDirPathName =
    process.cwd() + '/generated/clients/frontend/' + getNamespacedMicroserviceName();
  if (!existsSync(frontEndClientDirPathName)) {
    mkdirSync(frontEndClientDirPathName, { recursive: true });
  }
  writeFileSync(
    frontEndClientDirPathName + '/package.json',
    JSON.stringify(frontEndClientPackageJsonObj, null, 2)
  );

  const internalClientPackageJsonObj = frontEndClientPackageJsonObj;
  const internalClientPackageName = getMicroserviceName() + '-internal-client';
  internalClientPackageJsonObj.name =
    npmPackageScope === 'default'
      ? internalClientPackageName
      : `@${npmPackageScope}/${internalClientPackageName}`;

  const internalClientDirPathName =
    process.cwd() + '/generated/clients/internal/' + getNamespacedMicroserviceName();
  if (!existsSync(internalClientDirPathName)) {
    mkdirSync(internalClientDirPathName, { recursive: true });
  }
  writeFileSync(
    internalClientDirPathName + '/package.json',
    JSON.stringify(internalClientPackageJsonObj, null, 2)
  );
}

function createGitIgnoreFiles() {
  const gitIgnoreFileContent = 'lib/\nnode_modules/';

  writeFileSync(
    process.cwd() + '/generated/clients/frontend/' + getNamespacedMicroserviceName() + '/.gitignore',
    gitIgnoreFileContent
  );

  writeFileSync(
    process.cwd() + '/generated/clients/internal/' + getNamespacedMicroserviceName() + '/.gitignore',
    gitIgnoreFileContent
  );
}

function createTsConfigFiles() {
  const frontendTsConfigFileContent = {
    compilerOptions: {
      module: 'commonjs',
      declaration: true,
      removeComments: true,
      esModuleInterop: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      target: 'es6',
      sourceMap: true,
      strict: true,
      outDir: './lib',
      baseUrl: './',
      incremental: true,
    },

    include: ['**/*.ts'],
    exclude: ['node_modules', 'lib'],
  };

  writeFileSync(
    process.cwd() + '/generated/clients/frontend/' + getNamespacedMicroserviceName() + '/tsconfig.json',
    JSON.stringify(frontendTsConfigFileContent, null, 2)
  );

  const internalTsConfigFileContent = frontendTsConfigFileContent;
  internalTsConfigFileContent.compilerOptions.target = 'es2019';

  writeFileSync(
    process.cwd() + '/generated/clients/internal/' + getNamespacedMicroserviceName() + '/tsconfig.json',
    JSON.stringify(internalTsConfigFileContent, null, 2)
  );
}

export default async function generateClients(
  microservice: Microservice,
  publicServicesMetadata: ServiceMetadata[],
  internalServicesMetadata: ServiceMetadata[],
  requestProcessors: RequestProcessor[]
) {
  if (!existsSync('src/services')) {
    return;
  }

  rimraf.sync('generated/clients');
  const directoryEntries = readdirSync('src/services', { withFileTypes: true });

  directoryEntries.forEach((directoryEntry: Dirent) => {
    const serviceDirectory = resolve('src/services', directoryEntry.name);
    if (!directoryEntry.isDirectory()) {
      return;
    }

    const serviceDirectoryEntries = readdirSync(serviceDirectory, { withFileTypes: true });
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

    const serviceClassName = serviceImplFileDirEntry.name.split('.ts')[0];
    const [serviceName] =
      Object.entries(microservice).find(
        ([, service]: [string, any]) =>
          service.constructor.name === serviceClassName &&
          !(
            serviceClassName.includes('AuditLoggingService') ||
            serviceClassName.includes('CaptchaVerificationService') ||
            serviceClassName.includes('LivenessCheckService') ||
            serviceClassName.includes('ReadinessCheckService') ||
            serviceClassName.includes('StartupCheckService') ||
            serviceClassName.includes('ResponseCacheConfigService') ||
            serviceClassName.includes('AuthorizationService')
          )
      ) ?? [];

    if (!serviceName) {
      return;
    }

    const foundPublicServiceMetadata = publicServicesMetadata.find(
      (serviceMetadata) => serviceMetadata.serviceName === serviceName
    );
    const publicTypeNames = Object.keys(foundPublicServiceMetadata?.types ?? []);

    const foundInternalServiceMetadata = internalServicesMetadata.find(
      (serviceMetadata) => serviceMetadata.serviceName === serviceName
    );
    const internalTypeNames = Object.keys(foundInternalServiceMetadata?.types ?? []);

    const typeFilePathNames = getFileNamesRecursively(serviceDirectory);
    typeFilePathNames
      .filter((typeFilePathName) => typeFilePathName.endsWith('.ts'))
      .forEach((typeFilePathName) => {
        const typeFileName = typeFilePathName.split('/').pop();
        const typeName = typeFileName?.split('.')[0];

        if (typeName && publicTypeNames.includes(typeName)) {
          const frontEndDestTypeFilePathName = typeFilePathName.replace(
            /src\/services/,
            'generated/clients/frontend/' + getNamespacedMicroserviceName()
          );

          const frontEndDestDirPathName = dirname(frontEndDestTypeFilePathName);

          if (!existsSync(frontEndDestDirPathName)) {
            mkdirSync(frontEndDestDirPathName, { recursive: true });
          }

          rewriteTypeFile(typeFilePathName, frontEndDestTypeFilePathName, 'frontend', publicTypeNames);
        }

        if (typeName && internalTypeNames.includes(typeName)) {
          const internalDestTypeFilePathName = typeFilePathName.replace(
            /src\/services/,
            'generated/clients/internal/' + getNamespacedMicroserviceName()
          );

          const internalDestDirPathName = dirname(internalDestTypeFilePathName);

          if (!existsSync(internalDestDirPathName)) {
            mkdirSync(internalDestDirPathName, { recursive: true });
          }

          rewriteTypeFile(typeFilePathName, internalDestTypeFilePathName, 'internal', internalTypeNames);
        }
      });

    const baseServiceDir =
      process.cwd() + '/generated/clients/frontend/' + getNamespacedMicroserviceName() + '/_backk';
    if (!existsSync(baseServiceDir)) {
      mkdirSync(baseServiceDir);
    }
    const baseServiceFilePathName = baseServiceDir + '/EncryptionKeyManager.ts';
    const baseServiceCode = `
    export default class EncryptionKeyManager {
      static accessTokenStorageEncryptionKey: string;
      static setAccessTokenStorageEncryptionKey(encryptionKey: string): void {
        EncryptionKeyManager.accessTokenStorageEncryptionKey = encryptionKey;
      }
    }`;
    writeFileSync(baseServiceFilePathName, baseServiceCode, { encoding: 'UTF-8' });
    const serviceImplFilePathName = resolve(serviceDirectory, serviceImplFileDirEntry.name);
    generateFrontendServiceFile(microservice, serviceImplFilePathName);
    generateInternalServiceFile(microservice, serviceImplFilePathName, requestProcessors);
  });

  createPackageJsonFiles();
  createGitIgnoreFiles();
  createTsConfigFiles();
  await promisifiedExec(process.cwd() + '/node_modules/.bin/prettier --write generated/clients');
}
