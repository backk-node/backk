import decrypt from './decrypt';
import encrypt from './encrypt';

describe('decrypt', () => {
  it('should decrypt encrypted value with random initialization vector', () => {
    // GIVEN
    const encryptedValue = encrypt('4');

    // WHEN
    const decryptedValue = decrypt(encryptedValue);

    // THEN
    expect(decryptedValue).toEqual('4');
  });

  it('should decrypt encrypted value with fixed initialization vector', () => {
    // GIVEN
    const encryptedValue = encrypt('4234 1111 1111 1111', false);
    const encryptedValue2 = encrypt('4234 1111 1111 1111', false);

    // WHEN
    const decryptedValue = decrypt(encryptedValue);

    // THEN
    expect(decryptedValue).toEqual('4234 1111 1111 1111');
    expect(encryptedValue).toEqual(encryptedValue2);
  });
});
