import testValueContainer from './testValueContainer';

export function TestValue(testValue: any){
  // eslint-disable-next-line
  return function(object: Object, propertyName: string) {
    testValueContainer.addTestValue(object.constructor, propertyName, testValue);
  };
}
