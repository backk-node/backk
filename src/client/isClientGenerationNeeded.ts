import { parseSync } from '@babel/core';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import Microservice from '../microservice/Microservice';
import types from '../types/types';
import parseEnumValuesFromSrcFile from '../typescript/parser/parseEnumValuesFromSrcFile';
import getSrcFilePathNameForTypeName, {
  getFileNamesRecursively,
} from '../utils/file/getSrcFilePathNameForTypeName';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';

function isGenerationNeededDueToTypeFileChange(
  typeFilePathName: string,
  destTypeFilePathName: string,
  clientType: 'frontend' | 'internal',
  typeNames: string[]
): boolean {
  const typeFileContentsStr = readFileSync(typeFilePathName, { encoding: 'UTF-8' });

  const ast = parseSync(typeFileContentsStr, {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-typescript',
    ],
  });

  const nodes = (ast as any).program.body;
  for (const node of nodes) {
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
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

          if (
            isGenerationNeededDueToTypeFileChange(
              typeFilePathName,
              destTypeFilePathName,
              clientType,
              typeNames
            )
          ) {
            return true;
          }
        }
      });
    }
  }

  const typeFileStats = statSync(typeFilePathName);
  if (existsSync(destTypeFilePathName)) {
    const destTypeFileStats = statSync(destTypeFilePathName);
    if (typeFileStats.mtimeMs > destTypeFileStats.mtimeMs) {
      return true;
    }
  }

  return false;
}

export default function isClientGenerationNeeded(
  microservice: Microservice,
  publicServicesMetadata: ServiceMetadata[],
  internalServicesMetadata: ServiceMetadata[]
): boolean {
  if (!existsSync('src/services')) {
    return false;
  }
  const directoryEntries = readdirSync('src/services', { withFileTypes: true });

  for (const directoryEntry of directoryEntries) {
    const serviceDirectory = resolve('src/services', directoryEntry.name);
    if (!directoryEntry.isDirectory()) {
      continue;
    }

    const serviceDirectoryEntries = readdirSync(serviceDirectory, { withFileTypes: true });
    const serviceFileDirEntry = serviceDirectoryEntries.find((serviceDirectoryEntry) =>
      serviceDirectoryEntry.name.endsWith('Service.ts')
    );

    if (!serviceFileDirEntry) {
      continue;
    }

    const serviceClassName = serviceFileDirEntry.name.split('.ts')[0];
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
      continue;
    }

    const serviceFilePathName = resolve(serviceDirectory, serviceFileDirEntry.name);
    const destServiceFilePathName1 = serviceFilePathName.replace(
      /src\/services/,
      'generated/clients/frontend/' + getNamespacedMicroserviceName()
    );
    const destServiceFilePathName2 = serviceFilePathName.replace(
      /src\/services/,
      'generated/clients/internal/' + getNamespacedMicroserviceName()
    );

    const serviceFileStats = statSync(serviceFilePathName);
    const existsDestServiceFile1 = existsSync(destServiceFilePathName1);

    if (existsDestServiceFile1) {
      const destServiceFile1Stats = statSync(destServiceFilePathName1);
      if (serviceFileStats.mtimeMs > destServiceFile1Stats.mtimeMs) {
        return true;
      }
    }

    const existsDestServiceFile2 = existsSync(destServiceFilePathName2);
    if (existsDestServiceFile2) {
      const destServiceFile2Stats = statSync(destServiceFilePathName2);
      if (serviceFileStats.mtimeMs > destServiceFile2Stats.mtimeMs) {
        return true;
      }
    }

    if (!existsDestServiceFile1 && !existsDestServiceFile2) {
      return true;
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

          if (
            isGenerationNeededDueToTypeFileChange(
              typeFilePathName,
              frontEndDestTypeFilePathName,
              'frontend',
              publicTypeNames
            )
          ) {
            return true;
          }
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

          if (
            isGenerationNeededDueToTypeFileChange(
              typeFilePathName,
              internalDestTypeFilePathName,
              'internal',
              internalTypeNames
            )
          ) {
            return true;
          }
        }
      });
  }

  return false;
}
