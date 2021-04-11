import AbstractDbManager from '../../../AbstractDbManager';
export declare function isDbInitialized(dbManager: AbstractDbManager): Promise<any>;
export default function initializeDatabase(controller: any | undefined, dbManager: AbstractDbManager): Promise<boolean>;
