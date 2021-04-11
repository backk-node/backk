import AbstractDbManager from '../dbmanager/AbstractDbManager';
export default function getClassPropertyNameToPropertyTypeNameMap<T>(Class: new () => T, dbManager?: AbstractDbManager, isGeneration?: boolean): {
    [key: string]: string;
};
