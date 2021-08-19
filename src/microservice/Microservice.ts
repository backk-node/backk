import AbstractDataStore from '../datastore/AbstractDataStore';

export default class Microservice {
  constructor(public readonly dataStore: AbstractDataStore) {}
}
