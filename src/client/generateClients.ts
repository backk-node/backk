import { Dirent, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { parseSync } from '@babel/core';
import { exec } from 'child_process';
import util from 'util';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import generate from '@babel/generator';
import { getFileNamesRecursively } from '../utils/file/getSrcFilePathNameForTypeName';
import getMicroserviceName from '../utils/getMicroserviceName';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import Microservice from '../microservice/Microservice';
import AuditLoggingService from '../observability/logging/audit/AuditLoggingService';
import CaptchaVerificationService from '../captcha/CaptchaVerificationService';
import ReadinessCheckService from '../services/ReadinessCheckService';
import LivenessCheckService from '../services/LivenessCheckService';
import StartupCheckService from '../services/startup/StartupCheckService';
import ResponseCacheConfigService from '../cache/ResponseCacheConfigService';
import AuthorizationService from '../authorization/AuthorizationService';
import decapitalizeFirstLetter from '../utils/string/decapitalizeFirstLetter';

const promisifiedExec = util.promisify(exec);

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

function rewriteTypeFile(
  typeFilePathName: string,
  destTypeFilePathName: string,
  clientType: 'frontend' | 'internal',
  execPromises: Array<Promise<any>>
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
    if (clientType === 'frontend' && node.type === 'ImportDeclaration' && node.source.value === 'backk') {
      needsRewrite = true;
      node.source.value = 'backk-frontend-utils';
    }

    if (node.type === 'TypeAlias') {
      needsRewrite = true;
    }

    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      const classBodyNodes: any[] = [];
      node.declaration.decorators = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        const isPrivate = classBodyNode.decorators?.find(
          (decorator: any) => decorator.expression.callee.name === 'Private'
        );

        if (classBodyNode.type === 'ClassProperty' && isPrivate) {
          needsRewrite = true;
          return;
        }

        classBodyNode.decorators = classBodyNode.decorators?.filter((decorator: any) => {
          const decoratorName = decorator.expression.callee.name;
          const shouldRemove = [
            'CreateOnly',
            'ReadOnly',
            'ReadUpdate',
            'ReadWrite',
            'UpdateOnly',
            'WriteOnly',
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
            'Unique'
          ].includes(decoratorName);

          if (shouldRemove) {
            needsRewrite = true;
          }

          return !shouldRemove;
        });
        classBodyNodes.push(classBodyNode);
      });
      node.declaration.body.body = classBodyNodes;
    }
  }

  if (needsRewrite) {
    const code = generate(ast as any).code;

    let outputFileContentsStr = '// DO NOT MODIFY THIS FILE! This is an auto-generated file' + '\n' + code;

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

    const organizeImportsExecPromise = promisifiedExec(
      process.cwd() + '/node_modules/.bin/prettier --write ' + destTypeFilePathName
    );

    execPromises.push(organizeImportsExecPromise);
  }
}

function generateFrontendServiceFile(serviceImplFilePathName: string, execPromises: Array<Promise<any>>) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
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

      node.declaration.decorators = undefined;
      node.declaration.superClass = null;
      const serviceName = node.declaration.id.name[0].toLowerCase() + node.declaration.id.name.slice(1);
      if (serviceName.endsWith('Impl')) {
        node.declaration.id.name = node.declaration.id.name.slice(0, -4);
      }

      const methods: any[] = [];
      node.declaration.body.body.forEach((classBodyNode: any) => {
        if (classBodyNode.type === 'ClassMethod') {
          const functionName = classBodyNode.key.name;

          const argumentName =
            classBodyNode.params?.[0]?.type === 'ObjectPattern'
              ? decapitalizeFirstLetter(classBodyNode.params?.[0]?.typeAnnotation.typeAnnotation.id.name)
              : classBodyNode.params?.[0]?.name;

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
            isInternalMethod || isInternalService && !classBodyNode.decorators
          ) {
            return;
          }

          functionNames.push(functionName);
          classBodyNode.async = false;
          classBodyNode.decorators = [];
          classBodyNode.body = {
            type: 'BlockStatement',
            body: [getFrontendReturnFetchStatement(serviceName, functionName, argumentName)]
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

    let outputFileContentsStr = '// DO NOT MODIFY THIS FILE! This is an auto-generated file' + '\n' + code;
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

    const organizeImportsExecPromise = promisifiedExec(
      process.cwd() + '/node_modules/.bin/prettier --write ' + destServiceClientFilePathName
    );

    execPromises.push(organizeImportsExecPromise);
  }
}

function generateInternalServiceFile(serviceImplFilePathName: string, execPromises: Array<Promise<any>>) {
  const serviceImplFileContentsStr = readFileSync(serviceImplFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(serviceImplFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript'
    ]
  });

  const nodes = (ast as any).program.body;
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
      node.declaration.decorators = undefined;
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

          classBodyNode.async = false;
          classBodyNode.decorators = [];
          classBodyNode.body = {
            type: 'BlockStatement',
            body: [getInternalReturnFetchStatement(serviceName, functionName, argumentName)]
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

    let outputFileContentsStr = '// DO NOT MODIFY THIS FILE! This is an auto-generated file' + '\n' + code;

    outputFileContentsStr = outputFileContentsStr
      .split('\n')
      .map((outputFileLine) => {
        if (outputFileLine.startsWith('export default class') || outputFileLine.startsWith('export class')) {
          return '\n' + outputFileLine;
        }
        return outputFileLine;
      })
      .join('\n');

    const destServiceClientFilePathName = destServiceImplFilePathName.endsWith('ServiceImpl.ts')
      ? destServiceImplFilePathName.slice(0, -7) + '.ts'
      : destServiceImplFilePathName;

    writeFileSync(destServiceClientFilePathName, outputFileContentsStr, { encoding: 'UTF-8' });

    const organizeImportsExecPromise = promisifiedExec(
      process.cwd() + '/node_modules/.bin/prettier --write ' + destServiceClientFilePathName
    );

    execPromises.push(organizeImportsExecPromise);
  }
}

export default async function generateClients(
  microservice: Microservice,
  publicServicesMetadata: ServiceMetadata[],
  internalServicesMetadata: ServiceMetadata[]
) {
  if (!existsSync('src/services')) {
    return;
  }

  const generatedClientsFiles = getFileNamesRecursively('generated/clients');
  generatedClientsFiles.forEach((generatedClientFile) => {
    unlinkSync(generatedClientFile);
  });

  const execPromises: Array<Promise<any>> = [];
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

          rewriteTypeFile(typeFilePathName, frontEndDestTypeFilePathName, 'frontend', execPromises);
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

          rewriteTypeFile(typeFilePathName, internalDestTypeFilePathName, 'internal', execPromises);
        }
      });

    const serviceImplFilePathName = resolve(serviceDirectory, serviceImplFileDirEntry.name);
    generateFrontendServiceFile(serviceImplFilePathName, execPromises);
    generateInternalServiceFile(serviceImplFilePathName, execPromises);
  });

  await Promise.all(execPromises);
}
