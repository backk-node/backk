import AbstractDbManager from '../dbmanager/AbstractDbManager';
export interface ControllerInitOptions {
    generatePostmanTestFile?: boolean;
    generatePostmanApiFile?: boolean;
}
export default function initializeController(controller: any, dbManager: AbstractDbManager, controllerInitOptions?: ControllerInitOptions, remoteServiceRootDir?: string): void;
