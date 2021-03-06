import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Base64 } from 'js-base64';
import { sign } from 'jsonwebtoken';
import _ from 'lodash';
import path from 'path';
import YAML from 'yaml';
import { HttpStatusCodes } from '../constants/constants';
import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import serviceAnnotationContainer from '../decorators/service/serviceAnnotationContainer';
import { FunctionMetadata } from '../metadata/types/FunctionMetadata';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import CrudEntityService from '../services/crudentity/CrudEntityService';
import isCreateFunction from '../services/crudentity/utils/isCreateFunction';
import isDeleteFunction from '../services/crudentity/utils/isDeleteFunction';
import isReadFunction from '../services/crudentity/utils/isReadFunction';
import isUpdateFunction from '../services/crudentity/utils/isUpdateFunction';
import throwException from '../utils/exception/throwException';
import { getFileNamesRecursively } from '../utils/file/getSrcFilePathNameForTypeName';
import getNamespacedMicroserviceName from '../utils/getNamespacedMicroserviceName';
import addCustomTest from './addCustomTest';
import createPostmanCollectionItem from './createPostmanCollectionItem';
import getServiceFunctionTestArgument from './getServiceFunctionTestArgument';
import getServiceFunctionTests from './getServiceFunctionTests';
import tryValidateIntegrationTests from './tryValidateIntegrationTests';

