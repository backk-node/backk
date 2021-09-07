import AbstractDataStore from '../AbstractDataStore';

export default function getUserAccountIdFieldNameAndRequiredValue(dataStore: AbstractDataStore) {
  return [
    dataStore.getClsNamespace()?.get('userAccountIdFieldName'),
    dataStore.getClsNamespace()?.get('userAccountId')
  ];
}
