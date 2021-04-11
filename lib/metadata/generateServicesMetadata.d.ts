import { ServiceMetadata } from './types/ServiceMetadata';
import AbstractDbManager from '../dbmanager/AbstractDbManager';
export default function generateServicesMetadata<T>(controller: T, dbManager: AbstractDbManager, remoteServiceRootDir?: string): ServiceMetadata[];
