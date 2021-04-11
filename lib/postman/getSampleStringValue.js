"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.regExpToSampleStringMap = void 0;
const randexp_1 = __importDefault(require("randexp"));
const setClassPropertyValidationDecorators_1 = require("../validation/setClassPropertyValidationDecorators");
const getValidationConstraint_1 = __importDefault(require("../validation/getValidationConstraint"));
const getCustomValidationConstraint_1 = __importDefault(require("../validation/getCustomValidationConstraint"));
const getPostalCodeSampleValue_1 = __importDefault(require("./samplevalues/getPostalCodeSampleValue"));
const getMobilePhoneNumberSampleValue_1 = __importDefault(require("./samplevalues/getMobilePhoneNumberSampleValue"));
const getPhoneNumberSampleValue_1 = __importDefault(require("./samplevalues/getPhoneNumberSampleValue"));
exports.regExpToSampleStringMap = {};
function getSampleStringValue(Class, propertyName, isUpdate) {
    const booleanStringValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isBooleanString');
    let sampleStringValue;
    if (booleanStringValidation) {
        sampleStringValue = isUpdate ? 'false' : 'true';
    }
    const containsValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'contains');
    const containsValidationConstraint = getValidationConstraint_1.default(Class, propertyName, 'contains');
    if (containsValidation) {
        sampleStringValue = isUpdate ? containsValidationConstraint + 'a' : containsValidationConstraint;
    }
    const bicValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isBIC');
    if (bicValidation) {
        sampleStringValue = isUpdate ? 'NEDSZAJJXXX' : 'NDEAFIHH';
    }
    const base32Validation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isBase32');
    if (base32Validation) {
        sampleStringValue = isUpdate ? 'ABCD' : 'ABC';
    }
    const btcAddressValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isBtcAddress');
    if (btcAddressValidation) {
        sampleStringValue = isUpdate
            ? '2BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
            : '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
    }
    const creditCardValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isCreditCard');
    if (creditCardValidation) {
        sampleStringValue = isUpdate ? '5500 0000 0000 0004' : '4111 1111 1111 1111';
    }
    const dataUriValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isDataUri');
    if (dataUriValidation) {
        sampleStringValue = isUpdate
            ? 'data:image/png;base64,XYZsbG8sIFdvcmxkIQ=='
            : 'data:image/png;base64,SGVsbG8sIFdvcmxkIQ==';
    }
    const dateStringValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isDateString');
    if (dateStringValidation) {
        sampleStringValue = isUpdate ? '2011-10-05T15:48:00.000Z' : '2011-10-05T14:48:00.000Z';
    }
    const decimalValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isDecimal');
    if (decimalValidation) {
        sampleStringValue = '1.23';
    }
    const eanValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isEAN');
    if (eanValidation) {
        sampleStringValue = isUpdate ? '978020137962' : '0049720026679';
    }
    const emailValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isEmail');
    if (emailValidation) {
        if (propertyName.toLowerCase() === 'username') {
            sampleStringValue = 'test@test.com';
        }
        else {
            sampleStringValue = isUpdate ? 'test2@test.com' : 'test@test.com';
        }
    }
    const ethereumAddressValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isEthereumAddress');
    if (ethereumAddressValidation) {
        sampleStringValue = isUpdate
            ? '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'
            : '0xb794f5ea0ba39494ce839613fffba74279579268';
    }
    const fqdnValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isFqdn');
    if (fqdnValidation) {
        sampleStringValue = 'www.domain.com';
    }
    const hslValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isHSL');
    if (hslValidation) {
        sampleStringValue = isUpdate ? 'hsl(100,100%,50%)' : 'hsl(120,100%,50%)';
    }
    const hexColorValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isHexColor');
    if (hexColorValidation) {
        sampleStringValue = isUpdate ? '#000000' : '#ffffff';
    }
    const hexadecimalNumberValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isHexadecimal');
    if (hexadecimalNumberValidation) {
        sampleStringValue = '0xff';
    }
    const ibanValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIBAN');
    if (ibanValidation) {
        sampleStringValue = isUpdate ? 'FR7630006000011234567890189' : 'FI211235600000785';
    }
    const ipValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIp');
    let ipValidationConstraint = getValidationConstraint_1.default(Class, propertyName, 'isIp');
    if (typeof ipValidationConstraint === 'string') {
        ipValidationConstraint = parseInt(ipValidationConstraint, 10);
    }
    if (ipValidation) {
        if (ipValidationConstraint === 4) {
            sampleStringValue = isUpdate ? '255.255.255.255' : '127.0.0.1';
        }
        else {
            sampleStringValue = isUpdate
                ? '2000:0db8:85a3:0000:0000:8a2e:0370:7334'
                : '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
        }
    }
    const isbnValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIsbn');
    let isbnValidationConstraint = getValidationConstraint_1.default(Class, propertyName, 'isIsbn');
    if (typeof isbnValidationConstraint === 'string') {
        isbnValidationConstraint = parseInt(isbnValidationConstraint, 10);
    }
    if (isbnValidation) {
        sampleStringValue = isbnValidationConstraint === 10 ? '0-306-40615-2' : '978-3-16-148410-0';
    }
    const isinValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIsin');
    if (isinValidation) {
        sampleStringValue = isUpdate ? 'AU0000XVGZA3' : 'US0378331005';
    }
    const iso31661Alpha2inValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isISO31661Alpha2');
    if (iso31661Alpha2inValidation) {
        sampleStringValue = isUpdate ? 'DE' : 'FI';
    }
    const iso31661Alpha3inValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isISO31661Alpha3');
    if (iso31661Alpha3inValidation) {
        sampleStringValue = isUpdate ? 'SWE' : 'FIN';
    }
    const iso8601Validation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIso8601');
    if (iso8601Validation) {
        sampleStringValue = '2011-10-05T14:48:00.000Z';
    }
    const isrcValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isISRC');
    if (isrcValidation) {
        sampleStringValue = isUpdate ? 'USRC17607839' : 'US-S1Z-99-00001';
    }
    const issnValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isISSN');
    if (issnValidation) {
        sampleStringValue = '2049-3630';
    }
    const jsonValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isJson');
    if (jsonValidation) {
        sampleStringValue = '{ "test": "test" }';
    }
    const jwtValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isJwt');
    if (jwtValidation) {
        sampleStringValue = isUpdate
            ? 'abJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
            : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    }
    const localeValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isLocale');
    if (localeValidation) {
        sampleStringValue = isUpdate ? 'en-US' : 'en-GB';
    }
    const macAddressValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMacAddress');
    if (macAddressValidation) {
        sampleStringValue = isUpdate ? '01-00-00-00-00-00' : '06-00-00-00-00-00';
    }
    const magnetUriValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMagnetURI');
    if (magnetUriValidation) {
        sampleStringValue = isUpdate
            ? 'magnet:?xt=urn:btih:a12fe1c06bba254a9dc9f519b335aa7c1367a88a'
            : 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a';
    }
    const militaryTimeValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMilitaryTime');
    if (militaryTimeValidation) {
        sampleStringValue = isUpdate ? '14:00' : '13:00';
    }
    const mimeTypeValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMimeType');
    if (mimeTypeValidation) {
        sampleStringValue = isUpdate ? 'text/html' : 'application/json';
    }
    const numberStringValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isNumberString');
    if (numberStringValidation) {
        sampleStringValue = isUpdate ? '1234' : '123';
    }
    const octalNumberValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isOctal');
    if (octalNumberValidation) {
        sampleStringValue = isUpdate ? '01234' : '0123';
    }
    const portNumberValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isPort');
    if (portNumberValidation) {
        sampleStringValue = isUpdate ? '80' : '8080';
    }
    const rgbColorValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isRgbColor');
    if (rgbColorValidation) {
        sampleStringValue = isUpdate ? 'rgb(255,255,255)' : 'rgb(128,128,128)';
    }
    const semVerValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isSemVer');
    if (semVerValidation) {
        sampleStringValue = isUpdate ? '1.2.4' : '1.2.3';
    }
    const uuidValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isUuid');
    let uuidValidationConstraint = getValidationConstraint_1.default(Class, propertyName, 'isUuid');
    if (typeof uuidValidationConstraint === 'string') {
        uuidValidationConstraint = parseInt(uuidValidationConstraint, 10);
    }
    if (uuidValidation) {
        if (uuidValidationConstraint === 3) {
            sampleStringValue = '6fa459ea-ee8a-3ca4-894e-db77e160355e';
        }
        else if (uuidValidationConstraint === 4) {
            sampleStringValue = '16fd2706-8baf-433b-82eb-8c7fada847da';
        }
        else if (uuidValidationConstraint === 5) {
            sampleStringValue = '886313e1-3b8a-5372-9b90-0c9aee199e5d';
        }
    }
    const urlValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isUrl');
    if (urlValidation) {
        sampleStringValue = 'https://www.google.com';
    }
    const notContainsValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'notContains');
    const notContainsValidationConstraint = getValidationConstraint_1.default(Class, propertyName, 'notContains');
    if (notContainsValidation) {
        sampleStringValue = notContainsValidationConstraint
            .split('')
            .map((character) => 'abcdefghijklmnopqrstuvwxyz'.split('').find((differentCharacter) => differentCharacter !== character))
            .join('');
    }
    const strongPasswordValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isStrongPassword');
    if (strongPasswordValidation) {
        sampleStringValue = isUpdate ? 'qweAT21=)(' : 'tttAO123%!=';
    }
    const postalCodeValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isPostalCode');
    if (postalCodeValidation) {
        const locale = getCustomValidationConstraint_1.default(Class, propertyName, 'isPostalCode', 1);
        sampleStringValue = getPostalCodeSampleValue_1.default(locale);
    }
    const creditCardExpirationValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isCreditCardExpiration');
    if (creditCardExpirationValidation) {
        sampleStringValue = isUpdate ? '12/99' : '11/99';
    }
    const cardVerificationCodeValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isCardVerificationCode');
    if (cardVerificationCodeValidation) {
        sampleStringValue = isUpdate ? '346' : '345';
    }
    const oneOfValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isOneOf');
    if (oneOfValidation) {
        sampleStringValue = getCustomValidationConstraint_1.default(Class, propertyName, 'isOneOf', 2);
    }
    const noneOfValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isNoneOf');
    if (noneOfValidation) {
        sampleStringValue = getCustomValidationConstraint_1.default(Class, propertyName, 'isNoneOf', 2);
    }
    const mobilePhoneValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMobilePhone');
    if (mobilePhoneValidation) {
        const locale = getValidationConstraint_1.default(Class, propertyName, 'isMobilePhone');
        sampleStringValue = getMobilePhoneNumberSampleValue_1.default(locale);
    }
    const phoneNumberValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isPhoneNumber');
    if (phoneNumberValidation) {
        const country = getValidationConstraint_1.default(Class, propertyName, 'isPhoneNumber');
        sampleStringValue = getPhoneNumberSampleValue_1.default(country);
    }
    const hasLengthAndMatchesValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'lengthAndMatches');
    if (hasLengthAndMatchesValidation) {
        const maxLengthConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'lengthAndMatches', 2);
        const regExpConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'lengthAndMatches', 3);
        if (exports.regExpToSampleStringMap[regExpConstraint]) {
            sampleStringValue = exports.regExpToSampleStringMap[regExpConstraint];
        }
        else {
            const randomRegExp = new randexp_1.default(regExpConstraint);
            randomRegExp.max = 10;
            sampleStringValue = randomRegExp.gen().slice(0, maxLengthConstraint);
            exports.regExpToSampleStringMap[regExpConstraint] = sampleStringValue;
        }
    }
    const hasLengthAndMatchesAllValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'lengthAndMatchesAll');
    if (hasLengthAndMatchesAllValidation) {
        const minLengthConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'lengthAndMatchesAll', 1);
        const maxLengthConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'lengthAndMatchesAll', 2);
        const regExpConstraints = getCustomValidationConstraint_1.default(Class, propertyName, 'lengthAndMatchesAll', 3);
        if (exports.regExpToSampleStringMap[regExpConstraints.join('')]) {
            sampleStringValue = exports.regExpToSampleStringMap[regExpConstraints.join('')];
        }
        else {
            sampleStringValue = regExpConstraints.reduce((sampleStringValue, regExp) => {
                const randomRegExp = new randexp_1.default(regExp);
                randomRegExp.max = 5;
                return sampleStringValue + randomRegExp.gen();
            }, '');
            while (sampleStringValue.length < minLengthConstraint) {
                sampleStringValue += sampleStringValue;
            }
            sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
            exports.regExpToSampleStringMap[regExpConstraints.join('')] = sampleStringValue;
        }
    }
    const hasMaxLengthAndMatchesValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'maxLengthAndMatches');
    if (hasMaxLengthAndMatchesValidation) {
        const maxLengthConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'maxLengthAndMatches', 1);
        const regExpConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'maxLengthAndMatches', 2);
        if (exports.regExpToSampleStringMap[regExpConstraint]) {
            sampleStringValue = exports.regExpToSampleStringMap[regExpConstraint];
        }
        else {
            const randomRegExp = new randexp_1.default(regExpConstraint);
            randomRegExp.max = 10;
            sampleStringValue = randomRegExp.gen().slice(0, maxLengthConstraint);
            exports.regExpToSampleStringMap[regExpConstraint] = sampleStringValue;
        }
    }
    const hasMaxLengthAndMatchesAllValidation = setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'maxLengthAndMatchesAll');
    if (hasMaxLengthAndMatchesAllValidation) {
        const maxLengthConstraint = getCustomValidationConstraint_1.default(Class, propertyName, 'maxLengthAndMatchesAll', 1);
        const regExpConstraints = getCustomValidationConstraint_1.default(Class, propertyName, 'maxLengthAndMatchesAll', 2);
        if (exports.regExpToSampleStringMap[regExpConstraints.join('')]) {
            sampleStringValue = exports.regExpToSampleStringMap[regExpConstraints.join('')];
        }
        else {
            sampleStringValue = regExpConstraints.reduce((sampleStringValue, regExp) => {
                const randomRegExp = new randexp_1.default(regExp);
                randomRegExp.max = 5;
                return sampleStringValue + randomRegExp.gen();
            }, '');
            sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
            exports.regExpToSampleStringMap[regExpConstraints.join('')] = sampleStringValue;
        }
    }
    const customValidationTestValue = setClassPropertyValidationDecorators_1.getClassPropertyCustomValidationTestValue(Class, propertyName);
    if (customValidationTestValue) {
        sampleStringValue = customValidationTestValue;
    }
    if (sampleStringValue === undefined &&
        !setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'isAnyString') &&
        !setClassPropertyValidationDecorators_1.doesClassPropertyContainCustomValidation(Class, propertyName, 'shouldBeTrueForEntity') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isAlpha') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isAlphanumeric') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isAscii') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isCurrency') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'IsFirebasePushId') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isHash') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isIdentityCard') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isMongoId') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isPassportNumber') &&
        !setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isRFC3339')) {
        throw new Error(Class.name +
            '.' +
            propertyName +
            ' needs have a string value validator or use @IsAnyString() annotation');
    }
    if (sampleStringValue === undefined) {
        sampleStringValue = isUpdate ? 'abcd' : 'abc';
    }
    const lowerCaseValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isLowercase');
    if (lowerCaseValidation) {
        sampleStringValue = sampleStringValue.toLowerCase();
    }
    const upperCaseValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isUppercase');
    if (upperCaseValidation) {
        sampleStringValue = sampleStringValue.toUpperCase();
    }
    const maxLengthValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'maxLength');
    if (maxLengthValidation) {
        const maxLengthConstraint = getValidationConstraint_1.default(Class, propertyName, 'maxLength');
        sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
    }
    const lengthValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'isLength');
    if (lengthValidation) {
        const minLengthConstraint = getValidationConstraint_1.default(Class, propertyName, 'isLength', 0);
        const maxLengthConstraint = getValidationConstraint_1.default(Class, propertyName, 'isLength', 1);
        while (sampleStringValue.length < minLengthConstraint) {
            sampleStringValue += sampleStringValue;
        }
        sampleStringValue = sampleStringValue.slice(0, maxLengthConstraint);
    }
    const minLengthValidation = setClassPropertyValidationDecorators_1.getPropertyValidationOfType(Class, propertyName, 'minLength');
    if (minLengthValidation) {
        const minLengthConstraint = getValidationConstraint_1.default(Class, propertyName, 'minLength');
        while (sampleStringValue.length < minLengthConstraint) {
            sampleStringValue += sampleStringValue;
        }
    }
    return sampleStringValue;
}
exports.default = getSampleStringValue;
//# sourceMappingURL=getSampleStringValue.js.map