/* eslint-disable @typescript-eslint/camelcase */
import { LogEntry } from "./LogEntry";
import * as fs from "fs";
import tracerProvider from "../distributedtracinig/tracerProvider";
import getTimeZone from "../../utils/getTimeZone";
import getMicroserviceName from "../../utils/getMicroserviceName";
import { Values } from "../../constants/constants";

export const disallowedLogEntrySubStrings = [
  'username',
  'user_name',
  'user name',
  'displayname',
  'display_name',
  'display name',
  'lastname',
  'last_name',
  'last name',
  'surname',
  'firstname',
  'first_name',
  'first name',
  'fullname',
  'full_name',
  'full name',
  'phone',
  'fax',
  'email',
  'iban',
  'bankaccount',
  'bank_account',
  'bank account',
  'accountnumber',
  'account_number',
  'account number',
  'cardnumber',
  'card_number',
  'card number',
  'cardverif',
  'card_verif',
  'creditcard',
  'credit_card',
  'credit card',
  'driverslicense',
  'drivers_license',
  'drivers license',
  'passport',
  'pass port',
  'socialsecurity',
  'social_security',
  'social security',
  'licenseplate',
  'license_plate',
  'license plate',
  'numberplate',
  'number_plate',
  'number plate',
  'vechiclereg',
  'vehicle_reg',
  'vehicle reg',
  'birthdate',
  'birth_date',
  'birth date',
  'dateofbirth',
  'date_of_birth',
  'date of birth',
  'streetaddr',
  'street_addr',
  'street addr',
  'city',
  'zipcode',
  'zip_code',
  'zip code',
  'postal',
  'postcode',
  'post_code',
  'post code',
  'postalcode',
  'postal_code',
  'postal code',
  'jobtitle',
  'job_title',
  'job title',
  'jobposition',
  'job_position',
  'job position',
  'workplace',
  'jobdescription',
  'job_description',
  'job description',
  'company',
  'employee',
  'employer',
  'managername',
  'manager_name',
  'manager name',
  'managersname',
  'managers_name',
  'managers name',
  'supervisorname',
  'supervisor_name',
  'supervisor name',
  'supervisorsname',
  'supervisors_name',
  'supervisors name',
  'superior',
  'organization',
  'geoposition',
  'geo_position',
  'geo position',
  'gps',
  'geolocation',
  'geo_location',
  'geo location',
  'latitude',
  'longitude',
  'vehicleid',
  'vehicle_id',
  'vehicle id',
  'imei',
  'imsi',
  'msisdn',
  'url',
  'serialnumber',
  'serial_number',
  'serial number',
  'fingerprint',
  'finger_print',
  'finger print',
  'voiceprint',
  'voice_print',
  'voice print',
  'signature',
  'retina',
  'biometric',
  'faceimage',
  'face image',
  'facial',
  'face_image',
  'facephoto',
  'face_photo',
  'face photo',
  'medical',
  'idnumber',
  'id_number',
  'id number',
  'identificationnumber',
  'identification_number',
  'identification number',
  'identitynumber',
  'identity_number',
  'identity number',
  'insurancenumber',
  'insurance_number',
  'insurance number',
  'ethnic',
  'political_party',
  'politicalparty',
  'political party',
  'religion',
  'labour_union',
  'labor_union',
  'labor union',
  'labourunion',
  'laborunion',
  'labour union',
  'salary',
  'benefit',
  'genetic',
  ' ssn ',
  ' ssn: ',
  ' cvc ',
  ' cvc: ',
  ' cvv ',
  ' cvv: ',
  ' cvc2 ',
  ' cvc2: ',
  ' cvv2 ',
  ' cvv2: ',
  ' cav ',
  ' cav: ',
  ' cid ',
  ' cid: ',
  ' csc ',
  ' csc: ',
  ' cvd ',
  ' cvd: ',
  ' cve ',
  ' cve: ',
  ' cvn ',
  ' cvn: ',
  ' vin ',
  ' vin: ',
  'public ip',
  'client ip',
  'user ip',
  'public_ip',
  'client_ip',
  'user_ip',
  'secret',
  'cryptionkey',
  'cryption key',
  'cryption_key',
  'cryptkey',
  'crypt key',
  'crypt_key',
  'cipher',
  'authorizationcode',
  'authorization code',
  'authorization_code',
  'token',
  ' jwt ',
  ' jwt: ',
  'passwd',
  'password',
  'pass word',
  'pass_word',
  ' pwd ',
  ' pwd: ',
  'passphrase',
  'pass phrase',
  'pass_phrase'
];