export default function writeTestsPostmanCollectionExportFile<T>(
  controller: T,
  servicesMetadata: ServiceMetadata[]
) {
  let items: any[] = [];
  const itemGroups: object[] = [];
  const testFilePathNames = getFileNamesRecursively(process.cwd() + '/integrationtests');

  const writtenTests = _.flatten(
    testFilePathNames.map((testFilePathName) => {
      const testFileContents = readFileSync(testFilePathName, { encoding: 'UTF-8' });
      const fileType = testFilePathName.endsWith('json') ? 'json' : 'yaml';
      let writtenTestsInFile;
      try {
        writtenTestsInFile =
          fileType === 'json' ? JSON.parse(testFileContents) : YAML.parse(testFileContents);
      } catch (error) {
        throw new Error('Failed to parse file: ' + testFilePathName);
      }
      return Array.isArray(writtenTestsInFile)
        ? writtenTestsInFile.map((writtenTest: any) => ({
            ...writtenTest,
            serviceName: path.basename(path.dirname(testFilePathName)),
            testFileName: path.basename(testFilePathName).split('.')[0],
          }))
        : [];
    })
  );

  tryValidateIntegrationTests(writtenTests, servicesMetadata);

  servicesMetadata
    .filter(
      (serviceMetadata) => (controller as any)[serviceMetadata.serviceName] instanceof CrudEntityService
    )
    .forEach((serviceMetadata: ServiceMetadata) => {
      const foundDeleteAllFunction = serviceMetadata.functions.find(
        (func) =>
          func.functionName.startsWith('deleteAll') ||
          func.functionName.startsWith('destroyAll') ||
          func.functionName.startsWith('eraseAll')
      );

      if (foundDeleteAllFunction) {
        const tests = getServiceFunctionTests(
          (controller as any)[serviceMetadata.serviceName].constructor,
          (controller as any)[serviceMetadata.serviceName].Types,
          serviceMetadata,
          foundDeleteAllFunction,
          false
        );

        const sampleArg = getServiceFunctionTestArgument(
          (controller as any)[serviceMetadata.serviceName].constructor,
          (controller as any)[serviceMetadata.serviceName].Types,
          foundDeleteAllFunction.functionName,
          foundDeleteAllFunction.argType,
          serviceMetadata,
          false
        );

        const item = createPostmanCollectionItem(
          (controller as any)[serviceMetadata.serviceName].constructor,
          serviceMetadata,
          foundDeleteAllFunction,
          sampleArg,
          tests
        );

        items.push(item);
      }
    });

  itemGroups.push({
    name: 'Cleanup (0)',
    item: items.map((item, index) => ({ ...item, name: item.name + ` (0.${index + 1})` })),
  });

  servicesMetadata.forEach((serviceMetadata: ServiceMetadata, serviceIndex) => {
    // noinspection ReuseOfLocalVariableJS
    const functionItemGroups: object[] = [];

    let updateCount = 0;

    if (
      serviceAnnotationContainer.hasNoAutoTestsAnnotationForServiceClass(
        (controller as any)[serviceMetadata.serviceName].constructor
      )
    ) {
      return;
    }

    let lastReadFunctionMetadata: FunctionMetadata | undefined;
    let createFunctionMetadata: FunctionMetadata | undefined;
    // noinspection FunctionWithMoreThanThreeNegationsJS,FunctionWithMoreThanThreeNegationsJS,OverlyComplexFunctionJS,FunctionTooLongJS
    serviceMetadata.functions.forEach((functionMetadata: FunctionMetadata, functionIndex: number) => {
      // noinspection ReuseOfLocalVariableJS
      items = [];

      writtenTests
        .filter(
          ({ testTemplate: { before, executeLast } }) =>
            !executeLast &&
            before?.toLowerCase() ===
              (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase()
        )
        .forEach((writtenTest) => {
          addCustomTest(writtenTest, controller, servicesMetadata, items);
        });

      if (
        serviceFunctionAnnotationContainer.hasNoAutoTests(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        ) ||
        serviceFunctionAnnotationContainer.hasOnStartUp(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        ) ||
        serviceFunctionAnnotationContainer.isSubscription(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        return;
      }

      const testSetupServiceFunctionsOrSpecsToExecute = serviceFunctionAnnotationContainer.getTestSetup(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      testSetupServiceFunctionsOrSpecsToExecute?.forEach((serviceFunctionOrSpec, testSpecIndex) => {
        const [serviceName, functionName] =
          typeof serviceFunctionOrSpec === 'string'
            ? serviceFunctionOrSpec.split('.')
            : serviceFunctionOrSpec.serviceFunctionName.split('.');

        const foundServiceMetadata = servicesMetadata.find(
          (serviceMetadata) => serviceMetadata.serviceName === serviceName
        );

        const foundFunctionMetadata = foundServiceMetadata?.functions.find(
          (func) => func.functionName === functionName
        );

        if (!foundServiceMetadata || !foundFunctionMetadata) {
          throw new Error(
            'Invalid service function name in @TestSetup annotation in ' +
              serviceMetadata.serviceName +
              '.' +
              functionMetadata.functionName
          );
        }

        const expectedResponseStatusCode =
          serviceFunctionAnnotationContainer.getResponseStatusCodeForServiceFunction(
            (controller as any)[foundServiceMetadata.serviceName].constructor,
            foundFunctionMetadata.functionName
          );

        const expectedResponseFieldPathNameToFieldValueMapInTests =
          serviceFunctionAnnotationContainer.getExpectedResponseValueFieldPathNameToFieldValueMapForTests(
            (controller as any)[foundServiceMetadata.serviceName].constructor,
            foundFunctionMetadata.functionName
          );

        let tests;

        if (
          typeof serviceFunctionOrSpec === 'string' ||
          (typeof serviceFunctionOrSpec === 'object' && !serviceFunctionOrSpec.postmanTests)
        ) {
          tests = getServiceFunctionTests(
            (controller as any)[foundServiceMetadata.serviceName].constructor,
            (controller as any)[foundServiceMetadata.serviceName].Types,
            foundServiceMetadata,
            foundFunctionMetadata,
            false,
            expectedResponseStatusCode,
            expectedResponseFieldPathNameToFieldValueMapInTests
          );
        } else if (serviceFunctionOrSpec.postmanTests) {
          tests = {
            id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
            listen: 'test',
            script: {
              id: serviceMetadata.serviceName + '.' + functionMetadata.functionName,
              exec: [
                'let response = pm.response.json(); response = response.data || response;',
                ...serviceFunctionOrSpec.postmanTests.map(
                  (test: string) =>
                    `pm.test("test", function () {
  ${test} 
})`
                ),
              ],
            },
          };
        }

        const sampleArg = getServiceFunctionTestArgument(
          (controller as any)[foundServiceMetadata.serviceName].constructor,
          (controller as any)[foundServiceMetadata.serviceName].Types,
          foundFunctionMetadata.functionName,
          foundFunctionMetadata.argType,
          foundServiceMetadata,
          false
        );

        const item = createPostmanCollectionItem(
          (controller as any)[foundServiceMetadata.serviceName].constructor,
          foundServiceMetadata,
          foundFunctionMetadata,
          typeof serviceFunctionOrSpec === 'object' && serviceFunctionOrSpec.argument
            ? { ...sampleArg, ...serviceFunctionOrSpec.argument }
            : sampleArg,
          tests,
          typeof serviceFunctionOrSpec === 'object' ? serviceFunctionOrSpec?.setupStepName : undefined
        );

        items.push({ ...item, name: (testSpecIndex === 0 ? 'GIVEN ' : 'AND ') + item.name });
      });

      const isCreate = isCreateFunction(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      if (isCreate) {
        createFunctionMetadata = functionMetadata;
      }

      if (
        isReadFunction(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        lastReadFunctionMetadata = functionMetadata;
      }

      const expectedResponseStatusCode =
        serviceFunctionAnnotationContainer.getResponseStatusCodeForServiceFunction(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        );

      const expectedResponseFieldPathNameToFieldValueMapInTests =
        serviceFunctionAnnotationContainer.getExpectedResponseValueFieldPathNameToFieldValueMapForTests(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        );

      if (
        isUpdateFunction(
          (controller as any)[serviceMetadata.serviceName].constructor,
          functionMetadata.functionName
        )
      ) {
        updateCount++;
      }

      const updateType = serviceFunctionAnnotationContainer.getUpdateTypeForServiceFunction(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      const isUpdate = isUpdateFunction(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      const isDelete = isDeleteFunction(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      if (
        isDelete &&
        functionIndex !== 0 &&
        isDeleteFunction(
          (controller as any)[serviceMetadata.serviceName].constructor,
          serviceMetadata.functions[functionIndex - 1].functionName
        ) &&
        createFunctionMetadata &&
        !testSetupServiceFunctionsOrSpecsToExecute
      ) {
        const createFunctionTests = getServiceFunctionTests(
          (controller as any)[serviceMetadata.serviceName].constructor,
          (controller as any)[serviceMetadata.serviceName].Types,
          serviceMetadata,
          createFunctionMetadata,
          false,
          undefined,
          expectedResponseFieldPathNameToFieldValueMapInTests
        );

        const createFunctionSampleArg = getServiceFunctionTestArgument(
          (controller as any)[serviceMetadata.serviceName].constructor,
          (controller as any)[serviceMetadata.serviceName].Types,
          createFunctionMetadata.functionName,
          createFunctionMetadata.argType,
          serviceMetadata
        );

        items.push(
          createPostmanCollectionItem(
            (controller as any)[serviceMetadata.serviceName].constructor,
            serviceMetadata,
            createFunctionMetadata,
            createFunctionSampleArg,
            createFunctionTests
          )
        );
      }

      const sampleArg = getServiceFunctionTestArgument(
        (controller as any)[serviceMetadata.serviceName].constructor,
        (controller as any)[serviceMetadata.serviceName].Types,
        functionMetadata.functionName,
        functionMetadata.argType,
        serviceMetadata,
        isUpdate,
        updateCount
      );

      const tests = getServiceFunctionTests(
        (controller as any)[serviceMetadata.serviceName].constructor,
        (controller as any)[serviceMetadata.serviceName].Types,
        serviceMetadata,
        functionMetadata,
        false,
        expectedResponseStatusCode,
        expectedResponseFieldPathNameToFieldValueMapInTests
      );

      const item = createPostmanCollectionItem(
        (controller as any)[serviceMetadata.serviceName].constructor,
        serviceMetadata,
        functionMetadata,
        sampleArg,
        tests
      );

      const postTestSpecs = serviceFunctionAnnotationContainer.getPostTestSpecs(
        (controller as any)[serviceMetadata.serviceName].constructor,
        functionMetadata.functionName
      );

      let hasWrittenTest = false;
      writtenTests
        .filter(
          ({ testTemplate: { serviceFunctionName, type, at, executeLast } }) =>
            !executeLast &&
            type === 'when' &&
            at.toLowerCase() ===
              (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase()
        )
        .forEach((writtenTest) => {
          hasWrittenTest = true;
          addCustomTest(writtenTest, controller, servicesMetadata, items);
        });

      if (postTestSpecs || (isDelete && lastReadFunctionMetadata)) {
        items.push({ ...item, name: 'WHEN ' + item.name });
      } else if (!hasWrittenTest) {
        items.push(item);
      }

      postTestSpecs?.forEach((postTestSpec, testSpecIndex) => {
        const finalExpectedFieldPathNameToFieldValueMapInTests = {
          ...(expectedResponseFieldPathNameToFieldValueMapInTests ?? {}),
          ...(postTestSpec?.expectedResult ?? {}),
        };

        if (postTestSpec?.serviceFunctionName) {
          const [serviceName, functionName] = postTestSpec.serviceFunctionName.split('.');

          const foundServiceMetadata = servicesMetadata.find(
            (serviceMetadata) => serviceMetadata.serviceName === serviceName
          );

          const foundFunctionMetadata = foundServiceMetadata?.functions.find(
            (func) => func.functionName === functionName
          );

          if (!foundServiceMetadata || !foundFunctionMetadata) {
            throw new Error(
              'Invalid service function value in @PostTest annotation in ' +
                serviceMetadata.serviceName +
                '.' +
                functionMetadata.functionName
            );
          }

          const expectedResponseStatusCode =
            serviceFunctionAnnotationContainer.getResponseStatusCodeForServiceFunction(
              (controller as any)[foundServiceMetadata.serviceName].constructor,
              foundFunctionMetadata.functionName
            );

          const postTests = getServiceFunctionTests(
            (controller as any)[foundServiceMetadata.serviceName].constructor,
            (controller as any)[foundServiceMetadata.serviceName].Types,
            foundServiceMetadata,
            foundFunctionMetadata,
            isUpdate,
            expectedResponseStatusCode,
            finalExpectedFieldPathNameToFieldValueMapInTests,
            isUpdate ? sampleArg : undefined
          );

          const postSampleArg =
            postTestSpec.argument ??
            getServiceFunctionTestArgument(
              (controller as any)[foundServiceMetadata.serviceName].constructor,
              (controller as any)[foundServiceMetadata.serviceName].Types,
              foundFunctionMetadata.functionName,
              foundFunctionMetadata.argType,
              foundServiceMetadata,
              true,
              1,
              isUpdate ? sampleArg : undefined
            );

          const item = createPostmanCollectionItem(
            (controller as any)[foundServiceMetadata.serviceName].constructor,
            foundServiceMetadata,
            foundFunctionMetadata,
            postSampleArg,
            postTests,
            postTestSpec.testName
          );

          items.push({ ...item, name: (testSpecIndex === 0 ? 'THEN ' : 'AND ') + item.name });
        }
      });

      if (lastReadFunctionMetadata && (isUpdate || isDelete)) {
        const foundReadFunctionTestSpec = postTestSpecs?.find((postTestSpec) => {
          const [serviceName, functionName] = postTestSpec.serviceFunctionName.split('.');
          if (
            serviceName === serviceMetadata.serviceName &&
            functionName === lastReadFunctionMetadata?.functionName
          ) {
            return true;
          }
          return false;
        });

        const foundAfterReadTest = writtenTests
          .filter(
            ({ testTemplate: { after, executeLast } }) =>
              !executeLast &&
              after?.toLowerCase() ===
                (serviceMetadata.serviceName + '.' + functionMetadata?.functionName).toLowerCase()
          )
          .find(({ testTemplate: { serviceFunctionName } }) => {
            if (
              serviceFunctionName ===
              serviceMetadata.serviceName + '.' + lastReadFunctionMetadata?.functionName
            ) {
              return true;
            }
            return false;
          });

        if (
          ((isUpdate && (updateType === 'update' || updateType === undefined)) || isDelete) &&
          !foundReadFunctionTestSpec &&
          !foundAfterReadTest
        ) {
          const getFunctionTests = getServiceFunctionTests(
            (controller as any)[serviceMetadata.serviceName].constructor,
            (controller as any)[serviceMetadata.serviceName].Types,
            serviceMetadata,
            lastReadFunctionMetadata,
            isUpdate,
            isUpdate ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
            expectedResponseFieldPathNameToFieldValueMapInTests,
            isUpdate ? sampleArg : undefined
          );

          const getFunctionSampleArg = getServiceFunctionTestArgument(
            (controller as any)[serviceMetadata.serviceName].constructor,
            (controller as any)[serviceMetadata.serviceName].Types,
            lastReadFunctionMetadata.functionName,
            lastReadFunctionMetadata.argType,
            serviceMetadata,
            true,
            1,
            sampleArg
          );

          const itemName = _.startCase(serviceMetadata.serviceName.split('Service')[0]).toLowerCase();

          const item = createPostmanCollectionItem(
            (controller as any)[serviceMetadata.serviceName].constructor,
            serviceMetadata,
            lastReadFunctionMetadata,
            getFunctionSampleArg,
            getFunctionTests,
            isDelete ? `THEN ${itemName} is not found` : undefined
          );

          items.push(item);
        }
      }

      writtenTests
        .filter(
          ({ testTemplate: { after, executeLast } }) =>
            !executeLast &&
            after?.toLowerCase() ===
              (serviceMetadata.serviceName + '.' + functionMetadata.functionName).toLowerCase()
        )
        .forEach((writtenTest) => {
          addCustomTest(writtenTest, controller, servicesMetadata, items);
        });

      functionItemGroups.push({
        name: functionMetadata.functionName + ` (${serviceIndex + 1}.${functionIndex + 1})`,
        item: items.map((item, index) => ({
          ...item,
          name: item.name + ` (${serviceIndex + 1}.${functionIndex + 1}.${index + 1})`,
        })),
      });
    });

    const customTestGroups = _.groupBy(
      writtenTests.filter(
        ({ serviceName, testTemplate: { executeLast } }) =>
          serviceName.toLowerCase() === serviceMetadata.serviceName.toLowerCase() && executeLast
      ),
      ({ testFileName }) => testFileName
    );

    Object.entries(customTestGroups).forEach(([testFileName, writtenTests]) => {
      const customTestItems: any[] = [];

      writtenTests.forEach((writtenTest) =>
        addCustomTest(writtenTest, controller, servicesMetadata, customTestItems)
      );

      functionItemGroups.push({
        name: testFileName,
        item: customTestItems,
      });
    });

    itemGroups.push({
      name: serviceMetadata.serviceName + ` (${serviceIndex + 1})`,
      item: functionItemGroups,
    });
  });

  const cwd = process.cwd();
  const appName = cwd.split('/').reverse()[0];
  const payload = {};

  _.set(payload, 'sub', 'fbdb4e4a-6e93-4b08-a1e7-0b7bd08520a6');

  _.set(payload, 'iss', 'http://localhost:8080/auth/realms/test');

  _.set(
    payload,
    process.env.JWT_ROLES_CLAIM_PATH ??
      throwException('JWT_ROLES_CLAIM_PATH environment variable must be defined'),
    [process.env.TEST_USER_ROLE]
  );

  const jwt = sign(
    payload,
    process.env.JWT_SIGN_SECRET || throwException('JWT_SIGN_SECRET environment variable is not defined.')
  );

  const postmanMetadata = {
    info: {
      name: appName + ' tests',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: Base64.encode(jwt),
          type: 'string',
        },
      ],
    },
    item: [
      {
        name: 'metadataService.getServicesMetadata',
        request: {
          method: 'POST',
          url: {
            raw: `http://localhost:${
              process.env.HTTP_SERVER_PORT ?? 3001
            }/${getNamespacedMicroserviceName()}/metadataService.getServicesMetadata`,
            protocol: 'http',
            host: ['localhost'],
            port: `${process.env.HTTP_SERVER_PORT ?? 3001}`,
            path: [getNamespacedMicroserviceName(), 'metadataService.getServicesMetadata'],
          },
        },
      },
      {
        name: 'metadataService.getOpenApiSpec',
        request: {
          method: 'POST',
          url: {
            raw: `http://localhost:${
              process.env.HTTP_SERVER_PORT ?? 3001
            }/${getNamespacedMicroserviceName()}/metadataService.getOpenApiSpec`,
            protocol: 'http',
            host: ['localhost'],
            port: `${process.env.HTTP_SERVER_PORT ?? 3001}`,
            path: [getNamespacedMicroserviceName(), 'metadataService.getOpenApiSpec'],
          },
        },
      },
      ...itemGroups,
    ],
  };

  if (!existsSync(cwd + '/generated')) {
    mkdirSync(cwd + '/generated');
  }

  if (!existsSync(cwd + '/generated/integrationtests')) {
    mkdirSync(cwd + '/generated/integrationtests');
  }

  writeFileSync(
    process.cwd() + '/generated/integrationtests/integrationTestsPostmanCollection.json',
    JSON.stringify(postmanMetadata, null, 4)
  );
}
