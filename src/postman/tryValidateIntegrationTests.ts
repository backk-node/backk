import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import { HttpStatusCodes } from '../constants/constants';

export default function tryValidateIntegrationTests(
  integrationTests: any[],
  servicesMetadata: ServiceMetadata[]
) {
  integrationTests.forEach((integrationTest, index) => {
    const functionName = integrationTest.testFileName.split('test')[1];

    if (!integrationTest.testTemplate) {
      let tests;
      if (integrationTest.given) {
        tests = [{ testName: 'GIVEN ' + integrationTest.given }];
        integrationTest.type = 'given';
        integrationTest.before = integrationTest.serviceName + '.' + functionName;
        delete integrationTest.given;
      } else if (integrationTest.then) {
        tests = [{ testName: 'THEN ' + integrationTest.then }];
        integrationTest.type = 'then';
        delete integrationTest.then;
        integrationTest.after = integrationTest.serviceName + '.' + functionName;
      } else if (integrationTest.when) {
        tests = [{ testName: 'WHEN ' + integrationTest.when }];
        integrationTest.type = 'when';
        integrationTest.at = integrationTest.serviceName + '.' + functionName;
        delete integrationTest.when;
      } else if (integrationTest.cleanup) {
        tests = [{ testName: 'CLEANUP ' + integrationTest.cleanup }];
        integrationTest.type = 'cleanup';
        integrationTest.after = integrationTest.serviceName + '.' + functionName;
        integrationTest.at = integrationTest.serviceName + '.' + functionName;
        delete integrationTest.cleanup;
      } else if (integrationTest.name) {
        tests = [{ testName: integrationTest.name }];
        delete integrationTest.name;
      } else {
        throw new Error('Integration tests: Missing testTemplate or test specification');
      }
      // noinspection AssignmentToFunctionParameterJS
      integrationTest = {
        testTemplate: integrationTest,
        tests,
        serviceName: integrationTest.serviceName,
        testFileName: integrationTest.testFileName
      };

      integrationTests[index] = integrationTest;
    } else {
      integrationTest.testTemplate.at = integrationTest.serviceName + '.' + functionName;
    }

    const foundInvalidKey = Object.keys(integrationTest.testTemplate).find(
      (key) =>
        key !== 'after' &&
        key !== 'before' &&
        key !== 'at' &&
        key !== 'serviceFunctionName' &&
        key !== 'argument' &&
        key !== 'responseTests' &&
        key !== 'responseStatusCode' &&
        key !== 'serviceName' &&
        key !== 'testFileName' &&
        key !== 'tests' &&
        key !== 'type'
    );

    if (foundInvalidKey) {
      throw new Error("Integration tests: Invalid key '" + foundInvalidKey + "' in test or testTemplate");
    }

    if (integrationTest.testTemplate) {
      if (!integrationTest.testTemplate.responseStatusCode) {
        integrationTest.testTemplate.responseStatusCode = HttpStatusCodes.SUCCESS;
      }
    }

    if (integrationTest.tests) {
      integrationTest.tests.forEach((test: any) => {
        const foundInvalidKey = Object.keys(test).find(
          (key) => key !== 'testName' && key !== 'testProperties'
        );

        if (foundInvalidKey) {
          throw new Error("Integration tests: Invalid key '" + foundInvalidKey + "' in tests");
        }
      });
    }

    if (integrationTest.testTemplate.before) {
      const [serviceName, functionName] = integrationTest.testTemplate.before.split('.');

      const serviceMetadata = servicesMetadata.find(
        (serviceMetadata) => serviceMetadata.serviceName.toLowerCase() === serviceName.toLowerCase()
      );

      const functionMetadata = serviceMetadata?.functions.find(
        (func) => func.functionName.toLowerCase() === functionName.toLowerCase()
      );

      if (!serviceMetadata || !functionMetadata) {
        integrationTest.testTemplate.executeLast = true;
      }
    }

    if (integrationTest.testTemplate.after) {
      const [serviceName, functionName] = integrationTest.testTemplate.after.split('.');

      const serviceMetadata = servicesMetadata.find(
        (serviceMetadata) => serviceMetadata.serviceName.toLowerCase() === serviceName.toLowerCase()
      );

      const functionMetadata = serviceMetadata?.functions.find(
        (func) => func.functionName.toLowerCase() === functionName.toLowerCase()
      );

      if (!serviceMetadata || !functionMetadata) {
        integrationTest.testTemplate.executeLast = true;
      }
    }

    if (integrationTest.testTemplate.at) {
      const [serviceName, functionName] = integrationTest.testTemplate.at.split('.');

      const serviceMetadata = servicesMetadata.find(
        (serviceMetadata) => serviceMetadata.serviceName.toLowerCase() === serviceName.toLowerCase()
      );

      const functionMetadata = serviceMetadata?.functions.find(
        (func) => func.functionName.toLowerCase() === functionName.toLowerCase()
      );

      if (!serviceMetadata || !functionMetadata) {
        integrationTest.testTemplate.executeLast = true;
      }
    }
  });
}
