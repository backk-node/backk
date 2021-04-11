export default function getTypeInfoForTypeName(typeName: string): {
    baseTypeName: string;
    isNull: boolean;
    canBeError: boolean;
    defaultValueStr: string;
    isArrayType: boolean;
    isNullableType: boolean;
    isOptionalType: boolean;
};
