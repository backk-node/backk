import { DataStore } from '../DataStore';

export default function getUserAccountIdFieldNameAndRequiredValue(dataStore: DataStore) {
  return [
    dataStore.getClsNamespace()?.get('userAccountIdFieldName'),
    dataStore.getClsNamespace()?.get('userAccountId')
  ];
}
