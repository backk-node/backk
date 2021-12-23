## CSV, Text, JSON and XML File Reading

- [getObjectsFromCsvFileOrThrow](#trygetobjectsfromcsvfile)
- [getSeparatedValuesFromTextFileOrThrow](#trygetseparatedvaluesfromtextfile)
- [getSeparatedIntegerValuesFromTextFileOrThrow](#trygetseparatedintegervaluesfromtextfile)
- [getValuesByJsonPathFromJsonFileOrThrow](#trygetvaluesbyjsonpathfromjsonfile)
- [getValuesByXPathFromXmlFileOrThrow](#trygetvaluesbyxpathfromxmlfile)

### <a name="trygetobjectsfromcsvfile"></a> getObjectsFromCsvFileOrThrow
```ts
function tryGetObjectsFromCsvFile(
  filePathNameRelativeToResourcesDir: string,
  columnNames: string[] | 'readFromFirstRow' = 'readFromFirstRow',
  delimiter = ','
): Array<Record<string, string>>;
```

Reads a CSV file `filePathNameRelativeToResourcesDir` and parses each row to an object. `columnNames` will be the keys of object.
Column delimiter can be specified with `delimiter`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (i.e. whitespace around value is removed)

Returns an array of objects or throws an error on file reading or parsing failure.

For example, following CSV file contents:

```
name,age
John,40
Mary,39
```

will be parsed to following:

```js
[
  {
    name: 'John',
    age: '40'
  },
  {
    name: 'Mary',
    age: '39'
  }
];
```

### <a name="trygetseparatedvaluesfromtextfile"></a> getSeparatedValuesFromTextFileOrThrow
```ts
function tryGetSeparatedValuesFromTextFile(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): string[]
```

Reads a text file `filePathNameRelativeToResourcesDir` and parses values separated by the given `separator`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (i.e. whitespace around the value is removed)

Returns an array of strings or throws an error on file reading failure.

For example, following text file contents:

```
Tag 1
Tag 2
```

will be parsed to following:

```js
['Tag 1', 'Tag 2'];
```

### <a name="trygetseparatedintegervaluesfromtextfile"></a> getSeparatedIntegerValuesFromTextFileOrThrow
```ts
function tryGetSeparatedIntegerValuesFromTextFile(
  filePathNameRelativeToResourcesDir: string,
  separator = '\n'
): number[]
```

Reads a text file `filePathNameRelativeToResourcesDir` and parses integer values separated by the given `separator`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (i.e. whitespace around value is removed) before converted to an integer.

Returns an array of numbers or throws an error on file reading failure.

For example, following text file contents:

```
1000
2000
abc
```

will be parsed to following:

```js
[1000, 2000, NaN];
```

### <a name="trygetvaluesbyjsonpathfromjsonfile"></a> getValuesByJsonPathFromJsonFileOrThrow
```ts
function tryGetValuesByJsonPathFromJsonFile(filePathNameRelativeToResourcesDir: string, jsonPath: string): any[]
```

Reads a text file `filePathNameRelativeToResourcesDir` and parses returns values matching the `jsonPath`.

Returns an array of values or throws an error on file reading or parsing failure.

### <a name="trygetvaluesbyxpathfromxmlfile"></a> getValuesByXPathFromXmlFileOrThrow
```ts
function tryGetValuesByXPathFromXmlFile(filePathNameRelativeToResourcesDir: string, xPath: string): any[]
```

Reads a text file `filePathNameRelativeToResourcesDir` and parses returns values matching the `xPath`.

Returns an array of values or throws an error on file reading or parsing failure.
