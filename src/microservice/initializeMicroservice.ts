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
import AbstractDataStore from '../datastore/AbstractDataStore';
import log, { Severity } from '../observability/logging/log';
import { BACKK_ERRORS } from '../errors/backkErrors';

export interface MicroserviceInitOptions {
  generatePostmanTestFile?: boolean;
  generatePostmanApiFile?: boolean;
}

export default function initializeMicroservice(
  microservice: any,
  dataStore: AbstractDataStore,
  microserviceInitOptions?: MicroserviceInitOptions,
  remoteServiceRootDir = ''
) {
  const serviceNameToServiceEntries = Object.entries(microservice).filter(
    ([, service]: [string, any]) => service instanceof BaseService || remoteServiceRootDir
  );

  if (serviceNameToServiceEntries.length === 0) {
    throw new Error(microservice.constructor + ': No services defined. Services must extend from BaseService.');
  }

  if (!remoteServiceRootDir) {
    const servicesUniqueByDataStore = _.uniqBy(serviceNameToServiceEntries, ([, service]: [string, any]) =>
      service.getDataStore()
    );

    if (servicesUniqueByDataStore.length > 1) {
      throw new Error('Services can use only one same database manager');
    }
  }

  serviceNameToServiceEntries.forEach(([serviceName]: [string, any]) => {
    if (serviceName === 'metadataService') {
      throw new Error('metadataService is a reserved internal service name.');
    }

    const [
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    ] = parseServiceFunctionNameToArgAndReturnTypeNameMaps(
      microservice[serviceName].constructor,
      serviceName,
      getSrcFilePathNameForTypeName(
        serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
        remoteServiceRootDir
      ),
      remoteServiceRootDir
    );

    microservice[`${serviceName}__BackkTypes__`] = {
      serviceDocumentation,
      functionNameToParamTypeNameMap,
      functionNameToReturnTypeNameMap,
      functionNameToDocumentationMap
    };
  });

  generateTypesForServices(microservice, remoteServiceRootDir);

  Object.entries(microservice)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .forEach(([serviceName]: [string, any]) => {
      getNestedClasses(
        Object.keys(microservice[serviceName].Types ?? {}),
        microservice[serviceName].Types,
        microservice[serviceName].PublicTypes,
        remoteServiceRootDir
      );

      Object.entries(microservice[serviceName].Types ?? {}).forEach(([, typeClass]: [string, any]) => {
        setClassPropertyValidationDecorators(
          typeClass,
          serviceName,
          microservice[serviceName].Types,
          remoteServiceRootDir
        );

        setNestedTypeValidationDecorators(typeClass);
      }, {});
    });

  const servicesMetadata = generateServicesMetadata(microservice, dataStore, remoteServiceRootDir);

  if (!remoteServiceRootDir) {
    microservice.servicesMetadata = servicesMetadata;
    microservice.publicServicesMetadata = servicesMetadata.map((serviceMetadata) => {
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

    microservice.publicServicesMetadata = {
      servicesMetadata: microservice.publicServicesMetadata,
      genericErrors: BACKK_ERRORS
    };

    if (process.env.NODE_ENV === 'development' && (microserviceInitOptions?.generatePostmanTestFile ?? true)) {
      writeTestsPostmanCollectionExportFile(microservice, servicesMetadata);
    }
    if (process.env.NODE_ENV === 'development' && (microserviceInitOptions?.generatePostmanApiFile ?? true)) {
      writeApiPostmanCollectionExportFile(microservice, servicesMetadata);
    }

    const serviceNames = Object.entries(microservice)
      .filter(([, service]: [string, any]) => service instanceof BaseService)
      .map(([serviceName]) => serviceName)
      .join(', ');

    log(Severity.INFO, 'Services initialized', serviceNames);
  }
}
