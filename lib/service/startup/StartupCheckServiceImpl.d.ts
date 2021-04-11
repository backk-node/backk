import AbstractDbManager from '../../dbmanager/AbstractDbManager';
import StartupCheckService from './StartupCheckService';
import { PromiseErrorOr } from '../../types/PromiseErrorOr';
export default class StartupCheckServiceImpl extends StartupCheckService {
    constructor(dbManager: AbstractDbManager);
    isServiceStarted(): PromiseErrorOr<null>;
}
