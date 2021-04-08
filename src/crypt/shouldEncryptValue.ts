import typePropertyAnnotationContainer from '../decorators/typeproperty/typePropertyAnnotationContainer';

const subPropertyNamesWhoseValuesShouldBeEncrypted = [
  'username',
  'user_name',
  'address',
  'addr',
  'lastname',
  'last_name',
  'surname',
  'firstname',
  'first_name',
  'fullname',
  'full_name',
  'phone',
  'fax',
  'email',
  'iban',
  'bankaccount',
  'bank_account',
  'accountnumber',
  'account_number',
  'cardnumber',
  'card_number',
  'cardverif',
  'card_verif',
  'creditcard',
  'credit_card',
  'driverslicense',
  'drivers_license',
  'passport',
  'socialsecurity',
  'social_security',
  'licenseplate',
  'license_plate',
  'numberplate',
  'number_plate',
  'vechiclereg',
  'vehicle_reg',
  'birthdate',
  'birth_date',
  'dateofbirth',
  'date_of_birth',
  'city',
  'zipcode',
  'zip_code',
  'postcode',
  'post_code',
  'postalcode',
  'postal_code',
  'jobtitle',
  'job_title',
  'jobposition',
  'job_position',
  'workplace',
  'jobdescription',
  'job_description',
  'company',
  'employee',
  'employer',
  'manager',
  'supervisor',
  'superior',
  'organization',
  'geoposition',
  'geo_position',
  'gps',
  'geolocation',
  'geo_location',
  'latitude',
  'longitude',
  'vehicleid',
  'vehicle_id',
  'imei',
  'imsi',
  'msisdn',
  'url',
  'serialnumber',
  'serial_number',
  'fingerprint',
  'finger_print',
  'voiceprint',
  'voice_print',
  'signature',
  'retina',
  'biometric',
  'faceimage',
  'facial',
  'face_image',
  'facephoto',
  'face_photo',
  'medical',
  'idnumber',
  'id_number',
  'identificationnumber',
  'identification_number',
  'identitynumber',
  'identity_number',
  'insurancenumber',
  'insurance_number'
];

const propertyNamesWhoseValuesShouldBeEncrypted = [
  'user',
  'ssn',
  'cvc',
  'cvv',
  'cvc2',
  'cvv2',
  'cav',
  'cid',
  'csc',
  'cvd',
  'cve',
  'cvn',
  'age',
  'vin',
  'ip',
  'mac'
];

const entityPropertyNameToShouldEncryptValueMap: { [key: string]: boolean } = {};

export default function shouldEncryptValue(propertyName: string, EntityClass?: Function): boolean {
  if (
    EntityClass &&
    entityPropertyNameToShouldEncryptValueMap[`${EntityClass.name}${propertyName}`] !== undefined
  ) {
    return entityPropertyNameToShouldEncryptValueMap[`${EntityClass.name}${propertyName}`];
  }

  const shouldEncryptValue = propertyName.endsWith('Ip') ||
    (EntityClass && typePropertyAnnotationContainer.isTypePropertyEncrypted(EntityClass, propertyName)) ||
    (subPropertyNamesWhoseValuesShouldBeEncrypted.some(
      (subPropertyName) =>
        propertyName.toLowerCase().includes(subPropertyName) ||
        propertyNamesWhoseValuesShouldBeEncrypted.some(
          (otherPropertyName) => propertyName.toLowerCase() === otherPropertyName
        )
    ) &&
      (!EntityClass ||
        (EntityClass &&
          !typePropertyAnnotationContainer.isTypePropertyNotEncrypted(EntityClass, propertyName))));

  if (EntityClass && EntityClass.name) {
    entityPropertyNameToShouldEncryptValueMap[`${EntityClass.name}${propertyName}`] = shouldEncryptValue;
  }

  return shouldEncryptValue;
}
