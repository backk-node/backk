import parseEnumValuesFromSrcFile from '../../../../../typescript/parser/parseEnumValuesFromSrcFile';
import getSrcFilePathNameForTypeName from '../../../../../utils/file/getSrcFilePathNameForTypeName';
import AbstractDbManager from "../../../../AbstractDbManager";

export default function getEnumSqlColumnType(dbManager: AbstractDbManager, baseFieldTypeName: string) {
  let enumValues: string[];
  if (baseFieldTypeName[0] === '(') {
    enumValues = baseFieldTypeName.slice(1).split(/[|)]/);
  } else {
    enumValues = parseEnumValuesFromSrcFile(getSrcFilePathNameForTypeName(baseFieldTypeName));
  }

  const firstEnumValue = enumValues[0];
  if (firstEnumValue[0] === "'") {
    const enumValueLengths = enumValues.map((enumValue) => enumValue.length);
    const maxEnumValueLength = Math.max(...enumValueLengths);
    return dbManager.getVarCharType(maxEnumValueLength);
  } else {
    const hasFloat = enumValues.reduce(
      (hasFloat: boolean, enumValue: string) =>
        hasFloat || parseInt(enumValue, 10).toString().length !== enumValue.length,
      false
    );

    if (hasFloat) {
      return 'DOUBLE PRECISION';
    } else {
      return 'INTEGER';
    }
  }
}
