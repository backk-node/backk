import AbstractDbManager from "../dbmanager/AbstractDbManager";

export interface Service {
  getDbManager(): AbstractDbManager
}
