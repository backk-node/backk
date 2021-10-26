import AbstractDataStore from "../datastore/AbstractDataStore";

export interface Service {
  getDataStore(): AbstractDataStore
  getServiceType(): string;
}
