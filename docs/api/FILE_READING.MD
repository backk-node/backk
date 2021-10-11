### CSV, Text, JSON and XML File Reading

- [tryGetObjectsFromCsvFile](#trygetobjectsfromcsvfile)
- [tryGetSeparatedValuesFromTextFile](#trygetseparatedvaluesfromtextfile)
- [tryGetSeparatedIntegerValuesFromTextFile](#trygetseparatedintegervaluesfromtextfile)
- [tryGetValuesByJsonPathFromJsonFile](#trygetvaluesbyjsonpathfromjsonfile)
- [tryGetValuesByXPathFromXmlFile](#trygetvaluesbyxpathfromxmlfile)

#### <a name="trygetobjectsfromcsvfile"></a> tryGetObjectsFromCsvFile
```ts
function tryGetObjectsFromCsvFile(
  filePathName: string,
  columnNames: string[] | 'readFromFirstRow' = 'readFromFirstRow',
  delimiter = ','
): { [key: string]: string }[];
```

Reads a CSV file `filePathName` and parses each row to an object. `columnNames` will be the keys of the each object.
Column delimiter can be specified with `delimiter`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (ie. whitespace around value is removed)

Returns an array of objects.

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

#### <a name="trygetseparatedvaluesfromtextfile"></a> tryGetSeparatedValuesFromTextFile
```ts
function tryGetSeparatedValuesFromTextFile(
  filePathName: string,
  separator = '\n'
): string[]
```

Reads a text file `filePathName` and parses values separated by the given `separator`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (ie. whitespace around value is removed)

Returns an array of strings.

For example, following text file contents:

```
Tag 1
Tag 2
```

will be parsed to following:

```js
['Tag 1', 'Tag 2'];
```

#### <a name="trygetseparatedintegervaluesfromtextfile"></a> tryGetSeparatedIntegerValuesFromTextFile
```ts
function tryGetSeparatedIntegerValuesFromTextFile(
  filePathName: string,
  separator = '\n'
): number[]
```

Reads a text file `filePathName` and parses integer values separated by the given `separator`.
Empty lines in the file will be skipped.
Each parsed value will be trimmed (ie. whitespace around value is removed) before converted to an integer.

Returns an array of numbers.

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

#### <a name="trygetvaluesbyjsonpathfromjsonfile"></a> tryGetValuesByJsonPathFromJsonFile
```ts
function tryGetValuesByJsonPathFromJsonFile(filePathName: string, jsonPath: string): any[]
```

Reads a text file `filePathName` and parses returns values matching the `jsonPath`.

Returns an array of values.

#### <a name="trygetvaluesbyxpathfromxmlfile"></a> tryGetValuesByXPathFromXmlFile
```ts
function tryGetValuesByXPathFromXmlFile(filePathName: string, xPath: string): any[]
```

Reads a text file `filePathName` and parses returns values matching the `xPath`.

Returns an array of values.