export const logEntryWhitelist = [];

export enum Severity {
  DEBUG = 5,
  INFO = 9,
  WARN = 13,
  ERROR = 17,
  FATAL = 21
}

export const severityNameToSeverityMap: { [key: string]: number } = {
  DEBUG: Severity.DEBUG,
  INFO: Severity.INFO,
  WARN: Severity.WARN,
  ERROR: Severity.ERROR,
  FATAL: Severity.FATAL
};

const cwd = process.cwd();
const serviceName = getMicroserviceName();
const packageJson = fs.readFileSync(cwd + '/package.json', { encoding: 'UTF-8' });
const packageObj = JSON.parse(packageJson);

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'integration') {
  if (!process.env.NODE_NAME) {
    throw new Error('NODE_ENV environment variable must be defined');
  }

  if (!process.env.MICROSERVICE_NAMESPACE) {
    throw new Error('SERVICE_NAMESPACE environment variable must be defined');
  }

  if (!process.env.SERVICE_INSTANCE_ID) {
    throw new Error('SERVICE_INSTANCE_ID environment variable must be defined');
  }
}

let lastLoggedErrorName = '';
let lastLoggedTimeInMillis = Date.now();
let lastSpanId: string | undefined = '';

export default function log(
  severityNumber: Severity,
  name: string,
  body: string,
  attributes?: { [key: string]: string | number | boolean | undefined | object[] }
) {
  const minLoggingSeverityNumber = severityNameToSeverityMap[process.env.LOG_LEVEL ?? 'INFO'];
  const now = new Date();
  const spanId = tracerProvider
    .getTracer('default')
    .getCurrentSpan()
    ?.context().spanId;

  if (severityNumber >= minLoggingSeverityNumber) {
    const logEntry: LogEntry = {
      Timestamp: now.valueOf() + '000000',
      TraceId: tracerProvider
        .getTracer('default')
        .getCurrentSpan()
        ?.context().traceId,
      SpanId: spanId,
      TraceFlags: tracerProvider
        .getTracer('default')
        .getCurrentSpan()
        ?.context().traceFlags,
      SeverityText: Severity[severityNumber],
      SeverityNumber: severityNumber,
      Name: name,
      Body: body,
      Resource: {
        'service.name': serviceName,
        'service.namespace': process.env.MICROSERVICE_NAMESPACE ?? '',
        'service.instance.id': process.env.SERVICE_INSTANCE_ID ?? getMicroserviceName() + '-87ffab3-xx567',
        'service.version': packageObj.version,
        'node.name': process.env.NODE_NAME ?? ''
      },
      Attributes: {
        isoTimestamp: now.toISOString() + getTimeZone(),
        ...attributes
      }
    };

    const shouldNotLog = disallowedLogEntrySubStrings.some(
      (subPropertyName) =>
        name.toLowerCase().includes(subPropertyName) || body.toLowerCase().includes(subPropertyName)
    );

    const isWhiteListed = logEntryWhitelist.some(
      (whiteListedLogEntry) => name.includes(whiteListedLogEntry) || body.includes(whiteListedLogEntry)
    );

    if (shouldNotLog && !isWhiteListed) {
      return;
    }

    if (
      lastLoggedErrorName !== name ||
      Date.now() > lastLoggedTimeInMillis + Values._100 ||
      severityNumber !== Severity.ERROR ||
      spanId !== lastSpanId
    ) {
      console.log(logEntry);
    }

    lastLoggedErrorName = name;
    lastLoggedTimeInMillis = Date.now();
    lastSpanId = spanId;
  }
}

export function logError(error: Error) {
  log(Severity.ERROR, error.message, error.stack ?? '');
}
