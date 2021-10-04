import AbstractDataStore from '../datastore/AbstractDataStore';

export default class Microservice {
  public isProcessKillServiceEnabled = false;
  constructor(public readonly dataStore: AbstractDataStore) {}
}
