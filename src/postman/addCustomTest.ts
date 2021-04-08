import _ from 'lodash';
import createPostmanCollectionItemFromCustomTest from './createPostmanCollectionItemFromCustomTest';
import { ServiceMetadata } from '../metadata/types/ServiceMetadata';
import getServiceFunctionTestArgument from './getServiceFunctionTestArgument';

export default function addCustomTest(
  writtenTest: any,
  controller: any,
  servicesMetadata: ServiceMetadata[],
  items: any[]
) {
  (writtenTest.tests ?? [{}]).forEach((test: any) => {
    const instantiatedWrittenTest = _.cloneDeepWith(writtenTest, (value: any) => {
      let replacedValue = value;

      Object.entries(test.testProperties || {}).forEach(
        ([testPropertyName, testPropertyValue]: [string, any]) => {
          if (replacedValue === `{{${testPropertyName}}}`) {
            replacedValue = testPropertyValue;
          }

          if (typeof replacedValue === 'string' && replacedValue.includes(`{{${testPropertyName}}}`)) {
            replacedValue = replacedValue.replace(`{{${testPropertyName}}}`, testPropertyValue);
          }
        }
      );

      return replacedValue === value ? undefined : replacedValue;
    });

    const [serviceName, functionName] = instantiatedWrittenTest.testTemplate.serviceFunctionName.split('.');

    const serviceMetadata = servicesMetadata.find(
      (serviceMetadata) => serviceMetadata.serviceName === serviceName
    );

    const functionMetadata = serviceMetadata?.functions.find((func) => func.functionName === functionName);

    if (!serviceMetadata || !functionMetadata) {
      throw new Error(
        'Integration tests: unknown service function: ' +
          instantiatedWrittenTest.testTemplate.serviceFunctionName
      );
    }

    const sampleFunctionArgument = getServiceFunctionTestArgument(
      controller[serviceMetadata.serviceName].constructor,
      controller[serviceMetadata.serviceName].Types,
      functionMetadata.functionName,
      functionMetadata.argType,
      serviceMetadata
    );

    instantiatedWrittenTest.testTemplate.argument = {
      ...sampleFunctionArgument,
      ...(instantiatedWrittenTest.testTemplate.argument || {})
    };

    Object.keys(instantiatedWrittenTest.testTemplate.argument).forEach((argumentKey: string) => {
      let isArgumentTemplateReplaced = false;

      Object.entries(test.testProperties || {}).forEach(([key, value]: [string, any]) => {
        if (argumentKey === `{{${key}}}`) {
          const argumentValue = instantiatedWrittenTest.testTemplate.argument[argumentKey];
          delete instantiatedWrittenTest.testTemplate.argument[argumentKey];
          instantiatedWrittenTest.testTemplate.argument[value] = argumentValue;
          isArgumentTemplateReplaced = true;
        }
      });

      if (!isArgumentTemplateReplaced && argumentKey.startsWith('{{') && argumentKey.endsWith('}}')) {
        delete instantiatedWrittenTest.testTemplate.argument[argumentKey];
      }
    });

    instantiatedWrittenTest.testTemplate.testTemplateName = test.testName
      ? test.testName
      : instantiatedWrittenTest.testTemplate.serviceFunctionName;

    items.push(createPostmanCollectionItemFromCustomTest(instantiatedWrittenTest));
  });
}
