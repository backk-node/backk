import { DataStore } from '../datastore/DataStore';

export interface Service {
  getDataStore(): DataStore;
  getServiceType(): string;
  isUserService(): boolean;
  isTenantService(): boolean;
}
