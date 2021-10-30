import { DataStore } from "../datastore/DataStore";

export interface Service {
  getDataStore(): DataStore
  getServiceType(): string;
  isUsersService(): boolean
}
