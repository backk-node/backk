import _ from 'lodash';
import BaseService from '../service/BaseService';
import generateServicesMetadata from '../metadata/generateServicesMetadata';
import parseServiceFunctionNameToArgAndReturnTypeNameMaps from '../typescript/parser/parseServiceFunctionNameToArgAndReturnTypeNameMaps';
import getSrcFilePathNameForTypeName from '../utils/file/getSrcFilePathNameForTypeName';
import setClassPropertyValidationDecorators from '../validation/setClassPropertyValidationDecorators';
import setNestedTypeValidationDecorators from '../validation/setNestedTypeValidationDecorators';
import writeTestsPostmanCollectionExportFile from '../postman/writeTestsPostmanCollectionExportFile';
import writeApiPostmanCollectionExportFile from '../postman/writeApiPostmanCollectionExportFile';
import generateTypesForServices from '../metadata/generateTypesForServices';
import getNestedClasses from '../metadata/getNestedClasses';
import AbstractDbManager from '../dbmanager/AbstractDbManager';
import log, { Severity } from '../observability/logging/log';
import { BACKK_ERRORS } from '../errors/backkErrors';

export interface ControllerInitOptions {
  generatePostmanTestFile?: boolean;
  generatePostmanApiFile?: boolean;
}

export default function initializeController(
  controller: any,
  dbManager: AbstractDbManager,
  controllerInitOptions?: ControllerInitOptions,
  remoteServiceRootDir = ''
) {
  const serviceNameToServiceEntries = Object.entries(controller).filter(
    ([, service]: [string, any]) => service instanceof BaseService || remoteServiceRootDir
  );

  if (serviceNameToServiceEntries.length === 0) {
    throw new Error(controller.constructor + ': No services defined. Services must extend from BaseService.');
  }

  if (!remoteServiceRootDir) {
    const servicesUniqueByDbManager = _.uniqBy(serviceNameToServiceEntries, ([, service]: [string, any]) =>
      service.getDbManager()
    );

    if (servicesUniqueByDbManager.length > 1) {
      throw new Error('Services can use only one same database manager');
    }
  }

  serviceNameToServiceEntries.forEach(([serviceName]: [string, any]) => {
    if (serviceName === 'metadataService') {
      throw new Error('metadataService is a reserved internal service name.');
    } else if (serviceName === 'livenessCheckService') {
      throw new Error('livenessCheckService is a reserved internal service name.');
    }

    const [
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    ] = parseServiceFunctionNameToArgAndReturnTypeNameMaps(
      controller[serviceName].constructor,
      serviceName,
      getSrcFilePathNameForTypeName(
        serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
        remoteServiceRootDir
      ),
      remoteServiceRootDir
    );

    controller[`${serviceName}__BackkTypes__`] = {
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    };
  });

  generateTypesForServices(controller, remoteServiceRootDir);

  Object.entries(controller)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .forEach(([serviceName]: [string, any]) => {
      getNestedClasses(
        Object.keys(controller[serviceName].Types ?? {}),
        controller[serviceName].Types,
        controller[serviceName].PublicTypes,
        remoteServiceRootDir
      );

      Object.entries(controller[serviceName].Types ?? {}).forEach(([, typeClass]: [string, any]) => {
        setClassPropertyValidationDecorators(
          typeClass,
          serviceName,
          controller[serviceName].Types,
          remoteServiceRootDir
        );

        setNestedTypeValidationDecorators(typeClass);
      }, {});
    });

  const servicesMetadata = generateServicesMetadata(controller, dbManager, remoteServiceRootDir);

  if (!remoteServiceRootDir) {
    controller.servicesMetadata = servicesMetadata;
    controller.publicServicesMetadata = servicesMetadata.map((serviceMetadata) => {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        types, // NOSONAR
        publicTypes,
        serviceName,
        functions,
        validations,
        propertyModifiers,
        serviceDocumentation,
        typeReferences,
        typesDocumentation
      } = serviceMetadata;
      return {
        serviceName,
        serviceDocumentation,
        functions,
        types: publicTypes,
        propertyModifiers,
        typesDocumentation,
        typeReferences,
        validations
      };
    });

    controller.publicServicesMetadata = {
      servicesMetadata: controller.publicServicesMetadata,
      genericErrors: BACKK_ERRORS
    };

    if (process.env.NODE_ENV === 'development' && (controllerInitOptions?.generatePostmanTestFile ?? true)) {
      writeTestsPostmanCollectionExportFile(controller, servicesMetadata);
    }
    if (process.env.NODE_ENV === 'development' && (controllerInitOptions?.generatePostmanApiFile ?? true)) {
      writeApiPostmanCollectionExportFile(controller, servicesMetadata);
    }

    const serviceNames = Object.entries(controller)
      .filter(([, service]: [string, any]) => service instanceof BaseService)
      .map(([serviceName]) => serviceName)
      .join(', ');

    log(Severity.INFO, 'Services initialized', serviceNames);
  }
}
