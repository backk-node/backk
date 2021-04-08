import RandExp from 'randexp';
import {
  doesClassPropertyContainCustomValidation,
  getClassPropertyCustomValidationTestValue,
  getPropertyValidationOfType
} from '../validation/setClassPropertyValidationDecorators';
import getValidationConstraint from '../validation/getValidationConstraint';
import getCustomValidationConstraint from '../validation/getCustomValidationConstraint';
import getPostalCodeSampleValue from './samplevalues/getPostalCodeSampleValue';
import getMobilePhoneNumberSampleValue from './samplevalues/getMobilePhoneNumberSampleValue';
import getPhoneNumberSampleValue from './samplevalues/getPhoneNumberSampleValue';

export const regExpToSampleStringMap: { [key: string]: string } = {};

// noinspection OverlyComplexBooleanExpressionJS,OverlyComplexBooleanExpressionJS
export default function getSampleStringValue(
  Class: Function,
  propertyName: string,
  isUpdate: boolean
): string {
  const booleanStringValidation = getPropertyValidationOfType(Class, propertyName, 'isBooleanString');

  let sampleStringValue: string | undefined;

  if (booleanStringValidation) {
    sampleStringValue = isUpdate ? 'false' : 'true';
  }

  const containsValidation = getPropertyValidationOfType(Class, propertyName, 'contains');
  const containsValidationConstraint = getValidationConstraint(Class, propertyName, 'contains');

  if (containsValidation) {
    sampleStringValue = isUpdate ? containsValidationConstraint + 'a' : containsValidationConstraint;
  }

  const bicValidation = getPropertyValidationOfType(Class, propertyName, 'isBIC');

  if (bicValidation) {
    sampleStringValue = isUpdate ? 'NEDSZAJJXXX' : 'NDEAFIHH';
  }

  const base32Validation = getPropertyValidationOfType(Class, propertyName, 'isBase32');

  if (base32Validation) {
    sampleStringValue = isUpdate ? 'ABCD' : 'ABC';
  }

  const btcAddressValidation = getPropertyValidationOfType(Class, propertyName, 'isBtcAddress');

  if (btcAddressValidation) {
    sampleStringValue = isUpdate
      ? '2BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
      : '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
  }

  const creditCardValidation = getPropertyValidationOfType(Class, propertyName, 'isCreditCard');

  if (creditCardValidation) {
    sampleStringValue = isUpdate ? '5500 0000 0000 0004' : '4111 1111 1111 1111';
  }

  const dataUriValidation = doesClassPropertyContainCustomValidation(Class, propertyName, 'isDataUri');

  if (dataUriValidation) {
    sampleStringValue = isUpdate
      ? 'data:image/png;base64,XYZsbG8sIFdvcmxkIQ=='
      : 'data:image/png;base64,SGVsbG8sIFdvcmxkIQ==';
  }

  const dateStringValidation = getPropertyValidationOfType(Class, propertyName, 'isDateString');

  if (dateStringValidation) {
    sampleStringValue = isUpdate ? '2011-10-05T15:48:00.000Z' : '2011-10-05T14:48:00.000Z';
  }

  const decimalValidation = getPropertyValidationOfType(Class, propertyName, 'isDecimal');

  if (decimalValidation) {
    sampleStringValue = '1.23';
  }

  const eanValidation = doesClassPropertyContainCustomValidation(Class, propertyName, 'isEAN');

  if (eanValidation) {
    sampleStringValue = isUpdate ? '978020137962' : '0049720026679';
  }

  const emailValidation = getPropertyValidationOfType(Class, propertyName, 'isEmail');

  if (emailValidation) {
    if (propertyName.toLowerCase() === 'username') {
      sampleStringValue = 'test@test.com';
    } else {
      sampleStringValue = isUpdate ? 'test2@test.com' : 'test@test.com';
    }
  }

  const ethereumAddressValidation = getPropertyValidationOfType(Class, propertyName, 'isEthereumAddress');

  if (ethereumAddressValidation) {
    sampleStringValue = isUpdate
      ? '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
      : '0xb794f5ea0ba39494ce839613fffba74279579268';
  }

  const fqdnValidation = getPropertyValidationOfType(Class, propertyName, 'isFqdn');

  if (fqdnValidation) {
    sampleStringValue = 'www.domain.com';
  }

  const hslValidation = getPropertyValidationOfType(Class, propertyName, 'isHSL');

  if (hslValidation) {
    sampleStringValue = isUpdate ? 'hsl(100,100%,50%)' : 'hsl(120,100%,50%)';
  }

  const hexColorValidation = getPropertyValidationOfType(Class, propertyName, 'isHexColor');

  if (hexColorValidation) {
    sampleStringValue = isUpdate ? '#000000' : '#ffffff';
  }

  const hexadecimalNumberValidation = getPropertyValidationOfType(Class, propertyName, 'isHexadecimal');

  if (hexadecimalNumberValidation) {
    sampleStringValue = '0xff';
  }

  const ibanValidation = getPropertyValidationOfType(Class, propertyName, 'isIBAN');

  if (ibanValidation) {
    sampleStringValue = isUpdate ? 'FR7630006000011234567890189' : 'FI211235600000785';
  }

  const ipValidation = getPropertyValidationOfType(Class, propertyName, 'isIp');
  let ipValidationConstraint = getValidationConstraint(Class, propertyName, 'isIp');

  if (typeof ipValidationConstraint === 'string') {
    ipValidationConstraint = parseInt(ipValidationConstraint, 10);
  }

  if (ipValidation) {
    if (ipValidationConstraint === 4) {
      sampleStringValue = isUpdate ? '255.255.255.255' : '127.0.0.1';
    } else {
      sampleStringValue = isUpdate
        ? '2000:0db8:85a3:0000:0000:8a2e:0370:7334'
        : '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    }
  }

  const isbnValidation = getPropertyValidationOfType(Class, propertyName, 'isIsbn');
  let isbnValidationConstraint = getValidationConstraint(Class, propertyName, 'isIsbn');

  if (typeof isbnValidationConstraint === 'string') {
    isbnValidationConstraint = parseInt(isbnValidationConstraint, 10);
  }

  if (isbnValidation) {
    sampleStringValue = isbnValidationConstraint === 10 ? '0-306-40615-2' : '978-3-16-148410-0';
  }

  const isinValidation = getPropertyValidationOfType(Class, propertyName, 'isIsin');

  if (isinValidation) {
    sampleStringValue = isUpdate ? 'AU0000XVGZA3' : 'US0378331005';
  }

  const iso31661Alpha2inValidation = getPropertyValidationOfType(Class, propertyName, 'isISO31661Alpha2');

  if (iso31661Alpha2inValidation) {
    sampleStringValue = isUpdate ? 'DE' : 'FI';
  }

  const iso31661Alpha3inValidation = getPropertyValidationOfType(Class, propertyName, 'isISO31661Alpha3');

  if (iso31661Alpha3inValidation) {
    sampleStringValue = isUpdate ? 'SWE' : 'FIN';
  }

  const iso8601Validation = getPropertyValidationOfType(Class, propertyName, 'isIso8601');

  if (iso8601Validation) {
    sampleStringValue = '2011-10-05T14:48:00.000Z';
  }

  const isrcValidation = getPropertyValidationOfType(Class, propertyName, 'isISRC');

  if (isrcValidation) {
    sampleStringValue = isUpdate ? 'USRC17607839' : 'US-S1Z-99-00001';
  }

  const issnValidation = getPropertyValidationOfType(Class, propertyName, 'isISSN');

  if (issnValidation) {
    sampleStringValue = '2049-3630';
  }

  const jsonValidation = getPropertyValidationOfType(Class, propertyName, 'isJson');

  if (jsonValidation) {
    sampleStringValue = '{ "test": "test" }';
  }

  const jwtValidation = getPropertyValidationOfType(Class, propertyName, 'isJwt');

  if (jwtValidation) {
    sampleStringValue = isUpdate
      ? 'abJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  }

  const localeValidation = getPropertyValidationOfType(Class, propertyName, 'isLocale');

  if (localeValidation) {
    sampleStringValue = isUpdate ? 'en-US' : 'en-GB';
  }

  const macAddressValidation = getPropertyValidationOfType(Class, propertyName, 'isMacAddress');

  if (macAddressValidation) {
    sampleStringValue = isUpdate ? '01-00-00-00-00-00' : '06-00-00-00-00-00';
  }

  const magnetUriValidation = getPropertyValidationOfType(Class, propertyName, 'isMagnetURI');

  if (magnetUriValidation) {
    sampleStringValue = isUpdate
      ? 'magnet:?xt=urn:btih:a12fe1c06bba254a9dc9f519b335aa7c1367a88a'
      : 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a';
  }

  const militaryTimeValidation = getPropertyValidationOfType(Class, propertyName, 'isMilitaryTime');

  if (militaryTimeValidation) {
    sampleStringValue = isUpdate ? '14:00' : '13:00';
  }

  const mimeTypeValidation = getPropertyValidationOfType(Class, propertyName, 'isMimeType');

  if (mimeTypeValidation) {
    sampleStringValue = isUpdate ? 'text/html' : 'application/json';
  }

  const numberStringValidation = getPropertyValidationOfType(Class, propertyName, 'isNumberString');

  if (numberStringValidation) {
    sampleStringValue = isUpdate ? '1234' : '123';
  }

  const octalNumberValidation = getPropertyValidationOfType(Class, propertyName, 'isOctal');

  if (octalNumberValidation) {
    sampleStringValue = isUpdate ? '01234' : '0123';
  }

  const portNumberValidation = getPropertyValidationOfType(Class, propertyName, 'isPort');

  if (portNumberValidation) {
    sampleStringValue = isUpdate ? '80' : '8080';
  }

  const rgbColorValidation = getPropertyValidationOfType(Class, propertyName, 'isRgbColor');

  if (rgbColorValidation) {
    sampleStringValue = isUpdate ? 'rgb(255,255,255)' : 'rgb(128,128,128)';
  }

  const semVerValidation = getPropertyValidationOfType(Class, propertyName, 'isSemVer');

  if (semVerValidation) {
    sampleStringValue = isUpdate ? '1.2.4' : '1.2.3';
  }

  const uuidValidation = getPropertyValidationOfType(Class, propertyName, 'isUuid');
  let uuidValidationConstraint = getValidationConstraint(Class, propertyName, 'isUuid');

  if (typeof uuidValidationConstraint === 'string') {
    uuidValidationConstraint = parseInt(uuidValidationConstraint, 10);
  }

  if (uuidValidation) {
    if (uuidValidationConstraint === 3) {
      sampleStringValue = '6fa459ea-ee8a-3ca4-894e-db77e160355e';
    } else if (uuidValidationConstraint === 4) {
      sampleStringValue = '16fd2706-8baf-433b-82eb-8c7fada847da';
    } else if (uuidValidationConstraint === 5) {
      sampleStringValue = '886313e1-3b8a-5372-9b90-0c9aee199e5d';
    }
  }

  const urlValidation = getPropertyValidationOfType(Class, propertyName, 'isUrl');

  if (urlValidation) {
    sampleStringValue = 'https://www.google.com';
  }

  const notContainsValidation = getPropertyValidationOfType(Class, propertyName, 'notContains');
  const notContainsValidationConstraint: string = getValidationConstraint(Class, propertyName, 'notContains');

  if (notContainsValidation) {
    sampleStringValue = notContainsValidationConstraint
      .split('')
      .map((character) =>
        'abcdefghijklmnopqrstuvwxyz'.split('').find((differentCharacter) => differentCharacter !== character)
      )
      .join('');
  }

  const strongPasswordValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'isStrongPassword'
  );

  if (strongPasswordValidation) {
    sampleStringValue = isUpdate ? 'qweAT21=)(' : 'tttAO123%!=';
  }

  const postalCodeValidation = doesClassPropertyContainCustomValidation(Class, propertyName, 'isPostalCode');

  if (postalCodeValidation) {
    const locale = getCustomValidationConstraint(Class, propertyName, 'isPostalCode', 1);
    sampleStringValue = getPostalCodeSampleValue(locale);
  }

  const creditCardExpirationValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'isCreditCardExpiration'
  );

  if (creditCardExpirationValidation) {
    sampleStringValue = isUpdate ? '12/99' : '11/99';
  }

  const cardVerificationCodeValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'isCardVerificationCode'
  );

  if (cardVerificationCodeValidation) {
    sampleStringValue = isUpdate ? '346' : '345';
  }

  const oneOfValidation = doesClassPropertyContainCustomValidation(Class, propertyName, 'isOneOf');

  if (oneOfValidation) {
    sampleStringValue = getCustomValidationConstraint(Class, propertyName, 'isOneOf', 2);
  }

  const noneOfValidation = doesClassPropertyContainCustomValidation(Class, propertyName, 'isNoneOf');

  if (noneOfValidation) {
    sampleStringValue = getCustomValidationConstraint(Class, propertyName, 'isNoneOf', 2);
  }

  const mobilePhoneValidation = getPropertyValidationOfType(Class, propertyName, 'isMobilePhone');

  if (mobilePhoneValidation) {
    const locale = getValidationConstraint(Class, propertyName, 'isMobilePhone');
    sampleStringValue = getMobilePhoneNumberSampleValue(locale);
  }

  const phoneNumberValidation = getPropertyValidationOfType(Class, propertyName, 'isPhoneNumber');

  if (phoneNumberValidation) {
    const country = getValidationConstraint(Class, propertyName, 'isPhoneNumber');
    sampleStringValue = getPhoneNumberSampleValue(country);
  }

  const hasLengthAndMatchesValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'lengthAndMatches'
  );

  if (hasLengthAndMatchesValidation) {
    const maxLengthConstraint = getCustomValidationConstraint(Class, propertyName, 'lengthAndMatches', 2);
    const regExpConstraint = getCustomValidationConstraint(Class, propertyName, 'lengthAndMatches', 3);

    if (regExpToSampleStringMap[regExpConstraint]) {
      sampleStringValue = regExpToSampleStringMap[regExpConstraint];
    } else {
      const randomRegExp = new RandExp(regExpConstraint);
      randomRegExp.max = 10;
      sampleStringValue = randomRegExp.gen().slice(0, maxLengthConstraint);
      regExpToSampleStringMap[regExpConstraint] = sampleStringValue;
    }
  }

  const hasLengthAndMatchesAllValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'lengthAndMatchesAll'
  );

  if (hasLengthAndMatchesAllValidation) {
    const minLengthConstraint = getCustomValidationConstraint(Class, propertyName, 'lengthAndMatchesAll', 1);
    const maxLengthConstraint = getCustomValidationConstraint(Class, propertyName, 'lengthAndMatchesAll', 2);
    const regExpConstraints: RegExp[] = getCustomValidationConstraint(
      Class,
      propertyName,
      'lengthAndMatchesAll',
      3
    );

    if (regExpToSampleStringMap[regExpConstraints.join('')]) {
      sampleStringValue = regExpToSampleStringMap[regExpConstraints.join('')];
    } else {
      sampleStringValue = regExpConstraints.reduce((sampleStringValue: string, regExp: RegExp) => {
        const randomRegExp = new RandExp(regExp);
        randomRegExp.max = 5;
        return sampleStringValue + randomRegExp.gen();
      }, '');

      while (sampleStringValue.length < minLengthConstraint) {
        sampleStringValue += sampleStringValue;
      }

      sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
      regExpToSampleStringMap[regExpConstraints.join('')] = sampleStringValue;
    }
  }

  const hasMaxLengthAndMatchesValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'maxLengthAndMatches'
  );

  if (hasMaxLengthAndMatchesValidation) {
    const maxLengthConstraint = getCustomValidationConstraint(Class, propertyName, 'maxLengthAndMatches', 1);
    const regExpConstraint = getCustomValidationConstraint(Class, propertyName, 'maxLengthAndMatches', 2);

    if (regExpToSampleStringMap[regExpConstraint]) {
      sampleStringValue = regExpToSampleStringMap[regExpConstraint];
    } else {
      const randomRegExp = new RandExp(regExpConstraint);
      randomRegExp.max = 10;
      sampleStringValue = randomRegExp.gen().slice(0, maxLengthConstraint);
      regExpToSampleStringMap[regExpConstraint] = sampleStringValue;
    }
  }

  const hasMaxLengthAndMatchesAllValidation = doesClassPropertyContainCustomValidation(
    Class,
    propertyName,
    'maxLengthAndMatchesAll'
  );

  if (hasMaxLengthAndMatchesAllValidation) {
    const maxLengthConstraint = getCustomValidationConstraint(
      Class,
      propertyName,
      'maxLengthAndMatchesAll',
      1
    );
    const regExpConstraints: RegExp[] = getCustomValidationConstraint(
      Class,
      propertyName,
      'maxLengthAndMatchesAll',
      2
    );

    if (regExpToSampleStringMap[regExpConstraints.join('')]) {
      sampleStringValue = regExpToSampleStringMap[regExpConstraints.join('')];
    } else {
      sampleStringValue = regExpConstraints.reduce((sampleStringValue: string, regExp: RegExp) => {
        const randomRegExp = new RandExp(regExp);
        randomRegExp.max = 5;
        return sampleStringValue + randomRegExp.gen();
      }, '');

      sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
      regExpToSampleStringMap[regExpConstraints.join('')] = sampleStringValue;
    }
  }

  const customValidationTestValue = getClassPropertyCustomValidationTestValue(Class, propertyName);

  if (customValidationTestValue) {
    sampleStringValue = customValidationTestValue;
  }

  // noinspection OverlyComplexBooleanExpressionJS
  if (
    sampleStringValue === undefined &&
    !doesClassPropertyContainCustomValidation(Class, propertyName, 'isAnyString') &&
    !doesClassPropertyContainCustomValidation(Class, propertyName, 'shouldBeTrueForEntity') &&
    !getPropertyValidationOfType(Class, propertyName, 'isAlpha') &&
    !getPropertyValidationOfType(Class, propertyName, 'isAlphanumeric') &&
    !getPropertyValidationOfType(Class, propertyName, 'isAscii') &&
    !getPropertyValidationOfType(Class, propertyName, 'isCurrency') &&
    !getPropertyValidationOfType(Class, propertyName, 'IsFirebasePushId') &&
    !getPropertyValidationOfType(Class, propertyName, 'isHash') &&
    !getPropertyValidationOfType(Class, propertyName, 'isIdentityCard') &&
    !getPropertyValidationOfType(Class, propertyName, 'isMongoId') &&
    !getPropertyValidationOfType(Class, propertyName, 'isPassportNumber') &&
    !getPropertyValidationOfType(Class, propertyName, 'isRFC3339')
  ) {
    throw new Error(
      Class.name +
        '.' +
        propertyName +
        ' needs have a string value validator or use @IsAnyString() annotation'
    );
  }

  if (sampleStringValue === undefined) {
    sampleStringValue = isUpdate ? 'abcd' : 'abc';
  }

  const lowerCaseValidation = getPropertyValidationOfType(Class, propertyName, 'isLowercase');

  if (lowerCaseValidation) {
    sampleStringValue = sampleStringValue.toLowerCase();
  }

  const upperCaseValidation = getPropertyValidationOfType(Class, propertyName, 'isUppercase');

  if (upperCaseValidation) {
    sampleStringValue = sampleStringValue.toUpperCase();
  }

  const maxLengthValidation = getPropertyValidationOfType(Class, propertyName, 'maxLength');

  if (maxLengthValidation) {
    const maxLengthConstraint = getValidationConstraint(Class, propertyName, 'maxLength');

    sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
  }

  const lengthValidation = getPropertyValidationOfType(Class, propertyName, 'isLength');

  if (lengthValidation) {
    const minLengthConstraint = getValidationConstraint(Class, propertyName, 'isLength', 0);
    const maxLengthConstraint = getValidationConstraint(Class, propertyName, 'isLength', 1);

    while (sampleStringValue.length < minLengthConstraint) {
      sampleStringValue += sampleStringValue;
    }

    sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
  }

  const minLengthValidation = getPropertyValidationOfType(Class, propertyName, 'minLength');

  if (minLengthValidation) {
    const minLengthConstraint = getValidationConstraint(Class, propertyName, 'minLength');

    while (sampleStringValue.length < minLengthConstraint) {
      sampleStringValue += sampleStringValue;
    }
  }

  return sampleStringValue;
}
