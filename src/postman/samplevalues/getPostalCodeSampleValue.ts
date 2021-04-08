import RandExp from "randexp";
import { regExpToSampleStringMap } from "../getSampleStringValue";

export default function getPostalCodeSampleValue(locale: 'any' | ValidatorJS.PostalCodeLocale): string {
  const threeDigitRegExp = /^\d{3}$/;
  const fourDigitRegExp = /^\d{4}$/;
  const fiveDigitRegExp = /^\d{5}$/;
  const sixDigitRegExp = /^\d{6}$/;

  const localeToPostalCodeRegExpMap = {
    AD: /^AD\d{3}$/,
    AT: fourDigitRegExp,
    AU: fourDigitRegExp,
    AZ: /^AZ\d{4}$/,
    BE: fourDigitRegExp,
    BG: fourDigitRegExp,
    BR: /^\d{5}-\d{3}$/,
    BY: /2[1-4]\d{4}$/,
    CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    CH: fourDigitRegExp,
    CN: /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/,
    CZ: /^\d{3}\s?\d{2}$/,
    DE: fiveDigitRegExp,
    DK: fourDigitRegExp,
    DO: fiveDigitRegExp,
    DZ: fiveDigitRegExp,
    EE: fiveDigitRegExp,
    ES: /^(5[0-2]|[0-4]\d)\d{3}$/,
    FI: fiveDigitRegExp,
    FR: /^\d{2}\s?\d{3}$/,
    GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,
    GR: /^\d{3}\s?\d{2}$/,
    HR: /^([1-5]\d{4}$)/,
    HT: /^HT\d{4}$/,
    HU: fourDigitRegExp,
    ID: fiveDigitRegExp,
    IE: /^(?!.*(?:o))[A-z]\d[\dw]\s\w{4}$/i,
    IL: /^(\d{5}|\d{7})$/,
    IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,
    IR: /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
    IS: threeDigitRegExp,
    IT: fiveDigitRegExp,
    JP: /^\d{3}-\d{4}$/,
    KE: fiveDigitRegExp,
    LI: /^(948[5-9]|949[0-7])$/,
    LT: /^LT-\d{5}$/,
    LU: fourDigitRegExp,
    LV: /^LV-\d{4}$/,
    MX: fiveDigitRegExp,
    MT: /^[A-Za-z]{3}\s?\d{4}$/,
    MY: fiveDigitRegExp,
    NL: /^\d{4}\s?[a-z]{2}$/i,
    NO: fourDigitRegExp,
    NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i,
    NZ: fourDigitRegExp,
    PL: /^\d{2}-\d{3}$/,
    PR: /^00[679]\d{2}([ -]\d{4})?$/,
    PT: /^\d{4}-\d{3}?$/,
    RO: sixDigitRegExp,
    RU: sixDigitRegExp,
    SA: fiveDigitRegExp,
    SE: /^[1-9]\d{2}\s?\d{2}$/,
    SG: sixDigitRegExp,
    SI: fourDigitRegExp,
    SK: /^\d{3}\s?\d{2}$/,
    TH: fiveDigitRegExp,
    TN: fourDigitRegExp,
    TW: /^\d{3}(\d{2})?$/,
    UA: fiveDigitRegExp,
    US: /^\d{5}(-\d{4})?$/,
    ZA: fourDigitRegExp,
    ZM: fiveDigitRegExp,
  };

  if (locale === 'any') {
    return '12345';
  }

  const regExpStr = localeToPostalCodeRegExpMap[locale].toString();
  if (regExpToSampleStringMap[regExpStr]) {
    return  regExpToSampleStringMap[regExpStr];
  }

  const randExp = new RandExp(localeToPostalCodeRegExpMap[locale])
  const sampleValue = randExp.gen();
  regExpToSampleStringMap[regExpStr] = sampleValue;
  return sampleValue;
}
