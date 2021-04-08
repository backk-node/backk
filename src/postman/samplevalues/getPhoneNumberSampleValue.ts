// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import examples from 'libphonenumber-js/examples.mobile.json'
import { getExampleNumber } from 'libphonenumber-js'

export default function getPhoneNumberSampleValue(locale: string): string {
  const phoneNumber = getExampleNumber(locale as any, examples);
  return phoneNumber?.formatNational() ?? 'Invalid phone number locale'
}
