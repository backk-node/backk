export default function parseTypescriptLinesForTypeName(typeName: string, isBaseTypeOptional: boolean, isReadonly: boolean, isPublic: boolean, isNonNullable: boolean, isPrivate: boolean, keys: string[], keyType: 'omit' | 'pick', originatingTypeFilePathName: string, keyToNewKeyMap?: {
    [key: string]: string[];
}): [string[], any[]];
